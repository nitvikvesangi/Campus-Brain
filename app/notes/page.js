'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Plus, FileText, User, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [subject, setSubject] = useState('all');
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [subject]);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/notes?subject=${subject}`);
    const data = await res.json();
    setNotes(data.notes || []);
    setLoading(false);
  }

  const subjects = ['all', ...Array.from(new Set(notes.map(n => n.subject)))];

  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notes Library</h1>
            <p className="text-muted text-sm">AI-summarized study material organized by subject.</p>
          </div>
          <Link href="/notes/upload" className="btn"><Plus size={16} /> Upload Note</Link>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {subjects.map(s => (
            <button key={s} onClick={() => setSubject(s)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${subject === s ? 'bg-accent text-white border-accent' : 'bg-panel border-border text-muted hover:text-white'}`}>
              {s === 'all' ? 'All Subjects' : s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-muted text-center py-12">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText size={40} className="mx-auto text-muted mb-3" />
            <div className="text-muted mb-4">No notes yet for this subject.</div>
            <Link href="/notes/upload" className="btn">Upload the first one</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {notes.map(n => {
              const isOpen = expanded[n.id];
              return (
                <div key={n.id} className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{n.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted mb-3">
                        <span className="px-2 py-0.5 rounded bg-accent/10 text-accent">{n.subject}</span>
                        {n.unit && <span>{n.unit}</span>}
                        <span className="flex items-center gap-1"><User size={12} /> {n.author_name}</span>
                      </div>
                      <div className="flex items-start gap-2 mb-3">
                        <Sparkles size={14} className="text-accent2 mt-1 flex-shrink-0" />
                        <p className="text-sm text-gray-300 leading-relaxed">{n.summary}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {n.key_topics.map((t, i) => <span key={i} className="tag">{t}</span>)}
                      </div>
                    </div>
                    <button onClick={() => setExpanded({ ...expanded, [n.id]: !isOpen })} className="btn-ghost text-xs flex items-center gap-1">
                      {isOpen ? <>Hide <ChevronUp size={14} /></> : <>Details <ChevronDown size={14} /></>}
                    </button>
                  </div>

                  {isOpen && (
                    <div className="mt-5 pt-5 border-t border-border">
                      <div className="text-xs uppercase tracking-wide text-muted mb-2">AI-Generated Probable Exam Questions</div>
                      <ul className="space-y-1.5">
                        {n.exam_questions.map((q, i) => (
                          <li key={i} className="text-sm flex gap-2">
                            <span className="text-accent2">{i + 1}.</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                      {n.file_url && (
                        <a href={n.file_url} target="_blank" className="inline-flex items-center gap-2 mt-4 text-xs text-accent hover:underline">
                          <FileText size={12} /> View original file
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
