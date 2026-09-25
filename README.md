# MB4C: Morning Brief for Claude

A Claude plugin that starts the day with one prioritised brief:

- **Today's calendar**: every event, with conflicts, prep and unanswered
  invitations flagged.
- **Email that's still waiting on you**, from Gmail, in two lists: **unread**
  and **read but not actioned** (the latest message isn't from you).
- **WhatsApp Business chats still waiting on you**, if you connect your
  number.
- **Everything ranked**: P1 today, P2 this week, P3 when there's time, with
  newsletters and likely spam or phishing pushed to the bottom.
- **What each item needs**: a quick reply, a call back (with the number), or
  real work (with a time estimate).
- **Proposed time blocks** on your calendar to get the work and call-backs
  done. Nothing is booked until you say yes.

The brief only reads. It never sends, archives, deletes, marks read or books
anything without your explicit yes. It can draft replies into Gmail as
drafts, when you ask.

## Install

In the Claude desktop app:

1. Open **Cowork**, then **Customize → Plugins**.
2. Select **Add marketplace** and enter `ashgoodman/morningbrief4claude`.
3. Find **Morning Brief for Claude** and click **Install**.
4. In a new Cowork task, type `/mb4c:setup`. It walks you through connecting
   Gmail and Google Calendar, optionally WhatsApp, and scheduling the brief
   every weekday morning.

In Claude Code: `/plugin install mb4c --marketplace ashgoodman/morningbrief4claude`.

Plugins in Cowork are available on paid Claude plans. Scheduled tasks in
Cowork run in the cloud, so the brief is ready even if your computer was
asleep.

## Use

- `/mb4c:brief`: the brief, for the last 24 hours.
- `/mb4c:brief 3d`: look back three days (after a weekend, say).
- `/mb4c:brief --no-blocks`: skip the time-block proposals.
- `/mb4c:setup`: set up or check connections and the schedule.

## WhatsApp

WhatsApp Business is optional and takes a one-time setup of about fifteen
minutes: see [docs/WHATSAPP.md](docs/WHATSAPP.md). You keep using the
WhatsApp Business app on your phone as normal. One-to-one chats are
included; group chats are not, because Meta's API doesn't provide them.

How it fits together:

```
WhatsApp Business app ──(Meta coexistence)──▶ Meta Cloud API
                                                  │ webhook, signed with the MB4C app secret
                                                  ▼
                                   MB4C relay (one, run by MB4C)
                                   checks Meta's signature, stores only
                                   which inbox owns which number
                                                  │ re-signed with that inbox's own key
                                                  ▼
                            Your inbox (your own Cloudflare account)
                            stores your messages; Claude reads them
                            as a custom connector
                                                  ▲
                                   Claude ─── /mb4c:brief
```

Your messages are stored only in your own inbox. The relay exists because
Meta signs every webhook with the MB4C app's secret, which can't be shared,
so something has to check it before passing messages on.

## Repository layout

| Path | What it is |
| --- | --- |
| `.claude-plugin/marketplace.json` | Makes this repo a plugin marketplace |
| `plugin/` | The plugin: the `brief` and `setup` skills |
| `inbox/` | The WhatsApp inbox each business deploys (Cloudflare Worker + D1) |
| `relay/` | The relay MB4C runs (Cloudflare Worker + D1) |
| `docs/WHATSAPP.md` | Connecting WhatsApp, for business owners |
| `docs/RELAY.md` | Running the relay and the Meta Tech Provider setup, for the operator |

## Development

Both Workers are plain JavaScript with no dependencies. Tests need Node 22+.

```
cd inbox && npm test
cd relay && npm test      # end to end: relay + a real inbox, Meta stubbed
claude plugin validate ./plugin && claude plugin validate .
```
