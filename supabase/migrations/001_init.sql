-- Supabase/Postgres migration converted from MSSQL SchemaPawRescue
-- Converts Mode, Gender, Type, CatStatus, CageStatus into Postgres enums
-- Creates tables and foreign keys, and inserts initial enum/data

-- Drop in reverse order to allow re-run during development
DROP TABLE IF EXISTS "treatment" CASCADE;
DROP TABLE IF EXISTS "transactions" CASCADE;
DROP TABLE IF EXISTS "revenue" CASCADE;
DROP TABLE IF EXISTS "donations" CASCADE;
DROP TABLE IF EXISTS "cats" CASCADE;
DROP TABLE IF EXISTS "cage" CASCADE;
DROP TABLE IF EXISTS "ward" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "internal_role" CASCADE;
DROP TABLE IF EXISTS "externals" CASCADE;

DROP TYPE IF EXISTS mode_enum CASCADE;
DROP TYPE IF EXISTS gender_enum CASCADE;
DROP TYPE IF EXISTS type_enum CASCADE;
DROP TYPE IF EXISTS cat_status_enum CASCADE;
DROP TYPE IF EXISTS cage_status_enum CASCADE;

-- Create enums (values inferred from original MSSQL seed data)
CREATE TYPE mode_enum AS ENUM ('Online','Cash');
CREATE TYPE gender_enum AS ENUM ('Male','Female');
CREATE TYPE type_enum AS ENUM ('Pet','Rescued','Stray');

CREATE TYPE cat_status_enum AS ENUM (
  'Expired',
  'Move to healthy area',
  'Adopted',
  'Discharged',
  'Under Treatment',
  'Ready to discharge',
  'Fostered',
  'Healthy in lower portion',
  'Under observation',
  'Missing',
  'Ready to move H.A'
);

CREATE TYPE cage_status_enum AS ENUM ('Occupied','Free','Transferred');

-- Core lookup / entity tables
CREATE TABLE externals (
  external_id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_num TEXT NOT NULL,
  address TEXT
);

CREATE TABLE internal_role (
  internal_role_id BIGSERIAL PRIMARY KEY,
  role_desc TEXT NOT NULL
);

CREATE TABLE users (
  user_id BIGSERIAL PRIMARY KEY,
  user_name TEXT,
  email TEXT,
  password TEXT,
  internal_role_id BIGINT REFERENCES internal_role(internal_role_id) ON DELETE SET NULL
);

CREATE TABLE ward (
  ward_id BIGSERIAL PRIMARY KEY,
  name TEXT,
  code TEXT,
  capacity_cages INTEGER
);

CREATE TABLE cage (
  cage_id BIGSERIAL PRIMARY KEY,
  ward_id BIGINT REFERENCES ward(ward_id) ON DELETE SET NULL,
  cage_status cage_status_enum,
  date DATE,
  cage_no INTEGER
);

CREATE TABLE cats (
  cat_id BIGSERIAL PRIMARY KEY,
  cat_name TEXT,
  age NUMERIC(3,2),
  gender gender_enum,
  type type_enum,
  cage_id BIGINT REFERENCES cage(cage_id) ON DELETE SET NULL,
  external_id BIGINT REFERENCES externals(external_id) ON DELETE SET NULL,
  status cat_status_enum,
  admitted_on DATE
);

CREATE TABLE donations (
  donation_id BIGSERIAL PRIMARY KEY,
  donor_id BIGINT REFERENCES externals(external_id) ON DELETE SET NULL,
  mode mode_enum,
  amount INTEGER,
  date DATE
);

CREATE TABLE revenue (
  revenue_id BIGSERIAL PRIMARY KEY,
  buyer_id BIGINT REFERENCES externals(external_id) ON DELETE SET NULL,
  mode mode_enum,
  date DATE,
  amount INTEGER,
  remarks TEXT
);

CREATE TABLE transactions (
  transaction_id BIGSERIAL PRIMARY KEY,
  mode mode_enum,
  amount INTEGER,
  bill_for TEXT,
  date DATE,
  remarks TEXT
);

CREATE TABLE treatment (
  treatment_id BIGSERIAL PRIMARY KEY,
  cat_id BIGINT REFERENCES cats(cat_id) ON DELETE SET NULL,
  user_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
  date_time TIMESTAMPTZ,
  temperature TEXT,
  treatment TEXT
);

-- Seed initial lookup data (converted from MSSQL inserts)
-- The enum types already contain the lookup values converted from the original tables

-- Seed internal roles and a sample user (converted from original data)
INSERT INTO internal_role (internal_role_id, role_desc) VALUES (1, 'Administrator') ON CONFLICT DO NOTHING;
INSERT INTO internal_role (internal_role_id, role_desc) VALUES (2, 'Moderator') ON CONFLICT DO NOTHING;
INSERT INTO internal_role (internal_role_id, role_desc) VALUES (3, 'Surgeon') ON CONFLICT DO NOTHING;

INSERT INTO externals (external_id, name, contact_num, address) VALUES (1, 'Seed External', '0000000000', NULL) ON CONFLICT DO NOTHING;
INSERT INTO users (user_id, user_name, email, password, internal_role_id) VALUES (1, 'Ahmed Bilal', 'crazy_bilal@gmail.com', 'bilal', 1) ON CONFLICT DO NOTHING;

-- Add helpful comments for Supabase usage
COMMENT ON TYPE mode_enum IS 'Donation/Transaction mode (converted from MSSQL Mode table)';
COMMENT ON TYPE gender_enum IS 'Gender of animals (converted from MSSQL Gender table)';
COMMENT ON TYPE type_enum IS 'Animal type (converted from MSSQL Type table)';
COMMENT ON TYPE cat_status_enum IS 'Status of cats (converted from MSSQL CatStatus table)';
COMMENT ON TYPE cage_status_enum IS 'Status of cages (converted from MSSQL cageStatus table)';

-- Suggestion: enable RLS and add policies in Supabase dashboard for tables that should be restricted.

-- END migration
