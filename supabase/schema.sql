-- ─────────────────────────────────────────────
-- Travel Log — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ─────────────────────────────────────────────

-- Countries table
CREATE TABLE IF NOT EXISTS countries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  code             text NOT NULL UNIQUE,  -- ISO 3166-1 alpha-2 (e.g. "JP")
  region           text NOT NULL,         -- "Asia" | "Europe" | "Americas" | "Africa" | "Oceania" | "Middle East"
  photo_url        text,
  with_wife        boolean NOT NULL DEFAULT false,
  first_visit_date date,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  country_id       uuid NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  country_name     text NOT NULL,
  photo_url        text,
  with_wife        boolean NOT NULL DEFAULT false,
  trip_type        text NOT NULL CHECK (trip_type IN ('Solo', 'Business', 'Family', 'Couple')),
  visit_date_start date NOT NULL,
  visit_date_end   date,
  notes            text,
  latitude         numeric(9,6),
  longitude        numeric(9,6),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS cities_country_id_idx ON cities(country_id);
CREATE INDEX IF NOT EXISTS cities_trip_type_idx ON cities(trip_type);
CREATE INDEX IF NOT EXISTS cities_visit_date_idx ON cities(visit_date_start DESC);
CREATE INDEX IF NOT EXISTS countries_region_idx ON countries(region);
CREATE INDEX IF NOT EXISTS countries_with_wife_idx ON countries(with_wife);

-- Row Level Security
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- Policies: only authenticated users can access
CREATE POLICY "Authenticated access" ON countries
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated access" ON cities
  FOR ALL USING (auth.role() = 'authenticated');
