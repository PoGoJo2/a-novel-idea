// Talks to the Claude API when an API key is configured. Returns null when it is not,
// so the assistant can fall back to its built-in (no-cost) answers.
const MODEL = process.env.AI_MODEL || 'claude-haiku-5-5';

const isEnabled = () => Boolean(process.env.ANTHROPIC_API_KEY);

const askModel = async ({ system, messages, maxTokens = 500 }) => {
  if (!isEnabled()) return null;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      console.error('AI service error:', response.status, await response.text().catch(() => ''));
      return null;
    }
    const data = await response.json();
    const text = (data.content || []).filter((part) => part.type === 'text').map((part) => part.text).join('\n').trim();
    return text || null;
  } catch (err) {
    console.error('AI service unreachable:', err.message);
    return null; // the caller falls back to the built-in answer
  }
};

module.exports = { askModel, isEnabled, MODEL };
