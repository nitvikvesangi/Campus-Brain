import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
const db = require('@/lib/db');
const { generateNoteIntelligence, generateEmbedding } = require('@/lib/ai');

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req) {
  try {
    const uid = req.cookies.get('uid')?.value;
    if (!uid) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file');
    const title = formData.get('title');
    const subject = formData.get('subject');
    const unit = formData.get('unit') || '';
    const tags = formData.get('tags') || '';
    const pastedText = formData.get('text') || '';

    if (!title || !subject) return NextResponse.json({ error: 'Title and subject are required' }, { status: 400 });

    let extractedText = pastedText.toString();
    let fileUrl = '';

    if (file && typeof file === 'object' && file.size > 0) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const filePath = path.join(uploadsDir, safeName);
      await writeFile(filePath, buffer);
      fileUrl = `/uploads/${safeName}`;

      if (file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const pdfParse = require('pdf-parse');
          const data = await pdfParse(buffer);
          extractedText = (data.text || '') + '\n' + extractedText;
        } catch (e) {
          console.error('PDF parse failed:', e.message);
        }
      } else if (file.name.match(/\.(txt|md)$/i)) {
        extractedText = buffer.toString('utf-8') + '\n' + extractedText;
      }
    }

    if (!extractedText || extractedText.trim().length < 20) {
      extractedText = `${title}. ${subject}. ${unit}. ${tags}. (No text content was extracted from the upload — using metadata only.)`;
    }

    const ai = await generateNoteIntelligence(extractedText);
    const embedding = generateEmbedding(extractedText + ' ' + ai.summary + ' ' + tags);

    const result = db.prepare(`INSERT INTO notes (user_id, title, subject, unit, tags, file_url, extracted_text, summary, key_topics, exam_questions, embedding) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      uid, title, subject, unit, tags, fileUrl,
      extractedText.slice(0, 50000),
      ai.summary,
      JSON.stringify(ai.topics),
      JSON.stringify(ai.questions),
      JSON.stringify(embedding)
    );

    db.prepare('UPDATE users SET reputation = reputation + 10 WHERE id = ?').run(uid);

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({
      note: {
        ...note,
        key_topics: JSON.parse(note.key_topics),
        exam_questions: JSON.parse(note.exam_questions),
        embedding: undefined,
      },
    });
  } catch (e) {
    console.error('Upload error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
