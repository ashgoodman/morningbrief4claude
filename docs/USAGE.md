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

- **The day, with ‹ and ›** to step back and forward a day at a time. The
  label above the date says where you are (Today, Tomorrow, In 3 days…), and
  **Back to today** appears when you've moved away. Moving between days
  changes the schedule; your email list is always your inbox as it is now.
- **Settings** and **Refresh.** The page refreshes by itself when you open it
  if the last refresh is older than you chose in Settings (two hours to
  begin with). **Refresh** does it now.
- **Summary chips**, which are also filters. Tap one to see only those items,
  tap it again (or **All**) to see everything:
  - **for today**: P1 items
  - **waiting on you**: everything in P1, P2 and P3
  - **call-backs**
  - **events**: the schedule of the day you're looking at
  - **work blocks**: only the time you've booked with MB4C that day

### The schedule

- Every event that day from every calendar you haven't hidden in Settings,
  including all-day events and birthdays.
- **Join Meet** appears on video calls (it becomes **Join now** 15 minutes
  before). **Accept / Maybe / Decline** appear on invitations you haven't
  answered.
- Under today: **Invitations to answer**, for the next two weeks.
- On a later day: **Coming back** lists the reminders and delegated
  check-backs due that day.
- MB4C work blocks are marked **Block**. A block that has passed without
  being done offers **Move to tomorrow** in its ⋯ menu.

### Plan my day

**Plan my day** (or **Plan this day** on a later day) sits beside the
schedule. It lays out your open **Work** emails and your **call-backs** in
that day's free time:

- Each Work email gets its own block, sized from Claude's estimate, between
  30 minutes and 2 hours. Call-backs share one block: 15 minutes plus 5 per
  call.
- Highest priority goes first, each in the earliest gap it fits.
- It only uses your working hours (set in Settings), keeps 10 minutes clear
  of other events, and never suggests time that has already passed.
- Untick any you don't want, then **Add to your calendar**. Anything that
  doesn't fit is listed so you can plan it on the next day. Emails that
  already have a block from today on are left out.

### Needs you

Every email still waiting on you, sorted by Claude into:

- **P1 Today**: a deadline today or tomorrow, money at stake, an unhappy
  customer, a real person blocked on you, a genuine security alert.
- **P2 This week**: a real person waiting, no stated urgency.
- **P3 When there's time**: FYI mail, receipts, notices.

Each group folds (Show / Hide), and remembers how you left it. The filter
chips **All · Unread · Call-backs · Work** narrow the list further.

### Start of the week

On the first day of your week (Monday unless you change it in Settings), a
**Start of the week** box sits at the top of Needs you. It lists:

- emails that have been waiting on you (P2 and P3) for more than a week;
- emails you sent that have had no reply for more than a week;
- delegated emails with no check-back date;
- reminders coming back this week.

Deal with them from there as usual. **Done for this week** hides the box
until your next week starts. If you skip the first day, it's still there the
next day. You can turn it off, or bring it back, in Settings.

The square at the left of each card: **filled @** = unread, **outlined @** =
read but not actioned, **→** = an email you sent (Waiting on others).

### What's on a card

Buttons you can tap straight from the card:

| Button | What it does |
|---|---|
| **Draft a quick reply →** / **Draft a reply →** | Opens the item with Claude already writing a reply. Edit it, then **Save to Gmail Drafts**. Nothing is sent; you send it from Gmail. |
| **Book time →** | Opens the item with the booking fields ready and the first free gap filled in, from that day's calendar and your working hours. Change the day and it finds a gap on that day. **Add to calendar** books an "MB4C: …" block. |
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
| **Remind me** | Hides it until tomorrow, in 3 days, in a week, or in any number of days. Optionally puts a 15-minute reminder on your calendar that day (at the time set in Settings) so your phone alerts you. |
| **Reschedule** | Moves it to another day. |
| **Book time** | Books a work block for it (work items only). |
| **Priority** | Moves it to P1, P2, P3, Noise or Spam. Your choice sticks. |
| **Delegated** | Who has it, and when to check back. It comes back that day asking "Did they handle this?" You can also label it in Gmail. |
| **Log call** | "Spoke to them" (done), or "Left a message / no answer" (back in 2 days). Call-backs only. |
| **Archive** | Takes it out of your Gmail inbox. |
| **Label** | Files it under a Gmail label (or a new one), and optionally archives it. |
| **Sender rule** | From now on, mail from this sender is always P1, P2 or P3, always noise (optionally filed to a label and archived), or always spam. Rules apply on every refresh and are listed in **Settings**, where you can remove them. |
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

### Keyboard shortcuts (computers)

Press **?** on the page to see them. **j** and **k** move between emails in
Needs you, and the selected one is outlined.

| Key | Does |
|---|---|
| **j** / **k** | Next / previous email |
| **o** or **Enter** | Open its actions |
| **e** | Done |
| **r** | Draft a reply |
| **b** | Book time (Work emails) |
| **h** | Hide it until tomorrow |
| **#** | Delete (moves it to Gmail's Trash, with Undo) |
| **←** / **→** | Previous / next day |
| **t** | Back to today |
| **p** | Plan the day you're looking at |
| **,** | Settings |
| **Esc** | Close |

Shortcuts don't fire while you're typing in a box. Turn them off in Settings.

### Settings

Everything you can change lives here. It's saved as you change it, and the
same on every device you open the Day Sheet on.

- **Email**
  - **Email from: Last 24 hours | Whole inbox.** Last 24 hours brings in new
    email from the past day; anything already on your list stays until you
    deal with it. Whole inbox sorts everything in your inbox (up to 150
    threads per refresh).
  - **Archive in Gmail when handled.** Marking an email Done, Replied or
    Delegated also archives it in Gmail.
  - **Keep handled emails listed for** 7, 14 or 30 days.
  - **Refresh by itself when opened**, if the last refresh is older than 1,
    2, 4 or 8 hours, or never.
- **Calendar**
  - **Working day starts / ends.** Book time and Plan my day only suggest
    times in between.
  - **Calendar reminders go at.** The time of day for Remind me's calendar
    reminder.
  - **Calendars to show.** Untick any you don't want on the Day Sheet.
- **Week**
  - **My week starts on** any day of the week.
  - **Show the start-of-week reset**, and **Show this week's reset again**
    after you've marked it done.
- **Display**
  - **Text size: Small | Medium | Large.** Changes the size of all the text
    on the page.
  - **Keyboard shortcuts** on or off, and **See the shortcuts**.
- **Sender rules.** Every rule you've made, each with **Remove**.

### Further down the page

- **Waiting on others**: mail you sent 2 to 21 days ago with no answer, each
  with a one-line summary of what you asked for. ⋯ → **Nudge them** drafts a
  follow-up; **Show what you sent** shows your message.
- **Reminders later**: items you've hidden, with the day they come back.
- **Delegated**: with their check-back dates.
- **Noise and likely spam**: with one-tap Spam and Delete.
- **Handled**: everything you've dealt with recently (two weeks unless you
  change it in Settings), each with **Undo** (which also takes an email back
  out of Trash or Spam).

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
