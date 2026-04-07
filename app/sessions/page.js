'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Plus, Video, Calendar, ExternalLink, User } from 'lucide-react';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, []);
  async function load() {
    const r = await fetch('/api/sessions');
    const d = await r.json();
    setSessions(d.sessions || []);
  }

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, subject, description }),
    });
    setTitle(''); setSubject(''); setDescription('');
    setShow(false); setLoading(false); load();
  }

  function fmtTime(ts) {
    if (!ts) return 'TBD';
    const d = new Date(ts * 1000);
    return d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Live Study Sessions</h1>
            <p className="text-muted text-sm">Create or join group study sessions via Google Meet.</p>
          </div>
          <button onClick={() => setShow(!show)} className="btn"><Plus size={16} /> New Session</button>
        </div>

        {show && (
          <form onSubmit={submit} className="card p-6 mb-6 space-y-4">
            <input className="input" placeholder="Session title" value={title} onChange={e => setTitle(e.target.value)} required />
            <input className="input" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
            <textarea className="input min-h-[80px]" placeholder="What will you cover?" value={description} onChange={e => setDescription(e.target.value)} />
            <div className="flex gap-2">
              <button className="btn" disabled={loading}>{loading ? 'Creating...' : 'Create Session'}</button>
              <button type="button" onClick={() => setShow(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {sessions.length === 0 && <div className="text-muted col-span-2 text-center py-12">No sessions scheduled.</div>}
          {sessions.map(s => (
            <div key={s.id} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0">
                  <Video size={18} color="white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{s.title}</h3>
                  {s.subject && <div className="text-xs text-accent">{s.subject}</div>}
                </div>
              </div>
              {s.description && <p className="text-sm text-muted mb-3">{s.description}</p>}
              <div className="flex items-center gap-3 text-xs text-muted mb-3">
                <span className="flex items-center gap-1"><Calendar size={12} /> {fmtTime(s.scheduled_at)}</span>
                <span className="flex items-center gap-1"><User size={12} /> {s.author_name}</span>
              </div>
              <a href={s.meet_link} target="_blank" rel="noopener" className="btn w-full justify-center text-sm">
                <ExternalLink size={14} /> Join Meeting
              </a>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
