# Using MB4C: Morning Brief for Claude

This guide is for the person using MB4C day to day. It covers installing the
plugin, setting it up, and everything on the Day Sheet.

## What you need

- A **paid Claude plan** (Pro, Max, Team or Enterprise). Plugins in Cowork and
  artifacts that use connectors are paid-plan features.
- The **Claude desktop app** or Claude on the web.
- Your **Gmail** and **Google Calendar** connected in Claude. **Google Drive**
  is optional; it's only used to save email attachments.
- On a **Team or Enterprise** plan, your admin may need to allow connectors,
  and "Enable artifact connectors" under Settings → Capabilities.

## Install

1. In Claude, open **Customize → Plugins**.
2. Choose **Upload** and pick the `mb4c-plugin-<version>.zip` file you were
   given. (Or, if you were given the GitHub address: **Add marketplace**, enter
   `ashgoodman/morningbrief4claude`, and install **Morning Brief for Claude**.)
3. Start a new task and type `/mb4c:setup`.

## Setup (`/mb4c:setup`)

Claude walks you through, one step at a time:

1. **Connect Gmail and Google Calendar** (Customize → Connectors). Sign in
   with the Google account you use for work.
2. **Publish your Day Sheet.** Claude creates your own private copy of the
   dashboard and gives you its link. Open it and allow the permissions it asks
   for (Gmail, Google Calendar, Google Drive, and Claude, which it uses to
   sort new email by priority with a little of your own usage).
3. **Run the text brief once** to check the priorities look right.
4. **Schedule the text brief** every weekday morning, if you want it.

Pin or bookmark the Day Sheet link so it's one tap away. To make it again or
update it later, type `/mb4c:dashboard`.

## The Day Sheet

### Top of the page

- **The date and Refresh.** The page refreshes by itself when you open it if
  the last refresh was over two hours ago. **Refresh** does it now.
- **Summary chips**, which are also filters. Tap one to see only those items,
  tap it again (or **All**) to see everything:
  - **for today**: P1 items
  - **waiting on you**: everything in P1, P2 and P3
  - **call-backs**
  - **events**: today's schedule only
  - **work blocks**: only the time you've booked with MB4C
- **Email from: Last 24 hours | Whole inbox.** Last 24 hours brings in new
  email from the past day; anything already on your list stays until you deal
  with it. Whole inbox sorts everything in your inbox (up to 150 threads per
  refresh). This switch only affects email: the calendar always shows today.
- **Text: Small | Medium | Large.** Changes the size of all the text on the
  page. Your choice is saved with your other settings, so it stays the same
  the next time you open the Day Sheet.
- **Archive in Gmail when handled.** Tick it once: from then on, marking an
  email Done, Replied or Delegated also archives it in Gmail.

### Today's schedule

- Every event today from every calendar you haven't hidden, including
  all-day events and birthdays.
- **Calendars** lets you untick calendars you don't want here.
- **Join Meet** appears on video calls (it becomes **Join now** 15 minutes
  before). **Accept / Maybe / Decline** appear on invitations you haven't
  answered.
- **Invitations to answer** lists unanswered invitations for the next two
  weeks.
- MB4C work blocks are marked **Block**. A block that has passed without
  being done offers **Move to tomorrow** in its ⋯ menu.

### Needs you

Every email still waiting on you, sorted by Claude into:

- **P1 Today**: a deadline today or tomorrow, money at stake, an unhappy
  customer, a real person blocked on you, a genuine security alert.
- **P2 This week**: a real person waiting, no stated urgency.
- **P3 When there's time**: FYI mail, receipts, notices.

Each group folds (Show / Hide), and remembers how you left it. The filter
chips **All · Unread · Call-backs · Work** narrow the list further.

The square at the left of each card: **filled @** = unread, **outlined @** =
read but not actioned, **→** = an email you sent (Waiting on others).

### What's on a card

Buttons you can tap straight from the card:

| Button | What it does |
|---|---|
| **Draft a quick reply →** / **Draft a reply →** | Opens the item with Claude already writing a reply. Edit it, then **Save to Gmail Drafts**. Nothing is sent; you send it from Gmail. |
| **Book time →** | Opens the item with the booking fields ready and the next free gap filled in. **Add to calendar** books an "MB4C: …" block. |
| **Call +63…** | Starts a phone call on a phone. |
| **WhatsApp** | Opens a WhatsApp chat with that number. Shown only when the email says the number is on WhatsApp. |
| **Copy** | Copies the number. |
| **Spam** / **Delete** | On noise and likely-spam cards only: moves the email to Spam or Trash. Both can be undone. |

Labels (information only): **Call back**, **Work**, **~60 min** (Claude's
estimate), **Scheduled Sat 2:00 PM**, **FYI**, **Follow up**, **Reminder**,
**N attachments**, and notes such as **New message since you handled this**
or **Did Sam handle this?**

### The ⋯ menu on an email

Tap ⋯ for everything else. The top shows who it's from, the subject, a one-line
summary and why it got its priority. Below that:

- **Open in Gmail** (and **Get the Gmail app** on iPhone).
- **Show the email**: loads the text of the last few messages.
- **Attachments**, each with **Save to Drive** and then **Open in Drive**.
- Call buttons, for call-backs.

The actions:

| Action | What it does |
|---|---|
| **Done** | Clears it from your list. |
| **Replied** | You've answered it. (MB4C also notices replies you send from Gmail and clears those itself.) |
| **Draft reply** | Claude drafts a reply into Gmail Drafts. |
| **Remind me** | Hides it until tomorrow, in 3 days, in a week, or in any number of days. Optionally puts a 15-minute reminder on your calendar that day so your phone alerts you. |
| **Reschedule** | Moves it to another day. |
| **Book time** | Books a work block for it (work items only). |
| **Priority** | Moves it to P1, P2, P3, Noise or Spam. Your choice sticks. |
| **Delegated** | Who has it, and when to check back. It comes back that day asking "Did they handle this?" You can also label it in Gmail. |
| **Log call** | "Spoke to them" (done), or "Left a message / no answer" (back in 2 days). Call-backs only. |
| **Archive** | Takes it out of your Gmail inbox. |
| **Label** | Files it under a Gmail label (or a new one), and optionally archives it. |
| **Sender rule** | From now on, mail from this sender is always P1, P2 or P3, always noise (optionally filed to a label and archived), or always spam. Rules apply on every refresh and are listed under **Sender rules** at the bottom of the page, where you can remove them. |
| **Spam** | Reports it as spam in Gmail. |
| **Delete** | Moves it to Gmail's Trash. |

There's no "remove" for email: each one has to end up somewhere.

When you tap an action that needs more (Remind me, Label, Delegated…), its
options open under the email and above the action buttons.

### Calendar events' ⋯ menu

**Done**, **Reschedule** (moves the event in Google Calendar and keeps its
length; warns you if guests will be notified or you're not the organiser),
**Delegated**, **Remove** (hides it from today's schedule), plus **Open in
Google Calendar** and **Join Google Meet**.

### Swipes (touch screens)

- **Swipe right**: Done.
- **Swipe left**: see it again tomorrow.

Both show **Undo**. Swipes work with a finger or pen, not a mouse drag.

### Further down the page

- **Waiting on others**: mail you sent 2 to 21 days ago with no answer, each
  with a one-line summary of what you asked for. ⋯ → **Nudge them** drafts a
  follow-up; **Show what you sent** shows your message.
- **Reminders later**: items you've hidden, with the day they come back.
- **Delegated**: with their check-back dates.
- **Noise and likely spam**: with one-tap Spam and Delete.
- **Handled**: everything you've dealt with in the last two weeks, each with
  **Undo** (which also takes an email back out of Trash or Spam).
- **Sender rules**.

## Opening Google's apps on a phone

- **Calendar** links open the Google Calendar app on iPhone when it's
  installed (Google's own link settings assign event links to it).
- **Gmail** links open Gmail on the web on iPhone: Google doesn't provide a
  documented link into a specific email in the Gmail app. A **Get the Gmail
  app** link sits beside it.
- **Meet** and **Drive** links can open those apps.
- On **Android**, the links name the app and fall back to its Play Store page.
  Whether they open the app from inside the Claude app depends on the Claude
  app, so a plain web link is always there too.

## Privacy

- Your Day Sheet is private to you. It uses your own connectors; nobody else
  can see your email or calendar through it.
- What you do on it (done, reminders, sender rules, settings) is saved in the
  Day Sheet's own private storage and follows you across devices.
- Email text is sent to Claude only to sort it, summarise it and draft
  replies, using your own Claude account.
- Nothing is sent, and nothing is archived, deleted, filed or booked, without
  your tap, except what your own sender rules say to do.

## If something isn't working

| You see | Try |
|---|---|
| "Gmail isn't connected" / "Google Calendar isn't connected" | Connect it in Customize → Connectors (or Settings → Connectors), then reload the page. |
| "needs reconnecting" | Reconnect that connector in Settings → Connectors. |
| "This page isn't allowed to use …" | You declined a permission. Reload the page and allow it. |
| "blocked" by your organisation | Ask your admin to allow that connector action, and artifact connectors. |
| Sorted "by simple rules" | Claude wasn't available or your usage limit was reached; Refresh later. |
| Save to Drive says the file is too large | Open the email in Gmail and use Gmail's **Add to Drive**. |
| No Save to Drive button | Google Drive isn't connected; it's optional. |
