create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  event_date timestamp with time zone not null,
  location text,
  description text,
  waiver_url text,
  terms_url text,
  status text not null default 'draft',
  created_at timestamp with time zone default now()
);

create table registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  accepted_waiver boolean not null default false,
  accepted_terms boolean not null default false,
  newsletter_opt_in boolean not null default false,
  checked_in boolean not null default false,
  checked_in_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  unique(event_id, email)
);