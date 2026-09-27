# Listing MB4C in the Claude directory

The Claude directory is Anthropic's public catalog of plugins. People find it
under **Discover** in **Customize → Plugins**, and on the Claude Marketplace
website. Listing is optional: anyone can already install MB4C from this
repository or from the zip (see the README). This page is for when you want
it listed.

Sources: Claude's docs on
[publishing to the directory](https://claude.com/docs/directory/publish),
[submitting a plugin](https://claude.com/docs/plugins/submit) and the
[plugin pre-submission checklist](https://claude.com/docs/plugins/pre-submission-checklist),
as read on 27 September 2026.

## Who can submit

Anyone on a paid Claude plan can submit. On Pro or Max you submit from your
own account. On Team or Enterprise, an Owner submits. There's no partner
programme to join first.

## Checklist status

What the checklist asks of the plugin folder (`plugin/`), and where MB4C
stands:

| Check | Status |
|---|---|
| A README of 40+ words in the plugin folder | Done: `plugin/README.md` |
| A licence | Done: `plugin/LICENSE` (MIT), and `"license": "MIT"` in `plugin.json` |
| README describes everything the plugin reads, sends and fetches | Done: the "What this plugin reads, sends and fetches" section of `plugin/README.md` |
| `name` in lowercase letters, digits and hyphens | Done: `mb4c` |
| `description`, `author` and `version` set | Done |
| No `.DS_Store` or other system files; no symlinks | Done |
| Every non-image file under 256 KiB | Done: the largest, `day-sheet.html`, is about 143 KiB |
| Only text files in the plugin folder, no PDFs or zips | Done: the zip and PDFs are in `dist/`, outside the plugin folder |
| No MCP servers, hooks or package launchers | Done: MB4C uses the connectors people already have |
| Readable source, not minified | Done |

**Might be held for a reviewer** (a hold isn't a rejection):

- The checklist says a name, `displayName` or author must not be mistakable
  for a brand that isn't yours, or present the plugin as official. The
  display name is **Morning Brief for Claude**. A reviewer may look at the
  use of "Claude".
- Anthropic's own skills include one named "morning" that renders a
  morning brief. A reviewer may check that MB4C can't be mistaken for it.

You could avoid both by listing it under a name such as **MB4C Day Sheet**.
Changing the name isn't required to submit.

## Steps to submit

1. **Make the repository public.** You can submit while it's private, and
   review can start, but it must be public before the listing goes live.
2. **Connect your GitHub account on claude.ai.** The portal checks that
   your GitHub account can push to the repository.
3. Open the developer portal at
   [claude.ai/directory/manage](https://claude.ai/directory/manage), select
   **Submit new**, then **Plugin bundle**.
4. Fill in the **Source** step:
   - **Repository:** `ashgoodman/morningbrief4claude`
   - **Plugin path:** `plugin`
   - **Branch or tag:** leave empty to follow `main`
5. Select **Validate**. Fix anything marked **Blocking**, push, and select
   **Re-validate**.
6. Check **Listing details**. They come from `plugin.json` and
   `plugin/README.md`.
7. Answer **Data handling**. Suggested answers are below; check them
   yourself.
8. On **Compliance**, confirm your contact email and the four
   acknowledgements.
9. Select **Submit for review**. Review time isn't fixed. The portal shows
   the status.

After it's listed, merging to `main` releases a new version. The directory
picks up the commit, checks it, and publishes it.

## Suggested data-handling answers

These describe what the code does. Check them before you submit.

- **Does it read personal data?** Yes: the person's own Gmail messages
  and Google Calendar events, through their own connectors.
- **Does it store personal data?** Yes, in the Day Sheet's private storage
  in the person's own Claude account:
  - each email's sender, subject and state (done, reminders, delegated to
    whom);
  - short summaries of emails;
  - settings and sender rules.

  Text size and colour choice are also kept in their browser.
- **Does it send data to services other than its connectors?** Email text
  goes to Claude, under the person's own account, to sort, summarise and
  draft replies. The Day Sheet loads fonts from Google Fonts, which sees an
  ordinary web request. Nothing goes to the plugin's author or any other
  service.
- **How long is data kept?** Handled emails are removed after 7, 14 or 30
  days (the person's setting, 14 by default). Open items, settings and
  sender rules stay until the person deletes them or their Day Sheet.
- **Is it intended for people under 18?** No.
