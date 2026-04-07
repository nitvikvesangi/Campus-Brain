import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function POST(req) {
  try {
    const uid = req.cookies.get('uid')?.value;
    if (!uid) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    const { answer_id, value } = await req.json();
    if (!answer_id || ![1, -1].includes(value)) return NextResponse.json({ error: 'Bad request' }, { status: 400 });

    const existing = db.prepare('SELECT * FROM votes WHERE user_id = ? AND answer_id = ?').get(uid, answer_id);
    if (existing) {
      if (existing.value === value) {
        db.prepare('DELETE FROM votes WHERE id = ?').run(existing.id);
        db.prepare('UPDATE answers SET votes = votes - ? WHERE id = ?').run(value, answer_id);
      } else {
        db.prepare('UPDATE votes SET value = ? WHERE id = ?').run(value, existing.id);
        db.prepare('UPDATE answers SET votes = votes + ? WHERE id = ?').run(value * 2, answer_id);
      }
    } else {
      db.prepare('INSERT INTO votes (user_id, answer_id, value) VALUES (?, ?, ?)').run(uid, answer_id, value);
      db.prepare('UPDATE answers SET votes = votes + ? WHERE id = ?').run(value, answer_id);
    }

    const a = db.prepare('SELECT votes, user_id FROM answers WHERE id = ?').get(answer_id);
    if (a.user_id) db.prepare('UPDATE users SET reputation = reputation + ? WHERE id = ?').run(value, a.user_id);

    return NextResponse.json({ votes: a.votes });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
