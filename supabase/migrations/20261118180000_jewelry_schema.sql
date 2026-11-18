-- Fatlum Jewelry schema.
-- Prefix jewelry_ keeps this off the gold tables public.products,
-- public.order_requests and public.order_request_items.
-- Apply by hand in the Fatlum Development project. The app does not run it.
-- Safe to run again: tables use IF NOT EXISTS, policies are dropped and recreated.

create extension if not exists pgcrypto;

create table if not exists jewelry_categories (
  slug text primary key,
  name_de text not null,
  name_en text not null,
  description_de text not null,
  description_en text not null,
  kind text not null check (kind in ('ring', 'jewelry')),
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists jewelry_products (
  slug text primary key,
  sku text not null unique,
  category_slug text not null references jewelry_categories (slug),
  name_de text not null,
  name_en text not null,
  description_de text not null,
  description_en text not null,
  metal_group text not null check (metal_group in ('gold', 'silver', 'platinum', 'palladium')),
  metal_de text not null,
  metal_en text not null,
  alloy_de text not null,
  alloy_en text not null,
  width_mm numeric,
  size_min int,
  size_max int,
  lead_de text not null,
  lead_en text not null,
  glyph text not null check (glyph in ('band', 'solitaire', 'pave', 'signet', 'stack', 'chain', 'hoop', 'stud', 'drop', 'locket')),
  tone text not null check (tone in ('yellow', 'white', 'rose', 'red', 'platinum', 'silver', 'palladium')),
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists jewelry_profiles (
  code text primary key,
  name_de text not null,
  name_en text not null,
  description_de text not null,
  description_en text not null,
  svg_path text not null,
  min_width_mm numeric not null,
  max_width_mm numeric not null,
  min_height_mm numeric not null,
  max_height_mm numeric not null,
  area_factor numeric not null,
  allows_groove boolean not null default false,
  allows_stones boolean not null default false,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists jewelry_alloys (
  code text primary key,
  metal_group text not null check (metal_group in ('gold', 'silver', 'platinum', 'palladium')),
  fineness text not null,
  color_de text not null,
  color_en text not null,
  hex_color text not null,
  density numeric not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists jewelry_finishes (
  code text primary key,
  name_de text not null,
  name_en text not null,
  description_de text not null,
  description_en text not null,
  preview text not null check (preview in ('polish', 'matte', 'brush', 'hammer', 'ice', 'sand')),
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists jewelry_stone_settings (
  code text primary key,
  name_de text not null,
  name_en text not null,
  description_de text not null,
  description_en text not null,
  min_count int not null,
  max_count int not null,
  min_size_mm numeric not null,
  max_size_mm numeric not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists jewelry_engraving_fonts (
  code text primary key,
  name_de text not null,
  name_en text not null,
  css_family text not null,
  variant text not null check (variant in ('serif', 'script', 'sans', 'caps')),
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists jewelry_groove_types (
  code text primary key,
  name_de text not null,
  name_en text not null,
  min_width_mm numeric not null,
  max_width_mm numeric not null,
  min_depth_mm numeric not null,
  max_depth_mm numeric not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table if not exists jewelry_sizes (
  size_mm int primary key check (size_mm between 44 and 74),
  is_active boolean not null default true
);

create table if not exists jewelry_inquiries (
  id uuid primary key default gen_random_uuid(),
  locale text not null default 'de' check (locale in ('de', 'en')),
  source text not null default 'request_list' check (source in ('request_list', 'contact')),
  name text not null,
  company text,
  email text not null,
  phone text,
  message text,
  consent_at timestamptz not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists jewelry_inquiry_items (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references jewelry_inquiries (id) on delete cascade,
  position int not null default 0,
  item_type text not null check (item_type in ('product', 'configuration')),
  sku text not null,
  name_de text not null,
  name_en text not null,
  quantity int not null check (quantity between 1 and 10),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists jewelry_products_category_idx on jewelry_products (category_slug);
create index if not exists jewelry_inquiries_created_idx on jewelry_inquiries (created_at desc);
create index if not exists jewelry_inquiry_items_inquiry_idx on jewelry_inquiry_items (inquiry_id);

alter table jewelry_categories enable row level security;
alter table jewelry_products enable row level security;
alter table jewelry_profiles enable row level security;
alter table jewelry_alloys enable row level security;
alter table jewelry_finishes enable row level security;
alter table jewelry_stone_settings enable row level security;
alter table jewelry_engraving_fonts enable row level security;
alter table jewelry_groove_types enable row level security;
alter table jewelry_sizes enable row level security;
alter table jewelry_inquiries enable row level security;
alter table jewelry_inquiry_items enable row level security;

alter table jewelry_categories force row level security;
alter table jewelry_products force row level security;
alter table jewelry_profiles force row level security;
alter table jewelry_alloys force row level security;
alter table jewelry_finishes force row level security;
alter table jewelry_stone_settings force row level security;
alter table jewelry_engraving_fonts force row level security;
alter table jewelry_groove_types force row level security;
alter table jewelry_sizes force row level security;
alter table jewelry_inquiries force row level security;
alter table jewelry_inquiry_items force row level security;

-- Catalog: anonymous read of active rows only. No writes.
do $$
declare
  t text;
begin
  foreach t in array array[
    'jewelry_categories', 'jewelry_products', 'jewelry_profiles', 'jewelry_alloys',
    'jewelry_finishes', 'jewelry_stone_settings', 'jewelry_engraving_fonts',
    'jewelry_groove_types', 'jewelry_sizes'
  ]
  loop
    execute format('revoke all on table %I from public, anon, authenticated', t);
    execute format('grant select on table %I to anon, authenticated', t);
    execute format('drop policy if exists %I on %I', t || '_public_read', t);
    execute format(
      'create policy %I on %I for select to anon, authenticated using (is_active = true)',
      t || '_public_read', t
    );
  end loop;
end $$;

-- Inquiries: anonymous insert only. No select, update or delete.
revoke all on table jewelry_inquiries from public, anon, authenticated;
grant insert on table jewelry_inquiries to anon, authenticated;
drop policy if exists jewelry_inquiries_anon_insert on jewelry_inquiries;
create policy jewelry_inquiries_anon_insert on jewelry_inquiries
  for insert to anon, authenticated
  with check (
    status = 'new'
    and locale in ('de', 'en')
    and source in ('request_list', 'contact')
    and char_length(name) between 2 and 200
    and char_length(email) between 5 and 254
    and consent_at is not null
  );

revoke all on table jewelry_inquiry_items from public, anon, authenticated;
grant insert on table jewelry_inquiry_items to anon, authenticated;
drop policy if exists jewelry_inquiry_items_anon_insert on jewelry_inquiry_items;
create policy jewelry_inquiry_items_anon_insert on jewelry_inquiry_items
  for insert to anon, authenticated
  with check (
    quantity between 1 and 10
    and item_type in ('product', 'configuration')
    and char_length(name_de) > 0
    and char_length(name_en) > 0
    and char_length(sku) > 0
  );
