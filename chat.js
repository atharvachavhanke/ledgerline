// Vercel serverless function — runs on the server, never in the browser.
// Your ANTHROPIC_API_KEY lives only here (set as an env var in Vercel), so
// it's never exposed to anyone who views the page's source.

const SYSTEM_PROMPT = `You are Ledgerline, a focused research assistant for finance and growth topics only:
personal and corporate finance, investing, markets, economics, business strategy, startups,
marketing/growth, and related current events.

Rules:
- Always use the web_search tool to check current facts, figures, or prices before answering — never rely on memory alone for anything that could be stale.
- If the question is clearly unrelated to finance, investing, business, growth, or economics, politely say this assistant is focused on finance and growth topics, and ask what financial or growth question they have — do not answer the unrelated question.
- Be direct and concise. Use short paragraphs. Use plain numbers, not markdown tables.
- Never give personalized investment, legal, or tax advice or tell someone what to buy — give facts, context and general information, and note that for personal decisions they should consult a licensed professional.
- Cite where information came from by naming the source inline (e.g. "per Reuters" or "according to the company's Q2 filing"), in your own words — never quote more than a few words verbatim.`;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server is missing ANTHROPIC_API_KEY. Add it in your Vercel project settings.' });
    return;
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Request must include a non-empty "messages" array.' });
    return;
  }

  // Basic guardrails: cap history length and message size so one client can't
  // run up a huge bill in a single request.
  const trimmedMessages = messages.slice(-20).map(m => ({
    role: m.role,
    content: typeof m.content === 'string' ? m.content.slice(0, 4000) : m.content
  }));

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: trimmedMessages,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }]
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: data?.error?.message || 'Upstream error from Claude API' });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    console.error('chat.js error:', err);
    res.status(500).json({ error: 'Server error while contacting Claude.' });
  }
};
