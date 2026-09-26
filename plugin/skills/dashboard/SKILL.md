---
name: dashboard
description: Create (or update) the user's own MB4C Day Sheet - an interactive dashboard of today's calendar and every unanswered email, ranked by priority, with done, replied, delegated, remind-me, reschedule, draft-reply, archive, label, delete and save-attachment-to-Drive actions, day-by-day navigation, a day planner, a start-of-week review and settings. Use when the user runs /mb4c:dashboard, asks for their day sheet or morning dashboard, or asks to install or update it.
---

# Publish the Day Sheet

The Day Sheet is a ready-made page: [day-sheet.html](day-sheet.html), in this
skill's folder (`${CLAUDE_SKILL_DIR}/day-sheet.html`). Your job is to publish
it as an artifact in the user's own Claude account, with the connector and
storage permissions it needs. Each person gets their own copy; it reads their
own Gmail and Calendar and keeps their choices private to them.

## Rules

- **Publish the file exactly as it is.** Don't redesign, restyle, shorten or
  "improve" it, and don't add sample data. It is finished, tested code; a
  change can break it. Only the steps below may alter what gets published.
- Never paste the user's email or calendar content into the page. The page
  fetches it itself when opened.

## Step 1: Check the connectors

Look at your available tools. The page needs these claude.ai connectors:

- **Gmail** (required)
- **Google Calendar** (required)
- **Google Drive** (optional; only for saving email attachments to Drive)

If Gmail or Google Calendar is missing, stop and walk the user through
connecting it (Customize → Connectors, or Settings → Connectors; the
`/mb4c:setup` skill has the steps). Then continue in a new conversation.

## Step 2: Find an existing copy

If the user has published a Day Sheet before (they give you its link, or you
can list their artifacts and see one titled **MB4C Day Sheet**), update that
artifact in place rather than creating a second one, so their saved choices
and link stay the same. Otherwise create a new one.

## Step 3: Publish

Publish `day-sheet.html` as an artifact with:

- **Title**: MB4C Day Sheet (the file already sets it)
- **Icon**: calendar
- **Description**: Today's schedule and every unanswered email, ranked, with
  actions.
- **Runtime capabilities** (declare all of these; this is what lets the page
  work):

```json
{
  "mcp": {
    "servers": [
      { "server": "Gmail", "tools": ["search_threads", "get_thread", "get_message", "create_draft", "list_labels", "create_label", "label_thread", "unlabel_thread", "mark_thread_spam", "unmark_thread_spam", "trash_thread", "untrash_thread"] },
      { "server": "Google Calendar", "tools": ["list_calendars", "list_events", "update_event", "create_event", "respond_to_event"] },
      { "server": "Google Drive", "tools": ["create_file"] }
    ]
  },
  "db": {},
  "user": { "scopes": ["profile"] },
  "sample": {}
}
```

If the user has no Google Drive connector, leave the Google Drive entry out;
the page hides its Drive button when Drive isn't available.

If a connector's display name in this account differs from the names above
(for example "Google Calendar" appears under another name), use the name the
account shows, and tell the user you did.

If publishing with runtime capabilities isn't available here, say so plainly
and don't publish a stripped-down copy: without connectors and storage the
page can't work. Artifacts that use connectors are documented for Claude on
the web and Claude Desktop, on Pro, Max, Team and Enterprise plans.

## Step 4: Hand it over

Give the user the link and tell them:

1. Open it. The first time, Claude asks permission for the page to use
   Gmail, Google Calendar, Google Drive and Claude (Claude sorts new email
   by priority, using a little of their own usage). Allow them.
2. It refreshes itself when opened if the last refresh is over two hours
   old; the **Refresh** button does it on demand.
3. It's private to them. Their choices (done, reminders, sender rules) are
   saved in the page and follow them across devices.
4. Pin it or bookmark it so it's one tap away each morning.

Offer once to pin it to their sidebar if your tools can do that, and only
pin it if they say yes.
