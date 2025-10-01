-- Schema for ECHO 4.0
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamp with time zone default now(),
  last_seen timestamp with time zone
);

create table if not exists recipients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  email text not null,
  created_at timestamp with time zone default now()
);

create type message_type as enum ('text','audio','video','file');
create type delivery_mode as enum ('date','heartbeat');
create type message_status as enum ('draft','scheduled','delivered');

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text,
  type message_type not null,
  content text,
  attachment_url text,
  delivery_mode delivery_mode not null,
  delivery_date timestamp with time zone,
  password_hash text,
  ttl_seconds int,
  view_limit int,
  status message_status default 'draft'::message_status,
  created_at timestamp with time zone default now()
);

create table if not exists message_recipients (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages(id) on delete cascade not null,
  recipient_id uuid references recipients(id) on delete cascade not null
);

create table if not exists heartbeats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  last_ping timestamp with time zone,
  interval_days int not null default 7
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  message_id uuid references messages(id) on delete set null,
  event_type text not null,
  details jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists shares (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages(id) on delete cascade not null,
  token text unique not null,
  expires_at timestamp with time zone,
  max_views int,
  views int default 0,
  password_hash text
);
