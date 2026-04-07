'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { BookOpen, MessageSquare, Video, Sparkles, Search, ArrowRight, Zap } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/login'); return; }
      setUser(d.user);
    });
    fetch('/api/notes').then(r => r.json()).then(d => setNotes(d.notes || []));
    fetch('/api/questions').then(r => r.json()).then(d => setQuestions(d.questions || []));
    fetch('/api/sessions').then(r => r.json()).then(d => setSessions(d.sessions || []));
  }, []);

  async function doSearch(e) {
    e?.preventDefault();
    if (!searchQ.trim()) { setSearchResults(null); return; }
    setSearching(true);
    const res = await fetch(`/api/search?q=${encodeURIComponent(searchQ)}&mode=hybrid`);
    const data = await res.json();
    setSearchResults(data);
    setSearching(false);
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center text-muted">Loading...</div>;

  const stats = [
    { label: 'Notes', value: notes.length, icon: BookOpen, color: 'from-purple-500 to-indigo-500', href: '/notes' },
    { label: 'Questions', value: questions.length, icon: MessageSquare, color: 'from-cyan-500 to-blue-500', href: '/qa' },
    { label: 'Live Sessions', value: sessions.length, icon: Video, color: 'from-pink-500 to-rose-500', href: '/sessions' },
    { label: 'Your Reputation', value: user.reputation, icon: Zap, color: 'from-amber-500 to-orange-500', href: '#' },
  ];

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Welcome back, <span className="gradient-text">{user.name}</span></h1>
          <p className="text-muted">Your unified academic intelligence hub.</p>
        </div>

        <div className="card p-6 mb-8 glow-border">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-accent2" />
            <h2 className="font-semibold">Smart Search</h2>
            <span className="text-xs text-muted">— keyword + semantic similarity</span>
          </div>
          <form onSubmit={doSearch} className="flex gap-2">
            <input
              className="input"
              placeholder='Try "scheduling algorithms" or "normalization"...'
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
            <button type="submit" className="btn" disabled={searching}>
              <Search size={16} /> {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchResults && (
            <div className="mt-5 grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted mb-2">Notes ({searchResults.notes.length})</div>
                <div className="space-y-2">
                  {searchResults.notes.length === 0 && <div className="text-sm text-muted">No matching notes.</div>}
                  {searchResults.notes.map(n => (
                    <Link key={n.id} href={`/notes`} className="block p-3 rounded-lg bg-panel2 hover:bg-border border border-border">
                      <div className="font-medium text-sm">{n.title}</div>
                      <div className="text-xs text-muted mt-0.5">{n.subject} · {n.unit} · score {n.score.toFixed(2)}</div>
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-muted mb-2">Questions ({searchResults.questions.length})</div>
                <div className="space-y-2">
                  {searchResults.questions.length === 0 && <div className="text-sm text-muted">No matching questions.</div>}
                  {searchResults.questions.map(q => (
                    <Link key={q.id} href={`/qa/${q.id}`} className="block p-3 rounded-lg bg-panel2 hover:bg-border border border-border">
                      <div className="font-medium text-sm">{q.title}</div>
                      <div className="text-xs text-muted mt-0.5">{q.subject} · {q.answer_count} answers · score {q.score.toFixed(2)}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <Link key={s.label} href={s.href} className="card p-5 hover:border-accent/40 transition-colors">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                  <Icon size={18} color="white" />
                </div>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </Link>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><BookOpen size={16} className="text-accent" /> Latest Notes</h3>
              <Link href="/notes" className="text-xs text-accent hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
            </div>
            <div className="space-y-3">
              {notes.slice(0, 4).map(n => (
                <Link key={n.id} href="/notes" className="block p-3 rounded-lg bg-panel2 hover:bg-border border border-border">
                  <div className="font-medium text-sm">{n.title}</div>
                  <div className="text-xs text-muted mt-0.5">{n.subject} · by {n.author_name}</div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(n.key_topics || []).slice(0, 4).map((t, i) => <span key={i} className="tag">{t}</span>)}
                  </div>
                </Link>
              ))}
              {notes.length === 0 && <div className="text-sm text-muted">No notes yet.</div>}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2"><MessageSquare size={16} className="text-accent2" /> Latest Questions</h3>
              <Link href="/qa" className="text-xs text-accent hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>
            </div>
            <div className="space-y-3">
              {questions.slice(0, 4).map(q => (
                <Link key={q.id} href={`/qa/${q.id}`} className="block p-3 rounded-lg bg-panel2 hover:bg-border border border-border">
                  <div className="font-medium text-sm">{q.title}</div>
                  <div className="text-xs text-muted mt-0.5">{q.subject || 'General'} · {q.answer_count} answers</div>
                </Link>
              ))}
              {questions.length === 0 && <div className="text-sm text-muted">No questions yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
