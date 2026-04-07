import { NextResponse } from 'next/server';
const db = require('@/lib/db');

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get('subject');
  let rows;
  if (subject && subject !== 'all') {
    rows = db.prepare(`
      SELECT n.*, u.name as author_name, u.roll_number
      FROM notes n LEFT JOIN users u ON n.user_id = u.id
      WHERE n.subject = ? ORDER BY n.created_at DESC
    `).all(subject);
  } else {
    rows = db.prepare(`
      SELECT n.*, u.name as author_name, u.roll_number
      FROM notes n LEFT JOIN users u ON n.user_id = u.id
      ORDER BY n.created_at DESC
    `).all();
  }
  const notes = rows.map(r => ({
    ...r,
    key_topics: r.key_topics ? JSON.parse(r.key_topics) : [],
    exam_questions: r.exam_questions ? JSON.parse(r.exam_questions) : [],
    embedding: undefined,
  }));
  return NextResponse.json({ notes });
}
