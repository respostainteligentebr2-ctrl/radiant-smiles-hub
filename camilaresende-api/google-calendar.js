const { google } = require('googleapis');
const { getAuthClient } = require('./google-auth');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID;

if (!CALENDAR_ID) {
  console.warn('Google Calendar ID is not configured. Set GOOGLE_CALENDAR_ID.');
}

async function createCalendarEvent({ summary, description, startDateTime, endDateTime, attendees }) {
  const authClient = await getAuthClient(SCOPES);
  const auth = typeof authClient.getClient === 'function' ? await authClient.getClient() : authClient;
  const calendar = google.calendar({ version: 'v3', auth });
  const response = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: {
      summary,
      description,
      start: {
        dateTime: startDateTime,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'America/Sao_Paulo',
      },
      attendees,
      reminders: {
        useDefault: true,
      },
    },
    sendUpdates: 'all',
  });

  return response.data;
}

module.exports = {
  createCalendarEvent,
};
