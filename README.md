# Locario
Web app for browse locations

## App initialization

```
cd docker/
docker compose up --build
```

## DB backup

```
docker compose exec -T db pg_dump -U postgres --no-owner --no-privileges --no-comments locario_db \
  | grep -Ev '^--|^$' > backup.sql
```