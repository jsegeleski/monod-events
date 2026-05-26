alter table registrations
add column phone text,
add column source text default 'monod_events_app',
add column waiver_accepted_at timestamp with time zone,
add column terms_accepted_at timestamp with time zone,
add column marketing_consent_timestamp timestamp with time zone,
add column klaviyo_event_sent boolean not null default false,
add column klaviyo_event_sent_at timestamp with time zone,
add column klaviyo_error text,
add column klaviyo_profile_id text;