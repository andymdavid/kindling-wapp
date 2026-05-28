# Chat WApp

A demo WApp that logs in with a Nostr browser extension, stores chats in local SQLite, starts a Wingmen pipeline for each user message, and receives the agent answer through a webhook.

## Flow

1. Browser signs a login challenge with `window.nostr`.
2. Messages are stored in `data/chat-wapp.sqlite`.
3. `POST /api/chats/:chatId/messages` starts `CHAT_WAPP_PIPELINE_NAME`.
4. Pipeline input includes `message`, `history`, `chatId`, and `webhook`.
5. The pipeline agent posts the answer to `POST /api/pipeline-webhook`.

`CHAT_WAPP_ALLOW_MOCK=1` keeps the demo usable before the Autopilot HTTP trigger route is live. Set it to `0` once Autopilot is restarted with the HTTP trigger update.
