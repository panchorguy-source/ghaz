/**
 * Global Institute of Studies (GIS) — Google Apps Script Lead Receiver
 *
 * Setup:
 * 1. Create a Google Sheet (e.g., "GIS Leads 2026") under panchorguy@gmail.com.
 *    Add header row: Timestamp | Name | Phone | Email | Source | Programme interest
 * 2. Open Extensions -> Apps Script and paste this code.
 * 3. Go to Project Settings -> Script Properties and add:
 *    Property: SHEET_ID
 *    Value: <Your Google Sheet ID from the URL>
 * 4. Deploy -> New deployment -> Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone (requests are proxied server-side via /api/enquiries)
 * 5. Copy the /exec Web App URL into GOOGLE_APPS_SCRIPT_WEB_APP_URL in your server environment.
 */

function sanitizeSpreadsheetCell(value) {
  var str = String(value || '').trim().slice(0, 240);
  if (/^[=+\-@\t\r]/.test(str)) {
    return "'" + str;
  }
  return str;
}

function doPost(e) {
  try {
    var sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
    if (!sheetId) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: false, error: 'SHEET_ID script property is not configured.' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var body = JSON.parse(e.postData.contents || '{}');
    var name = sanitizeSpreadsheetCell(body.name);
    var phone = sanitizeSpreadsheetCell(body.phone);
    var email = sanitizeSpreadsheetCell(body.email);
    var source = sanitizeSpreadsheetCell(body.source || 'GIS Landing Page');
    var programmeInterest = sanitizeSpreadsheetCell(body.programmeInterest || 'Pertanyaan Umum');
    var timestamp = sanitizeSpreadsheetCell(body.timestamp || new Date().toISOString());

    if (!name || !phone || !email) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: false, error: 'Missing required fields.' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.openById(sheetId);
    var sheet = ss.getSheets()[0];
    sheet.appendRow([timestamp, name, phone, email, source, programmeInterest]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, status: 'saved' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
