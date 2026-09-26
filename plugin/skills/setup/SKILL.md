---
name: setup
description: Walk the user through setting up their morning brief - connecting Gmail and Google Calendar and scheduling the brief to run every morning. Use when the user runs /mb4c:setup, asks how to set up or schedule the morning brief, or when the brief reports a missing source.
---

# Set up the morning brief

Guide the user one step at a time. After each step, wait for them to say it's
done before moving on. Speak plainly; assume they are not technical. Never
ask them to paste a password, API key or token into this chat.

## Step 1: Check what's already connected

Look at your available tools and tell the user which of these you can see:

- Gmail (tools to search and read mail)
- Google Calendar (tools to list and create events)

Skip any step below whose source is already connected.

## Step 2: Connect Gmail and Google Calendar

Tell the user:

1. Open **Customize → Connectors** in Claude (on some versions this is
   **Settings → Connectors**).
2. Find **Gmail**, click **Connect**, and sign in with the Google account
   they use for work. Allow the permissions Google asks for.
3. Do the same for **Google Calendar**, with the same Google account.
4. Come back to this chat and say "done".

When they're back, confirm you can now see the tools. If you can't, ask them
to start a new chat (connectors are picked up when a conversation starts)
and run `/mb4c:setup` again.

On a Team or Enterprise plan the organisation owner may need to enable these
connectors first; if the user can't find them, say that.

## Step 3: Publish their Day Sheet

The Day Sheet is the interactive dashboard: today's schedule and every
unanswered email, ranked, with actions. Follow the `/mb4c:dashboard` skill to
publish their own copy, give them the link, and have them open it once to
allow its permissions.

## Step 4: Run the text brief once

Run the brief once so they can see it: follow the `/mb4c:brief` skill.
Ask afterwards whether the priorities look right and note any preferences
they state (working hours, people who are always P1, senders who are always
noise). Suggest they add those to **Settings → Profile → personal
preferences** so every brief uses them. Working days and hours for the Day
Sheet itself are set on the Day Sheet, under its gear icon (Settings).

## Step 5: Schedule it every morning

Explain that a scheduled task in Cowork runs in the cloud, so it runs even
when their computer is asleep or Claude is closed. Tell them:

1. In Claude, open **Cowork** and click **Scheduled** in the left sidebar.
2. Click **New task** in the upper right, then **Set up manually**.
3. Fill in:
   - **Task name**: Morning brief
   - **Prompt**: `Run /mb4c:brief and show me the result.`
   - **Frequency**: Weekdays (or Daily), at the time they want it ready,
     for example 7:00.
4. Save it.

Alternatively they can choose **Create with Claude** and say "Run my
morning brief every weekday at 7am."

Remind them the scheduled brief only reads and proposes; it never sends,
archives or books anything. When they open the finished task in the
morning, they can reply to it to confirm time blocks or ask for drafts.
