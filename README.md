# Ledgerline

A finance & growth Q&A chat that checks the live web before answering.
The frontend (`index.html`) talks to a small serverless function
(`api/chat.js`) which holds your Anthropic API key and forwards
requests to Claude — so the key never reaches the browser.

## 1. Get an API key

Go to https://console.anthropic.com, create (or sign into) an account,
and generate an API key under **API Keys**. Anthropic API usage is
billed separately from any Claude.ai subscription — check current
pricing at https://docs.claude.com before deploying somewhere public.

## 2. Put this project on GitHub

- Create a new repository on GitHub.
- Add these three files to it, keeping the folder structure:
  ```
  index.html
  package.json
  api/chat.js
  ```

## 3. Deploy on Vercel

1. Go to https://vercel.com and sign in with your GitHub account.
2. Click **Add New → Project**, and import the repository you just made.
3. Leave the build settings as default (no build command needed — it's
   a static file plus one serverless function).
4. Before deploying, open **Environment Variables** and add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: the key you generated in step 1
5. Click **Deploy**. Vercel gives you a live URL like
   `https://ledgerline.vercel.app` — open it and try asking a question.

Any time you push a change to the GitHub repo, Vercel redeploys
automatically.

## Notes

- The serverless function caps each request to the last 20 messages
  and trims very long messages, as a basic safeguard against runaway
  usage. If you're sharing this link publicly, consider adding rate
  limiting (Vercel's own rate-limiting or a service like Upstash) so
  one visitor can't rack up a large bill.
- If you'd rather host on Cloudflare Pages instead of Vercel, the same
  `index.html` works — you'd rewrite `api/chat.js` as a Cloudflare
  Pages Function (the code is very similar; ask if you want that
  version).
