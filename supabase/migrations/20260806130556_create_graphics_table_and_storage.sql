/*
# Create graphics table and storage bucket for HH Goa 2026 photo tool

## Overview
Sets up the database table and storage bucket needed to persist generated
branded graphics (PFP frames and Builder ID cards) so they can be shared
via X with proper OG-image link previews.

## New Tables
- `graphics`
  - `id` (uuid, primary key) — uniquely identifies a generated graphic
  - `format` (text, not null) — either 'pfp' or 'card'
  - `name` (text) — user's display name (card format only, nullable for pfp)
  - `stack` (text) — user's stack/role (card format only, nullable for pfp)
  - `title` (text) — generated builder title (card format only, nullable for pfp)
  - `caption` (text) — the pre-filled tweet caption used for sharing
  - `image_path` (text, not null) — storage path of the generated PNG, e.g. '<uuid>.png'
  - `created_at` (timestamptz) — when the graphic was created

## Storage
- Creates a public bucket named `graphics` for storing generated PNG images.

## Security
- RLS enabled on `graphics` table.
- Public CRUD (anon + authenticated) because this is a no-auth tool — anyone
  can upload a graphic and read any graphic (needed for share link previews).
- Storage policies allow anon to upload and read objects in the `graphics` bucket.

## Notes
1. No user_id / auth integration — this is a no-login tool by design.
2. Images are stored as `<id>.png` in the graphics bucket.
3. The share edge function reads from this table to generate OG meta tags.
*/

CREATE TABLE IF NOT EXISTS graphics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  format text NOT NULL CHECK (format IN ('pfp', 'card')),
  name text,
  stack text,
  title text,
  caption text,
  image_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE graphics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_graphics" ON graphics;
CREATE POLICY "anon_select_graphics" ON graphics FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_graphics" ON graphics;
CREATE POLICY "anon_insert_graphics" ON graphics FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_graphics" ON graphics;
CREATE POLICY "anon_update_graphics" ON graphics FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_graphics" ON graphics;
CREATE POLICY "anon_delete_graphics" ON graphics FOR DELETE
  TO anon, authenticated USING (true);

-- Storage bucket for generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('graphics', 'graphics', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: allow anon to upload and read
DROP POLICY IF EXISTS "anon_upload_graphics" ON storage.objects;
CREATE POLICY "anon_upload_graphics" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'graphics');

DROP POLICY IF EXISTS "anon_read_graphics" ON storage.objects;
CREATE POLICY "anon_read_graphics" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'graphics');

DROP POLICY IF EXISTS "anon_delete_graphics_storage" ON storage.objects;
CREATE POLICY "anon_delete_graphics_storage" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'graphics');
