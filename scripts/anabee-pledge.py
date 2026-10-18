#!/usr/bin/env python3
"""Voluntary 7-second ANABEE pledge upload.

Stores only what the person submits. Does not verify speech, identity,
or environmental impact.
"""
from __future__ import annotations

import json
import re
import secrets
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path("/var/lib/anabee/pledges")
INDEX = Path("/var/lib/anabee/index.json")
MAX_BYTES = 8 * 1024 * 1024
PILLARS = {"air", "water", "soil", "energy", "food", "plant", "animal"}
PLACES = {
    "restaurant",
    "hotel",
    "street",
    "transit",
    "worship",
    "wedding",
    "stadium",
    "other",
}
USER_RE = re.compile(r"^[a-z0-9]{6,16}$")
LOCK = threading.Lock()
RATE: dict[str, list[float]] = {}


def clean_text(value: str, limit: int) -> str:
    text = " ".join((value or "").replace("<", "").replace(">", "").split())
    return text[:limit]


def load_index() -> list[dict]:
    if not INDEX.exists():
        return []
    try:
        data = json.loads(INDEX.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    return data if isinstance(data, list) else []


def public_row(row: dict) -> dict:
    out = {
        "id": row["id"],
        "userId": row["userId"],
        "name": row["name"],
        "pillar": row["pillar"],
        "place": row["place"],
        "love": row.get("love") or "",
        "created": row["created"],
        "filename": row["filename"],
        "video": f"/api/pledge/{row['id']}/video",
        "consent": "voluntary personal pledge — not an endorsement",
    }
    if row.get("city"):
        out["city"] = row["city"]
    if row.get("lat") is not None and row.get("lng") is not None:
        out["lat"] = row["lat"]
        out["lng"] = row["lng"]
    return out


class Handler(BaseHTTPRequestHandler):
    server_version = "anabee-pledge/1.0"

    def log_message(self, fmt: str, *args) -> None:
        print("%s - %s" % (self.address_string(), fmt % args))

    def _send(self, code: int, body: bytes, content_type: str) -> None:
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def _json(self, code: int, obj: dict) -> None:
        raw = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self._send(code, raw, "application/json; charset=utf-8")

    def _client_ip(self) -> str:
        forwarded = self.headers.get("X-Real-IP", "")
        return forwarded.split(",")[0].strip() or self.client_address[0]

    def _limited(self) -> bool:
        now = time.time()
        ip = self._client_ip()
        with LOCK:
            hits = [t for t in RATE.get(ip, []) if now - t < 3600]
            if len(hits) >= 8:
                RATE[ip] = hits
                return True
            hits.append(now)
            RATE[ip] = hits
        return False

    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == "/api/voices":
            with LOCK:
                rows = [public_row(row) for row in load_index()]
            self._json(200, {"voices": rows, "count": len(rows), "note": "Voluntary pledges only. Speech is not verified."})
            return
        if path == "/api/health":
            self._json(200, {"ok": True})
            return
        match = re.fullmatch(r"/api/pledge/([a-f0-9]{16})/video", path)
        if match:
            pledge_id = match.group(1)
            with LOCK:
                row = next((item for item in load_index() if item["id"] == pledge_id), None)
            if not row:
                self._json(404, {"error": "not found"})
                return
            file_path = ROOT / row["stored"]
            if not file_path.is_file():
                self._json(404, {"error": "missing file"})
                return
            data = file_path.read_bytes()
            media = "video/mp4" if row["stored"].endswith(".mp4") else "video/webm"
            self._send(200, data, media)
            return
        self._json(404, {"error": "not found"})

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path != "/api/pledge":
            self._json(404, {"error": "not found"})
            return
        if self._limited():
            self._json(429, {"error": "Recording limit reached. Try again in an hour."})
            return
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length <= 1000 or length > MAX_BYTES:
            self._json(400, {"error": "Video size is not accepted. The limit is 8 MB."})
            return
        ctype = (self.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        if ctype == "video/mp4":
            ext = "mp4"
        elif ctype in {"video/webm", "application/octet-stream"}:
            ext = "webm"
            ctype = "video/webm"
        else:
            self._json(400, {"error": "The file must be a video."})
            return
        qs = parse_qs(parsed.query, keep_blank_values=False)
        def one(key: str) -> str:
            return (qs.get(key) or [""])[0]

        if one("consent") != "1":
            self._json(400, {"error": "Voluntary publishing consent is required."})
            return
        name = clean_text(one("name"), 40)
        love = clean_text(one("love"), 80)  # optional; spoken in the video as "… + ANABEE"
        city = clean_text(one("city"), 60)
        pillar = one("pillar")
        place = one("place")
        if not name or pillar not in PILLARS or place not in PLACES:
            self._json(400, {"error": "Name, pillar, and place are required."})
            return
        user_id = one("userId").lower()
        if not USER_RE.match(user_id):
            user_id = "ab" + secrets.token_hex(4)
        lat = lng = None
        if one("lat") and one("lng"):
            try:
                lat_v = round(float(one("lat")), 5)
                lng_v = round(float(one("lng")), 5)
            except ValueError:
                self._json(400, {"error": "The coordinates are not valid."})
                return
            if not (-90 <= lat_v <= 90 and -180 <= lng_v <= 180):
                self._json(400, {"error": "The coordinates are out of range."})
                return
            lat, lng = lat_v, lng_v
        body = self.rfile.read(length)
        if len(body) < 1000:
            self._json(400, {"error": "The video is empty."})
            return
        pledge_id = secrets.token_hex(8)
        stored = f"{pledge_id}.{ext}"
        filename = f"{user_id}_{pillar}_{place}_7sec.{ext}"
        row = {
            "id": pledge_id,
            "userId": user_id,
            "name": name,
            "pillar": pillar,
            "place": place,
            "love": love,
            "city": city,
            "lat": lat,
            "lng": lng,
            "created": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "filename": filename,
            "stored": stored,
            "bytes": len(body),
            "verifiedSpeech": False,
        }
        ROOT.mkdir(parents=True, exist_ok=True)
        (ROOT / stored).write_bytes(body)
        with LOCK:
            items = load_index()
            clash = 1
            names = {item["filename"] for item in items}
            while filename in names:
                clash += 1
                filename = f"{user_id}_{pillar}_{place}_7sec_{clash}.{ext}"
            row["filename"] = filename
            items.append(row)
            INDEX.write_text(json.dumps(items, ensure_ascii=False, indent=2), encoding="utf-8")
        self._json(201, {"ok": True, "pledge": public_row(row), "userId": user_id})


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    if not INDEX.exists():
        INDEX.write_text("[]\n", encoding="utf-8")
    server = ThreadingHTTPServer(("127.0.0.1", 8787), Handler)
    print("anabee pledge listening on 127.0.0.1:8787", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
