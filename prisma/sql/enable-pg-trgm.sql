-- Optional: run once on PostgreSQL for typo-tolerant search (pg_trgm)
-- npx prisma db execute --file prisma/sql/enable-pg-trgm.sql

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS product_name_trgm_idx ON "Product" USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS product_short_desc_trgm_idx ON "Product" USING gin ("shortDescription" gin_trgm_ops);
