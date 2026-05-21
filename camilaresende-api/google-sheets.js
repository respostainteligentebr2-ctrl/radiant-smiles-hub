const { google } = require('googleapis');
const { getAuthClient, isConfigured } = require('./google-auth');

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Agendamentos';

function isSheetConfigured() {
  return typeof SPREADSHEET_ID === 'string' && SPREADSHEET_ID.length > 0 && isConfigured();
}

async function appendAppointmentRow({ userName, userEmail, date, time, service, notes }) {
  if (!isSheetConfigured()) {
    throw new Error('Google Sheets is not configured. Set GOOGLE_SHEETS_SPREADSHEET_ID and Google auth credentials.');
  }

  const authClient = await getAuthClient(['https://www.googleapis.com/auth/spreadsheets']);
  const auth = typeof authClient.getClient === 'function' ? await authClient.getClient() : authClient;
  const sheets = google.sheets({ version: 'v4', auth });

  const values = [[
    new Date().toISOString(),
    userName || '',
    userEmail || '',
    date || '',
    time || '',
    service || '',
    notes || '',
  ]];

  return sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values,
    },
  });
}

module.exports = {
  appendAppointmentRow,
  isSheetConfigured,
};
