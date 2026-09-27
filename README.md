# MB4C: Morning Brief for Claude

A Claude plugin that gives you a **Day Sheet**: one private page with today's
calendar and every email still waiting on you, ranked by priority, with
one-tap actions to deal with each one. It works with your own Gmail and
Google Calendar through Claude's connectors.

- **Your schedule, day by day**, from every calendar you choose, all-day
  events and birthdays included, with Join Meet, and Accept / Maybe / Decline
  on invitations. Step back and forward a day at a time.
- **Plan my day**: lays your Work emails and call-backs into the day's free
  time inside your working hours, for you to approve in one tap.
- **Every email waiting on you**, split into unread and read-but-not-actioned,
  sorted by Claude into P1 today, P2 this week and P3 when there's time, with
  newsletters and likely spam folded away (one-tap Spam and Delete).
- **Actions on each email**: draft a reply into Gmail Drafts, book time,
  done, replied, delegated with a check-back date, remind me in N days, move
  to another day, change priority, archive, label, spam, delete, sender
  rules, and save attachments to Google Drive.
- **Call-backs** with tap to call, and WhatsApp when the email says the number
  is on WhatsApp.
- **Waiting on others**: mail you sent that hasn't had an answer, summarised,
  with a nudge draft.
- **Inbox zero**: switch from "last 24 hours" to the whole inbox, and have
  handled email archived in Gmail automatically.
- **Start of the week**: on the first day of your week, what's been waiting
  longest, in one place.
- **Settings** for working days and hours, the day your week starts,
  calendars, light or dark, colour themes (MB4C's own, or Solarized, Nord,
  Gruvbox, Catppuccin or Dracula), text size, auto-refresh, how long handled
  email stays listed, and sender rules; **keyboard shortcuts** on a
  computer.

Nothing is sent, and nothing is archived, deleted, filed or booked without a
tap, except what your own sender rules say to do. Replies are drafts; you send
them from Gmail.

**How to use it:** see [docs/USAGE.md](docs/USAGE.md).

## Requirements

- A paid Claude plan (Pro, Max, Team or Enterprise).
- The Claude desktop app or Claude on the web.
- Gmail and Google Calendar connected in Claude; Google Drive optional.
- On Team or Enterprise, connectors and "Enable artifact connectors" allowed
  by the organisation's admin.

## Install

In Claude, **Customize → Plugins**, then either:

- **Upload** `dist/mb4c-plugin-0.5.0.zip`; or
- **Add marketplace**, enter `ashgoodman/morningbrief4claude`, and install
  **Morning Brief for Claude** (needs this repository to be readable by the
  person installing it).

Then run `/mb4c:setup` in a new task. It connects Gmail and Calendar, publishes
your own Day Sheet with `/mb4c:dashboard`, and offers to schedule the text
brief.

A public GitHub issue reports marketplace-installed plugins failing to load
their skills in Cowork while the same plugin uploaded as a zip works
([anthropics/claude-code#39400](https://github.com/anthropics/claude-code/issues/39400),
closed as not planned). If the marketplace route misbehaves, use the zip.

## Commands

| Command | What it does |
|---|---|
| `/mb4c:setup` | Step-by-step setup: connectors, your Day Sheet, the daily brief |
| `/mb4c:dashboard` | Publishes (or updates) your own Day Sheet |
| `/mb4c:brief [24h\|3d] [--no-blocks]` | A text brief in the conversation |

## Status

Built and checked:

- The plugin and marketplace pass `claude plugin validate`.
- The Day Sheet's script parses, and its attachment extraction (taking a
  file out of a raw Gmail message) is tested with nested MIME, base64 and
  quoted-printable parts.
- Its free-time finder, day planner and start-of-week date are tested.
- The Day Sheet is running on the author's own account against real Gmail
  and calendars, and Plan my day has booked a real block there.

Not yet verified:

- Uploading the zip into Cowork and running `/mb4c:setup` end to end on a
  second account.
- Whether Claude in a Cowork task can publish the Day Sheet with its
  connector and storage permissions. Claude's docs describe this for Claude
  Code (the CLI and the desktop app's Code tab); if Cowork can't, the skill
  says so rather than publishing a copy that can't work.
- Save to Drive, and the Drive link it returns.
- Artifacts that use connectors are documented for Claude on the web and
  Claude Desktop; the phone apps are documented as able to view artifacts.

## Repository

| Path | What it is |
|---|---|
| `plugin/` | The plugin (this folder is what the zip contains) |
| `plugin/.claude-plugin/plugin.json` | Plugin manifest |
| `plugin/skills/setup/` | `/mb4c:setup` |
| `plugin/skills/dashboard/` | `/mb4c:dashboard` and `day-sheet.html`, the Day Sheet page |
| `plugin/skills/brief/` | `/mb4c:brief` |
| `.claude-plugin/marketplace.json` | Makes this repository a plugin marketplace |
| `dist/` | Built plugin zip, and the tester and user guides as PDFs |
| `docs/USAGE.md` | User guide |
| `docs/TESTING.md` | Guide for testers: install, what to try, how to report |
| `scripts/build-zip.sh` | Builds the zip |
| `test/` | Day Sheet checks |

## Development

```
node test/dashboard.test.mjs             # Day Sheet checks (Node 22+)
claude plugin validate ./plugin && claude plugin validate .
scripts/build-zip.sh                     # writes dist/mb4c-plugin-<version>.zip
```

After changing `day-sheet.html`, rebuild the zip, and re-run `/mb4c:dashboard`
to update your own Day Sheet.

## Credits

The optional colour themes use colours from Solarized (Ethan Schoonover),
Nord (Sven Greb), Gruvbox (morhetz), Catppuccin, and Dracula and Alucard
(Dracula Theme), all MIT licensed. Their licence notices are in
[plugin/THIRD_PARTY_NOTICES.md](plugin/THIRD_PARTY_NOTICES.md).
