'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Plus, MessageSquare, Sparkles, EyeOff } from 'lucide-react';

export default function QAPage() {
  const [questions, setQuestions] = useState([]);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('');
  const [tags, setTags] = useState('');
  const [anon, setAnon] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => { load(); }, []);
  async function load() {
    const r = await fetch('/api/questions');
    const d = await r.json();
    setQuestions(d.questions || []);
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, subject, tags, is_anonymous: anon }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.id) router.push(`/qa/${data.id}`);
  }

  return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Q&A Hub</h1>
            <p className="text-muted text-sm">Ask anything. AI gives an instant baseline answer, peers refine it.</p>
          </div>
          <button onClick={() => setShow(!show)} className="btn"><Plus size={16} /> Ask Question</button>
        </div>

        {show && (
          <form onSubmit={submit} className="card p-6 mb-6 space-y-4">
            <input className="input" placeholder="Question title" value={title} onChange={e => setTitle(e.target.value)} required />
            <textarea className="input min-h-[120px]" placeholder="Add details..." value={body} onChange={e => setBody(e.target.value)} required />
            <div className="grid sm:grid-cols-2 gap-4">
              <input className="input" placeholder="Subject (optional)" value={subject} onChange={e => setSubject(e.target.value)} />
              <input className="input" placeholder="Tags, comma-separated" value={tags} onChange={e => setTags(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input type="checkbox" checked={anon} onChange={e => setAnon(e.target.checked)} />
              <EyeOff size={14} /> Post anonymously
            </label>
            <div className="flex gap-2">
              <button className="btn" disabled={loading}>
                {loading ? <>AI is thinking... <Sparkles size={14} className="animate-pulse" /></> : <>Post & Get AI Answer <Sparkles size={14} /></>}
              </button>
              <button type="button" onClick={() => setShow(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {questions.length === 0 && <div className="text-muted text-center py-12">No questions yet. Ask the first one!</div>}
          {questions.map(q => (
            <Link key={q.id} href={`/qa/${q.id}`} className="card p-5 block hover:border-accent/40 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{q.title}</h3>
                  <p className="text-sm text-muted line-clamp-2 mb-3">{q.body}</p>
                  <div className="flex items-center gap-3 text-xs">
                    {q.subject && <span className="tag">{q.subject}</span>}
                    {(q.tags || '').split(',').filter(Boolean).slice(0, 3).map((t, i) => (
                      <span key={i} className="text-muted">#{t.trim()}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-accent2">
                    <MessageSquare size={14} />
                    <span className="text-sm font-semibold">{q.answer_count}</span>
                  </div>
                  <div className="text-xs text-muted mt-1">
                    {q.is_anonymous ? 'Anonymous' : q.author_name}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
