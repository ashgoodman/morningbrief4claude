# MB4C: Morning Brief for Claude

A **Day Sheet** for Gmail and Google Calendar: one private page with your
schedule and every email still waiting on you, sorted by Claude into P1
(today), P2 (this week) and P3 (when there's time), with newsletters and
likely spam folded away.

From the page you can:

- draft replies into Gmail Drafts;
- mark emails done, replied or delegated, with a check-back date;
- set reminders;
- book time for work, or let **Plan my day** lay out your work and
  call-backs in your free time;
- archive, label, report spam or delete;
- save attachments to Google Drive;
- answer invitations, and step through your calendar day by day.

Settings cover working days and hours, calendars, colour themes, light or
dark, text size and sender rules.

Nothing is sent: replies are saved as drafts for you to send from Gmail.
Nothing in Gmail or your calendar changes unless you tap it, or a sender
rule you made says so.

## Requirements

- A paid Claude plan (Pro, Max, Team or Enterprise), and Claude on the web
  or the desktop app.
- The Gmail and Google Calendar connectors. Google Drive is optional; it's
  used only to save attachments.

## Get started

Start a new conversation and type `/mb4c:setup`. Claude walks you through
connecting Gmail and Google Calendar, publishes your own private Day Sheet,
and offers to schedule a daily text brief.

| Command | What it does |
|---|---|
| `/mb4c:setup` | Step-by-step setup |
| `/mb4c:dashboard` | Publishes or updates your Day Sheet |
| `/mb4c:brief` | A text brief in the conversation |

## What this plugin reads, sends and fetches

- **Gmail**, through your own Gmail connector:
  - It **reads** inbox threads (the last day, or your whole inbox if you
    choose), mail you sent in the last three weeks (for "waiting on
    others"), your labels, and the full message when you save an
    attachment.
  - It **writes** only when you tap an action: a draft, a label, archive,
    spam, trash, or the undo of those. Sender rules you create apply spam,
    or a label and archive, to new mail from that sender on each refresh.
- **Google Calendar**, through your own connector:
  - It **reads** your calendars, events and invitations.
  - It **writes** only when you tap an action: it creates work blocks and
    reminders, moves events, and answers invitations. Moving an event or
    answering an invitation can notify the other guests.
- **Google Drive** (optional): it creates a file only when you tap **Save
  to Drive**.
- **Claude:** email text is sent to Claude, using your own Claude account
  and usage, to sort messages by priority, summarise them and draft
  replies.
- **Storage:**
  - Your choices (done, reminders, settings, sender rules) are kept in
    the Day Sheet's private storage in your Claude account.
  - Your text size and colour choice are also kept in your browser, so the
    page opens in the right style.
- **Google Fonts:** the Day Sheet loads its typefaces from
  fonts.googleapis.com and fonts.gstatic.com.
- **Links** open only when you tap them: Gmail, Google Calendar, Google
  Meet, Google Drive, the App Store, Google Play, and wa.me for a WhatsApp
  call-back.

The plugin has no server of its own and collects no analytics. Its author
receives none of your data.

## License

MIT. The optional colour themes use colours from MIT-licensed editor
themes; see THIRD_PARTY_NOTICES.md.
