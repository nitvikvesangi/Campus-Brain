'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [roll, setRoll] = useState('');
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('CSE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    if (!roll.trim()) { setError('Roll number is required'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roll_number: roll.trim(), name: name.trim() || roll.trim(), branch }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      router.push('/dashboard');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function quickLogin(r) {
    setRoll(r);
    setTimeout(() => document.getElementById('login-submit')?.click(), 50);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent2/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent to-accent2 flex items-center justify-center mb-4">
            <Brain size={32} color="white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Campus Brain</h1>
          <p className="text-muted text-sm">AI-powered academic knowledge network</p>
        </div>

        <div className="card p-8 glow-border">
          <h2 className="text-xl font-semibold mb-1">Sign in with Roll Number</h2>
          <p className="text-muted text-sm mb-6">Closed-network access for verified students.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Roll Number</label>
              <input className="input mt-1" placeholder="e.g. CS21B001" value={roll} onChange={e => setRoll(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Name (first time only)</label>
              <input className="input mt-1" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted uppercase tracking-wide">Branch</label>
              <select className="input mt-1" value={branch} onChange={e => setBranch(e.target.value)}>
                <option>CSE</option><option>ECE</option><option>EEE</option><option>MECH</option><option>CIVIL</option>
              </select>
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <button id="login-submit" className="btn w-full justify-center" disabled={loading}>
              {loading ? 'Signing in...' : <>Continue <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-xs text-muted mb-2">Quick demo logins:</div>
            <div className="flex flex-wrap gap-2">
              {['CS21B001', 'CS21B002', 'CS21B003', 'EC21B010'].map(r => (
                <button key={r} onClick={() => quickLogin(r)} className="text-xs px-3 py-1.5 rounded-lg bg-panel2 hover:bg-border border border-border">
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
