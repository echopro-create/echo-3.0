-- Пример схемы (минимум). Выполните в Supabase SQL Editor.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamp with time zone default now()
);

create table if not exists recipients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  email text,
  created_at timestamp with time zone default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  kind text check (kind in ('text','audio','video','files')) not null,
  content text, -- для текста; для media используйте files таблицу
  delivery_mode text check (delivery_mode in ('heartbeat','date')) not null default 'heartbeat',
  deliver_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table if not exists message_files (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages(id) on delete cascade,
  path text not null,
  mime text,
  bytes bigint
);

create table if not exists heartbeats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  last_ping timestamp with time zone default now(),
  interval_hours int default 72
);

create table if not exists share_links (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references messages(id) on delete cascade,
  token text unique not null,
  password_hash text,
  ttl_hours int default 48,
  max_views int default 5,
  views int default 0,
  created_at timestamp with time zone default now()
);

-- RLS
alter table profiles enable row level security;
alter table recipients enable row level security;
alter table messages enable row level security;
alter table message_files enable row level security;
alter table heartbeats enable row level security;
alter table share_links enable row level security;

create policy "user_is_self" on profiles
for select using (auth.uid() = id);

create policy "own_recipients" on recipients
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_messages" on messages
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own_files" on message_files
for all using (
  exists (select 1 from messages m where m.id = message_files.message_id and m.user_id = auth.uid())
) with check (
  exists (select 1 from messages m where m.id = message_files.message_id and m.user_id = auth.uid())
);

create policy "own_heartbeats" on heartbeats
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- share_links выборочно: публичный просмотр по токену обрабатывается через отдельный edge-функционал/роут
create policy "owner_manage_share_links" on share_links
for all using (
  exists (select 1 from messages m where m.id = share_links.message_id and m.user_id = auth.uid())
) with check (
  exists (select 1 from messages m where m.id = share_links.message_id and m.user_id = auth.uid())
);
