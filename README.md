# Locario
Web app for browse locations

## Docker & PostgreSQL DB

```
cd docker/
docker compose down -v
docker compose up -d
```

DB backup
```
docker compose exec -T db pg_dump -U postgres --no-owner --no-privileges --no-comments locario_db \
  | grep -Ev '^--|^$' > backup.sql
```

## Frontend and Backend start in each directory
```
npm run dev
```