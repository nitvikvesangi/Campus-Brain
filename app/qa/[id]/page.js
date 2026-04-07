'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { ArrowUp, ArrowDown, Sparkles, User, EyeOff } from 'lucide-react';

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, [id]);
  async function load() {
    const r = await fetch(`/api/questions/${id}`);
    const d = await r.json();
    setQuestion(d.question);
    setAnswers(d.answers || []);
  }

  async function vote(answer_id, value) {
    await fetch('/api/questions/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer_id, value }),
    });
    load();
  }

  async function submitAnswer(e) {
    e.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    await fetch(`/api/questions/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    });
    setBody('');
    setLoading(false);
    load();
  }

  if (!question) return <><Navbar /><div className="p-6 text-muted">Loading...</div></>;

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <div className="card p-6 mb-6">
          <h1 className="text-2xl font-bold mb-3">{question.title}</h1>
          <p className="text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">{question.body}</p>
          <div className="flex items-center gap-3 text-xs text-muted">
            {question.subject && <span className="tag">{question.subject}</span>}
            <span className="flex items-center gap-1">
              {question.is_anonymous ? <><EyeOff size={12} /> Anonymous</> : <><User size={12} /> {question.author_name}</>}
            </span>
          </div>
        </div>

        <div className="mb-3 text-sm text-muted uppercase tracking-wide">{answers.length} Answers — ranked by votes & recency</div>

        <div className="space-y-4 mb-6">
          {answers.map(a => (
            <div key={a.id} className={`card p-5 ${a.is_ai ? 'glow-border' : ''}`}>
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <button onClick={() => vote(a.id, 1)} className="p-1 rounded hover:bg-panel2 text-muted hover:text-green-400">
                    <ArrowUp size={18} />
                  </button>
                  <div className="font-bold text-lg">{a.votes}</div>
                  <button onClick={() => vote(a.id, -1)} className="p-1 rounded hover:bg-panel2 text-muted hover:text-red-400">
                    <ArrowDown size={18} />
                  </button>
                </div>
                <div className="flex-1">
                  {a.is_ai && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-accent to-accent2 text-white text-xs font-semibold flex items-center gap-1">
                        <Sparkles size={10} /> AI Answer
                      </span>
                      <span className="text-xs text-muted">Generated instantly to eliminate cold-start</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{a.body}</p>
                  {!a.is_ai && a.author_name && (
                    <div className="text-xs text-muted mt-3 flex items-center gap-2">
                      <User size={12} /> {a.author_name}
                      {a.reputation != null && <span className="text-accent2">⚡{a.reputation}</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submitAnswer} className="card p-5">
          <div className="text-xs uppercase tracking-wide text-muted mb-2">Your Answer</div>
          <textarea className="input min-h-[100px]" placeholder="Share your knowledge..." value={body} onChange={e => setBody(e.target.value)} />
          <button className="btn mt-3" disabled={loading}>{loading ? 'Posting...' : 'Post Answer'}</button>
        </form>
      </div>
    </>
  );
}
