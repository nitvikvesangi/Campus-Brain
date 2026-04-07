import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function POST(req) {
  try {
    const { roll_number, name, branch } = await req.json();
    if (!roll_number) return NextResponse.json({ error: 'Roll number required' }, { status: 400 });

    let user = db.prepare('SELECT * FROM users WHERE roll_number = ?').get(roll_number.toUpperCase());
    if (!user) {
      const result = db.prepare('INSERT INTO users (roll_number, name, branch) VALUES (?, ?, ?)').run(
        roll_number.toUpperCase(),
        name || roll_number.toUpperCase(),
        branch || 'CSE'
      );
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    }

    const res = NextResponse.json({ user });
    res.cookies.set('uid', String(user.id), { httpOnly: false, path: '/', maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('uid');
  return res;
}

export async function GET(req) {
  const uid = req.cookies.get('uid')?.value;
  if (!uid) return NextResponse.json({ user: null });
  const user = db.prepare('SELECT id, roll_number, name, branch, reputation FROM users WHERE id = ?').get(uid);
  return NextResponse.json({ user });
}
