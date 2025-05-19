
import { google } from 'googleapis';

export async function getSheetData() {
	try {
		const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n');
		const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
		const sheetId = process.env.GOOGLE_SHEET_ID;
		const sheetRange = process.env.GOOGLE_SHEET_RANGE;

		if (!privateKey || !clientEmail || !sheetId || !sheetRange) {
			throw new Error('Google Sheets API credentials or Sheet ID/Range are not set in environment variables.');
		}

		const auth = new google.auth.GoogleAuth({
			credentials: {
				client_email: clientEmail,
				private_key: privateKey,
			},
			scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
		});

		const sheets = google.sheets({ version: 'v4', auth });

		const response = await sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			range: sheetRange,
		});

		return response.data.values;
	} catch (error) {
		console.error('Error fetching data from Google Sheets:', error);
		return null;
	}
}