-- Run this in Supabase SQL Editor before deploying v2 code

-- Post revision history (Phase 7)
create table post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  title text,
  body text,
  excerpt text,
  saved_at timestamptz default now()
);

create index idx_revisions_post on post_revisions(post_id);

-- FAQ items per post, for FAQ schema / featured snippets (Phase 8)
alter table posts add column if not exists faq jsonb default '[]';

-- Storage bucket for the media library (Phase 5)
-- Note: run this part in Supabase Dashboard > Storage > New Bucket instead of SQL,
-- since bucket creation isn't a plain SQL operation. Settings:
--   Name: post-images
--   Public bucket: YES (so uploaded images are viewable without auth)
