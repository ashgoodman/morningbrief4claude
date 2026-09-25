# Connect WhatsApp Business to your morning brief

This adds the chats in your **WhatsApp Business app** to your morning brief.
It takes about fifteen minutes, once.

## Before you start

- You use the **WhatsApp Business app** (not personal WhatsApp), version
  **2.24.17 or newer**, on your phone.
- You can sign in to **Facebook** as someone who can manage your business.
- You have (or will create) a free **Cloudflare** account.

What to expect:

- You keep using the WhatsApp Business app exactly as you do now.
- One-to-one chats are included. **Group chats are not**; Meta doesn't make
  them available.
- New messages are included from the moment you connect. If you agree to
  share chat history when the app asks, the last 180 days come in too.
- After connecting, disappearing messages are turned off for your one-to-one
  chats, and view-once messages and broadcast lists are disabled. This is
  Meta's rule for any business that connects the app this way.
- Your messages are stored in your own Cloudflare account, in your own inbox.
  The MB4C relay passes them on and keeps no copy.

## Step 1: Create your inbox

1. Click this button:

   [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ashgoodman/morningbrief4claude/tree/main/inbox)

2. Sign in to Cloudflare (or create a free account).
3. Accept the suggested names and click **Deploy**. Cloudflare creates the
   inbox and its database.
4. When it's done, Cloudflare shows your inbox's address, something like
   `https://mb4c-whatsapp-inbox.your-name.workers.dev`. Open it.

## Step 2: Create your inbox key

1. On your inbox page, click **Create my inbox key**. Do this straight away:
   whoever clicks first owns the inbox.
2. Copy the key it shows into your password manager. It's shown **once**,
   and anyone who has it can read your WhatsApp messages.

## Step 3: Add the inbox to Claude

1. In Claude, open **Customize → Connectors** (or **Settings → Connectors**).
2. Click **+**, then **Add custom connector**.
3. Enter:
   - **Name**: WhatsApp inbox
   - **Server URL**: your inbox address followed by `/mcp`
   - **Header**: name `x-api-key`, value your inbox key
4. Save it.

## Step 4: Connect your WhatsApp number

1. Back on your inbox page, click **Connect WhatsApp**.
2. Click **Continue with Facebook** and sign in.
3. Choose to connect your **existing WhatsApp Business app**, and follow the
   steps. Meta will ask you to confirm on your phone, in the WhatsApp
   Business app.
4. When the app asks whether to share your chat history, choose yes if you
   want the last 180 days included.
5. The page says **Connected** when it's done.

## Step 5: Check it

In a new Cowork task, type `/mb4c:setup`. Claude checks it can see the
WhatsApp inbox and tells you what it has received so far. Send your business
number a test message from another phone; it should appear within a minute.

## If something goes wrong

- **"The pairing link expired"**: go back to your inbox page and click
  **Connect WhatsApp** again. Each link lasts 15 minutes.
- **"The chat history sync didn't start"**: new messages still arrive. Connect
  again from your inbox page within 24 hours to retry the history.
- **Lost your inbox key**: in the Cloudflare dashboard, delete the inbox's
  D1 database contents (or the whole Worker and database) and start from
  Step 1.

## Disconnecting

To stop messages flowing, delete your inbox Worker and its D1 database in the
Cloudflare dashboard and remove the connector in Claude. To disconnect the
number from Meta's Cloud API entirely, contact MB4C.
