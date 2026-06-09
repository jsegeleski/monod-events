create or replace function register_event_runner(
  p_event_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_accepted_waiver boolean,
  p_accepted_terms boolean,
  p_newsletter_opt_in boolean,
  p_source text,
  p_waiver_accepted_at timestamptz,
  p_terms_accepted_at timestamptz,
  p_marketing_consent_timestamp timestamptz,
  p_ip_address text,
  p_user_agent text,
  p_waiver_version text,
  p_terms_version text
)
returns registrations
language plpgsql
security definer
as $$
declare
  v_event events;
  v_position integer;
  v_registration registrations;
begin
  select *
  into v_event
  from events
  where id = p_event_id;

  if not found then
    raise exception 'Event not found';
  end if;

  select count(*) + 1
  into v_position
  from registrations
  where event_id = p_event_id;

  insert into registrations (
    event_id,
    first_name,
    last_name,
    email,
    accepted_waiver,
    accepted_terms,
    newsletter_opt_in,
    source,
    waiver_accepted_at,
    terms_accepted_at,
    marketing_consent_timestamp,
    ip_address,
    user_agent,
    waiver_version,
    terms_version,
    signup_position,
    early_badge_qualified
  )
  values (
    p_event_id,
    p_first_name,
    p_last_name,
    lower(trim(p_email)),
    p_accepted_waiver,
    p_accepted_terms,
    p_newsletter_opt_in,
    p_source,
    p_waiver_accepted_at,
    p_terms_accepted_at,
    p_marketing_consent_timestamp,
    p_ip_address,
    p_user_agent,
    p_waiver_version,
    p_terms_version,
    v_position,
    coalesce(v_event.early_badge_enabled, false)
      and v_event.early_badge_limit is not null
      and v_position <= v_event.early_badge_limit
  )
  returning * into v_registration;

  return v_registration;
end;
$$;