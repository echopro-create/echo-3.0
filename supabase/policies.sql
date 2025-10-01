-- Enable RLS
alter table profiles enable row level security;
alter table recipients enable row level security;
alter table messages enable row level security;
alter table message_recipients enable row level security;
alter table heartbeats enable row level security;
alter table events enable row level security;
alter table shares enable row level security;

-- Basic auth helpers: assumes JWT 'sub' is user id or email mapping via auth.users
-- For demo: we match by email. In prod, store auth.user_id in profiles and join by uid.

create policy "profiles_self"
on profiles for select using (true);

create policy "recipients_owner_select"
on recipients for select using (user_id = auth.uid());

create policy "recipients_owner_all"
on recipients for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "messages_owner_select"
on messages for select using (user_id = auth.uid());

create policy "messages_owner_all"
on messages for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "message_recipients_owner_select"
on message_recipients for select using (exists (select 1 from messages m where m.id = message_id and m.user_id = auth.uid()));

create policy "message_recipients_owner_all"
on message_recipients for all using (exists (select 1 from messages m where m.id = message_id and m.user_id = auth.uid()))
with check (exists (select 1 from messages m where m.id = message_id and m.user_id = auth.uid()));

create policy "heartbeats_owner_all"
on heartbeats for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "events_owner_select"
on events for select using (user_id = auth.uid());

create policy "shares_public_read"
on shares for select using (true);

create policy "shares_owner_all"
on shares for all using (exists (select 1 from messages m where m.id = message_id and m.user_id = auth.uid()))
with check (exists (select 1 from messages m where m.id = message_id and m.user_id = auth.uid()));
