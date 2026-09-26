# MB4C: Morning Brief for Claude

A Claude plugin and dashboard that start the day with one prioritised view
of Gmail and Google Calendar:

- **Today's schedule** from every calendar you choose, birthdays and all-day
  events included, with conflicts, Meet links and invitations to answer.
- **Email that's still waiting on you**, split into **unread** and **read but
  not actioned** (the latest message isn't from you).
- **Everything ranked**: P1 today, P2 this week, P3 when there's time, with
  newsletters and likely spam or phishing folded away.
- **What each item needs**: a quick reply, a call back (tap to call, and
  WhatsApp when the email gives a WhatsApp number), or real work with a time
  estimate and a button to book the time.
- **Actions on each item**: done, replied, delegated (with a check-back
  date), remind me in N days, move to another day, change priority, draft a
  reply into Gmail Drafts, archive, label, report spam, sender rules, and
  saving attachments to Google Drive.
- **Waiting on others**: mail you sent that hasn't had an answer, with a
  nudge draft.

Nothing is sent, archived, deleted or booked without a tap. Replies are
drafts; you send them from Gmail.

## Pieces

| Path | What it is |
| --- | --- |
| `.claude-plugin/marketplace.json` | Makes this repo a plugin marketplace |
| `plugin/` | The plugin: `/mb4c:dashboard`, `/mb4c:brief` (a text brief) and `/mb4c:setup` |
| `plugin/skills/dashboard/day-sheet.html` | The interactive Day Sheet that `/mb4c:dashboard` publishes as the user's own private artifact |
| `test/` | Checks the Day Sheet's script and its attachment extraction |

The day sheet reads Gmail, Google Calendar and Google Drive through the
viewer's own Claude connectors, asks Claude to rank new messages, and keeps
what you do with each item in the artifact's private per-viewer storage.
Claude's help centre documents artifacts that use connectors and stored data
on the web and Claude Desktop.

## Install the plugin

In the Claude desktop app, Customize → Plugins, then either:

- **Add marketplace** and enter `ashgoodman/morningbrief4claude`, then install
  **Morning Brief for Claude**; or
- **Upload** the plugin as a zip of the `plugin/` folder.

Then run `/mb4c:setup`, which connects Gmail and Calendar and runs `/mb4c:dashboard` to publish your own Day Sheet. Plugins in Cowork are available on paid Claude plans.

## Development

```
node test/dashboard.test.mjs
claude plugin validate ./plugin && claude plugin validate .
```
