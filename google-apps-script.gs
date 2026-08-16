/**
 * Google Apps Script for Student Academic Information & University Preferences Survey
 * Spreadsheet ID: 1CDzGI29VXplcBAIrtz19H75jBptDWuLtyYR-G53wp80
 * 
 * Instructions:
 * 1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1CDzGI29VXplcBAIrtz19H75jBptDWuLtyYR-G53wp80/edit
 * 2. Click Extensions -> Apps Script (الإضافات -> Apps Script)
 * 3. Replace all code in Code.gs with this script.
 * 4. Click "Deploy" -> "New deployment" (نشر -> نشر جديد)
 * 5. Select type "Web app" (تطبيق ويب)
 * 6. Set "Execute as": Me (أنا)
 * 7. Set "Who has access": Anyone (أي شخص)
 * 8. Click "Deploy", authorize access, and copy the Web App URL!
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Define exact headers matching form fields
    var headers = [
      "تاريخ الإرسال",
      "الإسم رباعي",
      "الرقم القومي",
      "رقم التليفون (الطالب)",
      "رقم الجلوس",
      "التخصص",
      "هل تم التقديم للجامعة ؟",
      "المجموع قبل المعامل",
      "المجموع بعد المعامل",
      "GPA",
      "المحافظة",
      "المدرسة",
      "اسم الجامعة (الرغبة الأولى)",
      "تخصص الرغبة الأولى",
      "اسم الجامعة (الرغبة الثانية)",
      "التخصص لرغبة الثانية",
      "اسم الجامعة (الرغبة الثالثة)",
      "التخصص للرغبة الثالثة",
      "اسم الجامعة (الرغبة الرابعة)",
      "التخصص لرغبة الرابعة",
      "اسم الجامعة الرغبة الخامسة",
      "التخصص لرغبة الخامسة",
      "اسم الجامعة الرغبة السادسة",
      "التخصص لرغبة السادسة",
      "اسم الجامعة لرغبة السابعة",
      "التخصص لرغبة السابعة"
    ];

    // If sheet is empty, write headers and format them
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1e293b");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter;
      }
    } else if (e.parameter) {
      data = e.parameter;
    }

    var timestamp = new Date().toLocaleString("ar-EG", { timeZone: "Africa/Cairo" });

    var row = [
      timestamp,
      data.fullName || "",
      "'" + (data.nationalId || ""), // Prefix with apostrophe to keep leading zeros in string format
      "'" + (data.phone || ""),
      data.seatNumber || "",
      data.specialization || "",
      data.appliedToUniversity || "",
      data.scoreBefore || "",
      data.scoreAfter || "",
      data.gpa || "",
      data.governorate || "",
      data.school || "",
      data.pref1_university || "",
      data.pref1_specialization || "",
      data.pref2_university || "",
      data.pref2_specialization || "",
      data.pref3_university || "",
      data.pref3_specialization || "",
      data.pref4_university || "",
      data.pref4_specialization || "",
      data.pref5_university || "",
      data.pref5_specialization || "",
      data.pref6_university || "",
      data.pref6_specialization || "",
      data.pref7_university || "",
      data.pref7_specialization || ""
    ];

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "row": sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ "status": "online", "message": "Google Apps Script backend is active." }))
    .setMimeType(ContentService.MimeType.JSON);
}
