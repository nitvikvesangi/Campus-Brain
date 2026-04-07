'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Upload, Sparkles, FileText, CheckCircle } from 'lucide-react';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Operating Systems');
  const [unit, setUnit] = useState('');
  const [tags, setTags] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError(''); setLoading(true); setResult(null);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('subject', subject);
      fd.append('unit', unit);
      fd.append('tags', tags);
      fd.append('text', text);
      if (file) fd.append('file', file);
      const res = await fetch('/api/notes/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setResult(data.note);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-1">Upload Note</h1>
        <p className="text-muted text-sm mb-6">Upload a PDF, paste text, or both. AI will summarize, tag, and generate probable exam questions.</p>

        {!result && (
          <form onSubmit={submit} className="card p-6 space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Title *</label>
              <input className="input mt-1" placeholder="e.g. Operating Systems - Memory Management" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted uppercase tracking-wide">Subject *</label>
                <select className="input mt-1" value={subject} onChange={e => setSubject(e.target.value)}>
                  <option>Operating Systems</option>
                  <option>Database Systems</option>
                  <option>Computer Networks</option>
                  <option>Data Structures</option>
                  <option>Algorithms</option>
                  <option>Machine Learning</option>
                  <option>Compiler Design</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wide">Unit</label>
                <input className="input mt-1" placeholder="e.g. Unit 3" value={unit} onChange={e => setUnit(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Tags (comma-separated)</label>
              <input className="input mt-1" placeholder="e.g. paging, virtual-memory, tlb" value={tags} onChange={e => setTags(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">PDF / Text File</label>
              <div className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent/50">
                <input type="file" id="file" className="hidden" accept=".pdf,.txt,.md" onChange={e => setFile(e.target.files[0])} />
                <label htmlFor="file" className="cursor-pointer">
                  <Upload size={28} className="mx-auto text-muted mb-2" />
                  <div className="text-sm">{file ? file.name : 'Click to choose PDF, TXT, or MD'}</div>
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Or paste text directly</label>
              <textarea className="input mt-1 min-h-[120px]" placeholder="Paste lecture notes, textbook excerpt, or summary..." value={text} onChange={e => setText(e.target.value)} />
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <button className="btn w-full justify-center" disabled={loading}>
              {loading ? <>Processing with AI... <Sparkles size={16} className="animate-pulse" /></> : <>Upload & Analyze <Sparkles size={16} /></>}
            </button>
          </form>
        )}

        {result && (
          <div className="card p-6 glow-border">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={20} className="text-green-400" />
              <h2 className="font-semibold text-lg">Upload Successful — AI Analysis Complete</h2>
            </div>
            <h3 className="font-bold text-xl mb-1">{result.title}</h3>
            <div className="text-xs text-muted mb-4">{result.subject} · {result.unit}</div>

            <div className="mb-5">
              <div className="text-xs uppercase tracking-wide text-accent2 mb-2 flex items-center gap-1"><Sparkles size={12} /> AI Summary</div>
              <p className="text-sm text-gray-200 leading-relaxed">{result.summary}</p>
            </div>

            <div className="mb-5">
              <div className="text-xs uppercase tracking-wide text-accent2 mb-2">Key Topics</div>
              <div className="flex flex-wrap gap-1.5">
                {result.key_topics.map((t, i) => <span key={i} className="tag">{t}</span>)}
              </div>
            </div>

            <div className="mb-5">
              <div className="text-xs uppercase tracking-wide text-accent2 mb-2">Probable Exam Questions</div>
              <ul className="space-y-1.5">
                {result.exam_questions.map((q, i) => (
                  <li key={i} className="text-sm flex gap-2"><span className="text-accent2">{i + 1}.</span><span>{q}</span></li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <button onClick={() => router.push('/notes')} className="btn">View All Notes</button>
              <button onClick={() => { setResult(null); setTitle(''); setText(''); setTags(''); setFile(null); }} className="btn-ghost">Upload Another</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
