import axios from "axios";

export async function sendKlaviyoEvent({
  email,
  firstName,
  lastName,
  eventTitle,
  eventSlug,
  eventDate,
  location,
}: {
  email: string;
  firstName: string;
  lastName: string;
  eventTitle: string;
  eventSlug: string;
  eventDate: string;
  location?: string;
}) {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing Klaviyo API key");
  }

  await axios.post(
    "https://a.klaviyo.com/api/events/",
    {
      data: {
        type: "event",
        attributes: {
          properties: {
            event_title: eventTitle,
            event_slug: eventSlug,
            event_date: eventDate,
            location,
          },

          metric: {
            data: {
              type: "metric",
              attributes: {
                name: "Monod Event Registered",
              },
            },
          },

          profile: {
            data: {
              type: "profile",
              attributes: {
                email,
                first_name: firstName,
                last_name: lastName,
              },
            },
          },
        },
      },
    },
    {
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        accept: "application/json",
        revision: "2024-02-15",
        "content-type": "application/json",
      },
    }
  );
}

export async function subscribeToKlaviyoNewsletter({
  email,
  firstName,
  lastName,
}: {
  email: string;
  firstName: string;
  lastName: string;
}) {
  const apiKey = process.env.KLAVIYO_PRIVATE_API_KEY;
  const listId = process.env.KLAVIYO_NEWSLETTER_LIST_ID;

  if (!apiKey) throw new Error("Missing Klaviyo API key");
  if (!listId) throw new Error("Missing Klaviyo newsletter list ID");

  await axios.post(
    "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/",
    {
      data: {
        type: "profile-subscription-bulk-create-job",
        attributes: {
          custom_source: "Monod Events Signup",
          profiles: {
            data: [
              {
                type: "profile",
                attributes: {
                  email,
                  subscriptions: {
                    email: {
                      marketing: {
                        consent: "SUBSCRIBED",
                      },
                    },
                  },
                },
              },
            ],
          },
        },
        relationships: {
          list: {
            data: {
              type: "list",
              id: listId,
            },
          },
        },
      },
    },
    {
      headers: {
        Authorization: `Klaviyo-API-Key ${apiKey}`,
        accept: "application/json",
        revision: "2024-05-15",
        "content-type": "application/json",
      },
    }
  );
}