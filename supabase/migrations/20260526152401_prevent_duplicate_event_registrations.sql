create unique index registrations_event_email_unique
on registrations (event_id, lower(email));