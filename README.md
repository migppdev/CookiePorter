# 🍪 Cookie Porter — Installation Instructions

## What’s in this ZIP?

cookie-porter/
├── manifest.json ← extension configuration
├── popup.html ← visual interface
├── popup.js ← export/import logic
└── icons/
├── icon16.png
├── icon48.png
└── icon128.png

---

## Installation in Chrome or Edge

1. **Unzip** the ZIP file into a permanent folder on your computer  
   (e.g., `C:\\Users\\YourName\\Extensions\\cookie-porter`)  
   ⚠️ Do not delete it after installation — Chrome needs it.

2. Open Chrome/Edge and go to:
   - Chrome → `chrome://extensions`
   - Edge → `edge://extensions`

3. Toggle on **Developer mode** (switch at the top right)

4. Click **"Load unpacked"** and select the `cookie-porter` folder

5. The extension will appear in your toolbar 🎉  
   (If you don’t see it, click the puzzle icon 🧩 and pin it)

---

## How to use

### Export cookies

1. Open the page whose cookies you want to save
2. Click the Cookie Porter icon
3. Choose the scope: **Current tab**, **Domain**, or **All**
4. Click **"Export as JSON"**
5. Save the file to a USB, cloud storage, etc.

### Import cookies (after formatting or on another PC)

1. Install the extension in the new browser/computer
2. Open Cookie Porter and go to the **Import** tab
3. Drag and drop or select your `.json` file
4. Review the summary and click **"Import cookies"**

---

## Security Notes

- The JSON file contains your cookies **in plain text** (unencrypted).  
  Keep it in a safe place, do not share it.
- Session cookies (without an expiration date) are imported as a session;  
  some sites may reject them and ask you to log in again.
- `HttpOnly` and `Secure` cookies are restored correctly if you access  
  the site via HTTPS.

---

## Issues?

- **"No cookies found"**: make sure you are on the correct tab  
  and that the scope mode matches.
- **Failed to import cookies**: some sites use cookies strictly tied to the domain;  
  log in to those sites manually again.
- The extension **has no external server** — your data never leaves your PC.
  """

with open("README.md", "w", encoding="utf-8") as f:
f.write(content)
