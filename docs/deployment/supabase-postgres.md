# Supabase Postgres Readiness

Sprint 25 documents Supabase readiness. It does not connect to a real Supabase project.

## Backend Support

The backend reads database connection from:

```env
DATABASE_URL=
```

Local SQLite remains supported for development and tests. Production-like deployment should use Supabase Postgres.

The backend requirements include:

```text
SQLAlchemy
psycopg[binary]
alembic
```

## Connection String

In Supabase:

1. Open project settings.
2. Go to database connection information.
3. Copy the Postgres connection string.
4. Put it into Render as `DATABASE_URL`.
5. Never commit it.

Supabase may provide direct and pooler connection strings. For this project production deployment, use the pooler connection string in Render `DATABASE_URL`.

Do not use this direct host format in Render:

```text
db.<project-ref>.supabase.co
```

The direct host previously caused IPv6/network issues from the deployment environment.

Do not write the full real `DATABASE_URL` in docs, chat, screenshots, or commit messages. Use placeholder format only:

```env
DATABASE_URL=<supabase-pooler-postgres-url>
```

If the database password was exposed or may have been pasted into chat, rotate it in Supabase, then update Render `DATABASE_URL` with the new pooler URL.

## Migrations

Run migrations from the deployed backend environment or a trusted one-off shell:

```bash
python -m alembic upgrade head
```

Do not run migrations from an untrusted machine with production credentials.

## Seed Data

`python -m scripts.seed_dev` is suitable for local demo/staging seed content only. Do not treat it as production content management.
