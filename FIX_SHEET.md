# 🚨 Google Sheet Data Fix Guide

If data isn't showing up, it's 99% likely due to a mismatch between the **React App Data**  and the **Google Apps Script**.

We changed the data structure to include `sessionId` and `stage`, so **you MUST update your Apps Script** to handle this new data, or it will fail silently.

## 1. Update Apps Script (CRITICAL)

1. Open your Google Sheet.
2. Go to **Extensions** > **Apps Script**.
3. **DELETE EVERYTHING** in the editor and paste this **EXACT** code:

```javascript
// 🚨 UPDATED SCRIPT FOR MHA QUIZ 🚨
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    // We expect 7 columns now. Order matters!
    // 1: SessionID, 2: Name, 3: IP, 4: Score, 5: Location, 6: Stage, 7: Timestamp
    var newRow = [
      data.sessionId || 'N/A',
      data.name || 'Not entered',
      data.ip || 'Unknown',
      data.score || 'In Progress',
      data.location || 'Not provided',
      data.stage || 'unknown',
      data.timestamp || new Date().toString()
    ];

    sheet.appendRow(newRow);
    
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'row': newRow }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': e.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

## 2. Redeploy (The Tricky Part)

**You CANNOT just click Save. You MUST create a NEW deployment.**

1. Click **Deploy** (blue button top right) > **Manage deployments**.
2. Click the **Edit** (pencil icon) next to your current deployment, OR just click **Archive** to delete it and start fresh.
3. Recommended: Click **Deploy** > **New deployment**.
   - **Type**: Web App
   - **Description**: "Fixed V3"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** (CRITICAL!)
4. Click **Deploy**.
5. **COPY THE NEW URL**.

## 3. Update React App

1. Go to `src/App.jsx`.
2. Find the `fetch` line (~line 120).
3. Replace the URL with your **NEW** Web App URL.

## 4. Check Your Sheet Headers

Ensure your first row in Google Sheets has exactly these headers:
`Session ID` | `Name` | `IP Address` | `Score` | `Location` | `Stage` | `Timestamp`

---

### 🧪 How to Verify

1. Run the app (`npm run dev`).
2. Open the **Console** (F12).
3. Refresh the page.
4. You should see `[page_load] Request sent!`.
5. Check your Sheet. A row should appear instantly.
