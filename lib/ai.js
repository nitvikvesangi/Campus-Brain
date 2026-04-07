const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey) {
  try { genAI = new GoogleGenerativeAI(apiKey); } catch (e) { console.error('Gemini init failed', e); }
}

function fallbackSummary(text) {
  if (!text || text.length < 50) return { summary: text || 'No content to summarize.', topics: [], questions: [] };
  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter(s => s.length > 20);
  const summary = sentences.slice(0, 4).join(' ');
  const words = text.toLowerCase().match(/\b[a-z]{5,}\b/g) || [];
  const freq = {};
  const stop = new Set(['which','where','there','their','about','these','those','would','could','should','being','because','through','during','between','before','after','while','within','without','other','another','first','second','third']);
  words.forEach(w => { if (!stop.has(w)) freq[w] = (freq[w] || 0) + 1; });
  const topics = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,6).map(e => e[0]);
  const questions = [
    `Explain the key concepts discussed in this material.`,
    `What are the main applications of ${topics[0] || 'these concepts'}?`,
    `Compare and contrast ${topics[0] || 'X'} and ${topics[1] || 'Y'}.`,
  ];
  return { summary, topics, questions };
}

async function generateNoteIntelligence(text) {
  const truncated = (text || '').slice(0, 12000);
  if (!genAI) return fallbackSummary(truncated);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are an academic assistant. Analyze the following study material and respond ONLY with valid JSON (no markdown, no code fences) in this exact format:
{
  "summary": "A clear 4-6 sentence summary",
  "topics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "questions": ["probable exam question 1", "question 2", "question 3", "question 4"]
}

Study material:
"""
${truncated}
"""`;
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim().replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(raw);
    return {
      summary: parsed.summary || '',
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
    };
  } catch (e) {
    console.error('Gemini error, using fallback:', e.message);
    return fallbackSummary(truncated);
  }
}

async function generateAnswerForQuestion(title, body) {
  if (!genAI) {
    return `Based on the question "${title}": This is a foundational topic. Start by reviewing the core definitions, then look at worked examples in your textbook. Key approach: break the problem into smaller parts, identify which concept applies to each, then combine the results. Peers will add more detailed answers below.`;
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a helpful academic tutor. Answer the following student question clearly and concisely (5-10 sentences). Be educational and accurate.

Question: ${title}
Details: ${body}

Answer:`;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    console.error('Gemini answer error:', e.message);
    return `Great question on "${title}". The core idea here involves understanding the fundamentals first. Review your notes on this topic, then try a worked example. Peers may add more detail below.`;
  }
}

function generateEmbedding(text) {
  const dim = 128;
  const vec = new Array(dim).fill(0);
  if (!text) return vec;
  const tokens = text.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
  for (const tok of tokens) {
    let h = 0;
    for (let i = 0; i < tok.length; i++) h = ((h << 5) - h + tok.charCodeAt(i)) | 0;
    const idx = Math.abs(h) % dim;
    vec[idx] += 1;
  }
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map(v => v / norm);
}

function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

module.exports = { generateNoteIntelligence, generateAnswerForQuestion, generateEmbedding, cosineSimilarity };
