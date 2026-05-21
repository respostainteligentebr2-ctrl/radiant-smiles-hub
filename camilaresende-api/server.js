const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { createCalendarEvent } = require('./google-calendar');
const { appendAppointmentRow, isSheetConfigured } = require('./google-sheets');

const PORT = process.env.PORT || 34568;
const TOKEN = process.env.API_TOKEN || '';
const DB_PATH = process.env.DB_PATH || '/var/lib/camilaresende/data.db';

if (!TOKEN) { console.error('FATAL: API_TOKEN nao definido'); process.exit(1); }

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  tipo TEXT,
  payload TEXT NOT NULL
);`);

const app = express();
app.use(cors());
app.use(express.json({ limit: '64kb' }));

function auth(req, res, next) {
  const h = req.get('authorization') || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (t !== TOKEN) return res.status(401).json({ error: 'nao autorizado' });
  next();
}

function findAppointmentSubmission({ userEmail, date, time }) {
  const rows = db.prepare('SELECT id, payload FROM submissions WHERE tipo = ? ORDER BY id DESC LIMIT 500').all('agendamento');
  for (const row of rows) {
    try {
      const payload = JSON.parse(row.payload);
      if (payload.userEmail === userEmail && payload.date === date && payload.time === time) {
        return { id: row.id, payload };
      }
    } catch {}
  }
  return null;
}

function updateSubmissionPayload(id, patch) {
  const row = db.prepare('SELECT payload FROM submissions WHERE id = ?').get(id);
  if (!row) return;
  let payload = {};
  try {
    payload = JSON.parse(row.payload);
  } catch {}
  const nextPayload = { ...payload, ...patch };
  db.prepare('UPDATE submissions SET payload = ? WHERE id = ?').run(JSON.stringify(nextPayload), id);
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/submissions', async (req, res) => {
  const body = req.body || {};
  const tipo = typeof body.tipo === 'string' ? body.tipo.slice(0, 80) : null;
  const payload = JSON.stringify(body);
  if (payload.length > 60000) return res.status(413).json({ error: 'dados grandes demais' });
  const info = db.prepare('INSERT INTO submissions (tipo, payload) VALUES (?, ?)').run(tipo, payload);

  if (tipo === 'agendamento') {
    if (isSheetConfigured()) {
      try {
        await appendAppointmentRow(body);
      } catch (error) {
        console.error('Failed to append appointment to Google Sheets:', error);
      }
    }
  }

  res.status(201).json({ id: info.lastInsertRowid });
});

app.get('/api/submissions', auth, (req, res) => {
  const rows = db.prepare('SELECT id, created_at, tipo, payload FROM submissions ORDER BY id DESC LIMIT 500').all();
  res.json(rows.map(r => ({ id: r.id, created_at: r.created_at, tipo: r.tipo, dados: JSON.parse(r.payload) })));
});

app.post('/api/google-calendar/events', auth, async (req, res) => {
  const { userName, userEmail, date, time, service, notes } = req.body || {};
  if (!userName || !userEmail || !date || !time || !service) {
    return res.status(400).json({ error: 'Dados obrigatórios ausentes.' });
  }

  const startDateTime = new Date(`${date}T${time}:00`);
  const endDateTime = new Date(startDateTime.getTime() + 1000 * 60 * 60);

  try {
    const attendees = [{ email: userEmail, displayName: userName }];
    const managementEmails = (process.env.GOOGLE_CALENDAR_ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);
    for (const email of managementEmails) {
      attendees.push({ email });
    }

    const description = `Paciente: ${userName}\nE-mail: ${userEmail}\nServiço: ${service}${notes ? `\nObservações: ${notes}` : ''}`;
    const event = await createCalendarEvent({
      summary: `Consulta - ${service}`,
      description,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      attendees,
    });

    const submission = findAppointmentSubmission({ userEmail, date, time });
    if (submission) {
      updateSubmissionPayload(submission.id, {
        googleCalendarEventId: event.id,
        googleCalendarLink: event.htmlLink,
        googleCalendarSyncedAt: new Date().toISOString(),
      });
    }

    res.status(201).json({ eventId: event.id, htmlLink: event.htmlLink, status: 'synced' });
  } catch (error) {
    console.error('Google Calendar error:', error);
    res.status(500).json({ error: 'Falha ao criar evento no Google Agenda.' });
  }
});

app.delete('/api/submissions/:id', auth, (req, res) => {
  const info = db.prepare('DELETE FROM submissions WHERE id = ?').run(req.params.id);
  res.json({ apagados: info.changes });
});

app.use((err, req, res, next) => res.status(400).json({ error: 'requisicao invalida' }));
app.listen(PORT, '127.0.0.1', () => console.log('API ouvindo em ' + PORT));
