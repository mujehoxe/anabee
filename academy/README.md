# ANABEE Academy — Frappe Learning

**[Frappe Learning](https://github.com/frappe/lms)** is our LMS: modern UX, light Docker deploy, video lessons, batches (org cohorts), quizzes, and certificates.

## Why Frappe over Moodle

| | Frappe Learning | Moodle |
|---|---|---|
| **UX** | Clean Vue UI, simple course builder | Powerful but dated admin |
| **Deploy** | `docker compose up` | Heavier Bitnami stack |
| **Certs** | Built-in templates | Plugin required |
| **Cohorts** | Batches per course | Cohorts (more enterprise) |
| **Best for** | Branded video academies | Deep corporate HR LMS |

Moodle remains available in `academy/moodle/` if enterprise compliance needs grow.

## Quick start

```bash
cp academy/.env.example academy/.env   # optional — defaults work locally
npm run academy:up
npm run academy:logs                   # watch first-time install
```

Open **http://localhost:8000/lms**

- **Username:** `Administrator`
- Local default login is Frappe’s stock local admin (see [Frappe Learning docs](https://github.com/frappe/lms)); change it before any public deploy.

First boot runs `bench init` + LMS install (~10–15 minutes). Later restarts are quick.

## Production (learn.anabee.org)

Use the official production image (~5 min). Pass your ops contact via env (do not hardcode mailbox passwords in the repo):

```bash
wget https://frappe.io/easy-install.py
python3 ./easy-install.py deploy \
  --project=anabee_academy \
  --email="${ACADEMY_CONTACT_EMAIL}" \
  --image=ghcr.io/frappe/lms \
  --version=stable \
  --app=lms \
  --sitename learn.anabee.org
```

Then set `lmsUrl` in `site/academy.config.json` to `https://learn.anabee.org/lms`.

## ANABEE course structure

```
ANABEE Academy
├── Batch: ADNOC Club A (2026 season)
├── Batch: Partner Corp — Facilities team
└── Courses (7 Pillars + Leadership)
    ├── Air Stewardship        → chapters → video lessons → quiz → certificate
    ├── Water Governance
    └── …
```

## Customize branding

1. Site Settings → upload ANABEE logo
2. Create certificate template with pillar badge + org name
3. Enable batches for each partner organization
4. Add video lessons per chapter (MP4 upload or embed)

## Site integration

- Catalog & marketing: `site/academy.html`
- Config (courses, URLs): `site/academy.config.json`
