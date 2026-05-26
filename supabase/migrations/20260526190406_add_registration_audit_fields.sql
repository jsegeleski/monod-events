alter table registrations
add column if not exists ip_address text,
add column if not exists user_agent text,
add column if not exists waiver_version text default '2026-05-26',
add column if not exists terms_version text default '2026-05-26';