alter table events
add column if not exists early_badge_enabled boolean default false,
add column if not exists early_badge_limit integer,
add column if not exists early_badge_label text,
add column if not exists early_badge_email_message text;

alter table registrations
add column if not exists signup_position integer,
add column if not exists early_badge_qualified boolean default false;