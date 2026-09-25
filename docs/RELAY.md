# Running the MB4C relay (operator guide)

This is for the MB4C operator, not for businesses using the brief. The relay
is one Cloudflare Worker that every business's inbox connects through. It
needs a Meta app that is approved as a **Tech Provider**, because only a
Solution Partner or Tech Provider can onboard businesses that keep using the
WhatsApp Business app ("coexistence").

Items marked **verify** below are steps I couldn't confirm against Meta's
current dashboard; check them as you go.

## What the relay stores and why

Per connected business: WhatsApp Business Account (WABA) id, phone number
id, display number, the inbox's URL, that inbox's forwarding key, and
timestamps. No message content and no Meta access token. The business token
from Embedded Signup is used during the connect request (to subscribe to
webhooks and start the contacts and history sync) and then dropped.

## 1. Meta: app and Tech Provider status

Meta's references:

- Tech Provider onboarding:
  https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/get-started-for-tech-providers
- Embedded Signup:
  https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/implementation
- Coexistence (onboarding WhatsApp Business app users):
  https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

Checklist:

1. A Meta business portfolio for MB4C, with **business verification**
   completed.
2. A Meta app with the WhatsApp use case, owned by that portfolio.
3. Tech Provider onboarding for the app, including **App Review** for the
   `whatsapp_business_management` and `whatsapp_business_messaging`
   permissions (**verify** the exact permissions requested at review).
4. An **Embedded Signup configuration** (Facebook Login for Business). Note
   its configuration id: it's `META_CONFIG_ID`. (**verify** menu names.)
5. The relay's domain allowed for the JavaScript SDK and as a valid OAuth
   redirect domain in the app's Facebook Login settings (**verify**).
6. A privacy policy URL on the app that says what the relay stores (above)
   and that message content goes to each business's own inbox.
7. **Webhooks**: callback URL `https://<relay>/webhook`, verify token = the
   value you'll set as `META_VERIFY_TOKEN`. Subscribe the app to these
   WhatsApp Business Account fields:
   - `messages`
   - `smb_message_echoes` (messages the business sends from the app)
   - `history` (the 180-day history sync)
   - `smb_app_state_sync` (contacts)

The relay sets the webhook subscription on each business's WABA itself
(`POST /<WABA_ID>/subscribed_apps`), and starts the contacts and history
sync (`POST /<PHONE_NUMBER_ID>/smb_app_data`) immediately, inside Meta's
24-hour window. It skips phone number registration, as Meta requires for
coexistence.

## 2. Cloudflare: deploy the relay

```
cd relay
npx wrangler d1 create mb4c-relay          # note the database_id
cp wrangler.toml.example wrangler.toml     # fill in database_id, META_APP_ID,
                                           # META_CONFIG_ID, GRAPH_VERSION
npx wrangler deploy
npx wrangler secret put META_APP_SECRET
npx wrangler secret put META_VERIFY_TOKEN  # a long random string
```

The relay creates its table on first request. Check it:

```
curl https://<relay>/health
```

Then set the webhook callback in the Meta app dashboard; Meta calls
`GET /webhook` with your verify token, and the relay answers the challenge.

## 3. Point inboxes at the relay

Edit `inbox/wrangler.jsonc` and set `RELAY_URL` to the relay's address, then
commit. Inboxes deployed with the Deploy to Cloudflare button pick it up
from the repository. An inbox deployed earlier keeps its old value until its
owner redeploys or edits the variable in the Cloudflare dashboard.

## Operating notes

- If an inbox is down, the relay answers Meta with 502 so Meta retries (for
  up to 7 days). A failure is recorded on the route (`last_error`); inboxes
  ignore repeated deliveries of the same message.
- To look at routes: `npx wrangler d1 execute mb4c-relay --remote --command "SELECT waba_id, display_phone_number, inbox_url, last_forward_at, last_error FROM routes"`.
- To stop forwarding for a business, delete its row from `routes`.
  Deliveries for an unknown WABA are acknowledged and dropped.
