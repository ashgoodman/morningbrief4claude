# Testing MB4C: a guide for testers

Thank you for trying **MB4C (Morning Brief for Claude)**. It gives you a
**Day Sheet**: one private page with your calendar and every email still
waiting on you, sorted by priority, with one-tap actions. It runs on your
own Claude account with your own Gmail and Google Calendar.

This guide covers installing it, what to try, and how to report what you
find. Everything the Day Sheet does is explained in the user guide
(**mb4c-user-guide.pdf**, or docs/USAGE.md in the repository).

## Before you start

- **A paid Claude plan** (Pro, Max, Team or Enterprise) and the **Claude
  desktop app** (or Claude on the web).
- **Gmail** and **Google Calendar**, connected in Claude. **Google Drive** is
  optional; it's only used to save email attachments.
- On a **Team or Enterprise** plan, your admin may need to allow connectors,
  and "Enable artifact connectors" under Settings → Capabilities.

**Your data stays yours.** The Day Sheet is private to your Claude account.
Nobody else, including the person who sent you this, can see your email or
calendar through it.

**Nothing is sent.** Replies are saved as Gmail drafts; you send them from
Gmail yourself.

**Some buttons do change Gmail or your calendar**, when you tap them:

- **Delete** moves an email to Gmail's Trash.
- **Spam** reports it to Gmail.
- **Archive** and **Label** file it.
- **Book time** and **Plan my day** add events to your calendar.
- Moving an event, or answering an invitation, can notify the other people
  invited.

Most of these offer **Undo**. For your first tries, pick emails and events
that don't matter.

## 1. Install

1. In Claude, open **Customize → Plugins**.
2. Choose **Upload** and pick **mb4c-plugin-0.5.0.zip**.
3. Start a new task (or chat) and type **/mb4c:setup**.

Claude then walks you through three steps:

1. Connecting Gmail and Google Calendar.
2. Publishing your own Day Sheet, which gives you its link.
3. Running a text brief once.

When you first open the Day Sheet, it asks permission to use Gmail, Google
Calendar, Google Drive and Claude. Claude sorts your email with a little of
your own usage. Allow them.

**If setup stops or says it can't publish the Day Sheet,** that's the most
useful thing you can report. Note exactly what Claude said.

## 2. What to try

Tick these off as you go. Anything that surprises you is worth reporting.

### First look

- [ ] The Day Sheet opens and loads your calendar and email.
- [ ] Today's schedule includes all-day events and birthdays.
- [ ] Emails are sorted sensibly into **P1 Today**, **P2 This week** and
      **P3 When there's time**. Newsletters and spam sit folded at the bottom.
      Tap **⋯** on an email to see why it got its priority.
- [ ] It looks right on your phone as well as your computer.

### Everyday actions

- [ ] **Draft a reply** (on an email, or ⋯ → Draft reply). Edit it, then
      **Save to Gmail Drafts**. Check it's in Gmail's Drafts and wasn't sent.
- [ ] **Done**, then **Undo** from the message at the bottom.
- [ ] **Remind me** → Tomorrow. The email moves to "Reminders later".
- [ ] **Delegated**: give a name and a check-back day.
- [ ] **Delete** a junk email, then **Undo**, and check it came back out of
      Gmail's Trash.
- [ ] On a phone: **swipe right** for Done, **swipe left** for tomorrow.

### Calendar

- [ ] Use **‹ and ›** beside the date to move between days, and **Back to
      today** to return.
- [ ] On an event, **⋯ → Done** puts a check mark on it; it stays on the
      schedule.
- [ ] **Book time** on an email marked Work. It suggests the first free slot
      in your working hours. Add it and check the event is in your calendar.
- [ ] **Plan my day**. It lays out your Work emails and call-backs in free
      time. Change a length, swap two items with ↑ ↓, untick one, then add
      the rest and check your calendar.
- [ ] If you have unanswered invitations, **Accept / Maybe / Decline**. This
      tells the organiser.

### Settings (the gear, top right)

- [ ] Set your **working days and hours**, then try Plan my day again.
- [ ] Switch **Light / Dark / Match system**, and try a few **colour themes**.
- [ ] Change the **text size**.
- [ ] Untick a calendar under **Calendars to show**.
- [ ] Set **My week starts on**. On that day, a **Start of the week** box
      lists what's been waiting longest.

### Also worth a try

- [ ] **Email from: Whole inbox** (under the gear) sorts your whole inbox.
      The first time uses more of your Claude usage.
- [ ] **Save to Drive** on an email with an attachment (only if Drive is
      connected), then open it from Drive.
- [ ] A **Sender rule** (⋯ → Sender rule), such as "always noise".
- [ ] On a computer: press **?** for keyboard shortcuts, then try **j / k**
      and **e**.
- [ ] Type **/mb4c:brief** in Claude for the text version of your brief.

## 3. Reporting what you find

For each problem, send:

1. **What you did** (the steps, in order).
2. **What you expected.**
3. **What happened instead**, including the exact wording of any message.
4. **Where:** computer or phone, the Claude app or web browser, and which
   colour theme.
5. **A screenshot** if it helps. Cover or crop out any private email
   content first.

Ideas and "this was confusing" are just as useful as bugs.

## Updating

When you're sent a newer zip, upload it the same way. Then type
**/mb4c:dashboard** to update your Day Sheet. It keeps your settings and
your link.
