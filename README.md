# Commbox Quick Copy

![Commbox Quick Copy icon](icons/icon-128.png)

A small Chrome extension that copies the currently open Commbox conversation
to the clipboard with one keyboard shortcut.

## Install

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select this project folder.
5. Open or refresh a page on your Commbox domain.

## Use

1. Open a conversation in Commbox.
2. Press **Alt+Shift+C**.
3. Wait for the **Conversation copied** confirmation.
4. Paste the conversation wherever you need it.

The extension uses Commbox's existing **Conversation Summary** clipboard action.

## Reload After Changes

After editing the extension:

1. Return to `chrome://extensions`.
2. Click the reload button on **Commbox Quick Copy**.
3. Refresh any open Commbox tabs.

## Change the Shortcut

Edit the `SHORTCUT` value near the top of `content.js`, then reload the
extension and refresh Commbox:

```js
const SHORTCUT = {
  ctrl: false,
  alt: true,
  shift: true,
  meta: false,
  key: "c"
};
```

## Troubleshooting

- The extension only runs on `https://*.commbox.io/*`.
- Make sure a conversation is open before using the shortcut.
- Refresh Commbox after loading or reloading the extension.
- If copying fails, open Chrome DevTools on the Commbox tab and check the
  Console for messages beginning with `[Commbox Quick Copy]`.

## Project Files

- `manifest.json` - Chrome extension configuration.
- `content.js` - shortcut handling and conversation-copy workflow.
- `icons/` - extension icons in Chrome's standard sizes.
