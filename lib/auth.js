const { cookies } = require('next/headers');
const db = require('./db');

function getCurrentUser() {
  try {
    const c = cookies();
    const uid = c.get('uid')?.value;
    if (!uid) return null;
    return db.prepare('SELECT id, roll_number, name, branch, reputation FROM users WHERE id = ?').get(uid);
  } catch (e) {
    return null;
  }
}

module.exports = { getCurrentUser };
