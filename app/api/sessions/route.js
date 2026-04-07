import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function GET() {
  const rows = db.prepare(`
    SELECT s.*, u.name as author_name, u.roll_number FROM sessions s
    LEFT JOIN users u ON s.user_id = u.id ORDER BY s.scheduled_at ASC
  `).all();
  return NextResponse.json({ sessions: rows });
}

export async function POST(req) {
  try {
    const uid = req.cookies.get('uid')?.value;
    if (!uid) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    const { title, subject, description, scheduled_at } = await req.json();
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

    const code = Math.random().toString(36).substring(2, 5) + '-' + Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 5);
    const meet_link = `https://meet.google.com/${code}`;

    const result = db.prepare(`INSERT INTO sessions (user_id, title, subject, description, meet_link, scheduled_at) VALUES (?, ?, ?, ?, ?, ?)`).run(
      uid, title, subject || '', description || '', meet_link, scheduled_at || Math.floor(Date.now()/1000) + 3600
    );
    db.prepare('UPDATE users SET reputation = reputation + 5 WHERE id = ?').run(uid);
    return NextResponse.json({ id: result.lastInsertRowid, meet_link });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
