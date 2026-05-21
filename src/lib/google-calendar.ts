import { readFileSync } from "fs";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

function getServiceAccountCredentials() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  let key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!key && process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
    key = readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH, "utf-8");
  }

  if (!email) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL");
  }
  if (!key) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY or GOOGLE_SERVICE_ACCOUNT_KEY_PATH");
  }
  if (!calendarId) {
    throw new Error("Missing GOOGLE_CALENDAR_ID");
  }

  return {
    email,
    key: key.replace(/\\n/g, "\n"),
    calendarId,
  };
}

function getJwtClient() {
  const { email, key } = getServiceAccountCredentials();
  return new google.auth.JWT({
    email,
    key,
    scopes: SCOPES,
  });
}

export type GoogleCalendarEventPayload = {
  summary: string;
  description: string;
  location?: string;
  startDate: string;
  startTime: string;
  durationMinutes?: number;
  attendeeEmail: string;
  attendeeName: string;
  notes?: string;
};

export async function createGoogleCalendarEvent(payload: GoogleCalendarEventPayload) {
  const auth = getJwtClient();
  await auth.authorize();

  const calendar = google.calendar({ version: "v3", auth });
  const startDateTime = `${payload.startDate}T${payload.startTime}:00`;
  const [hours, minutes] = payload.startTime.split(":").map(Number);
  const end = new Date(`${payload.startDate}T${payload.startTime}:00`);
  end.setMinutes(end.getMinutes() + (payload.durationMinutes ?? 60));
  const endDateTime = `${payload.startDate}T${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}:00`;

  const event = {
    summary: payload.summary,
    description: payload.description,
    location: payload.location,
    start: {
      dateTime: startDateTime,
      timeZone: "America/Sao_Paulo",
    },
    end: {
      dateTime: endDateTime,
      timeZone: "America/Sao_Paulo",
    },
    attendees: [
      {
        email: payload.attendeeEmail,
        displayName: payload.attendeeName,
      },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 30 },
      ],
    },
  };

  const result = await calendar.events.insert({
    calendarId: getServiceAccountCredentials().calendarId,
    requestBody: event,
    sendUpdates: "all",
  });

  return result.data;
}
