# Moodle (alternative)

Heavier but stronger for enterprise HR/compliance LMS. Use if Frappe batches are not enough.

```bash
cd academy/moodle
cp .env.example .env   # set passwords
docker compose up -d   # http://localhost:8080
```

See Bitnami Moodle docs for plugins (custom certificates, LDAP, etc.).
