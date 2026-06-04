# 🍪 Cookie Porter

Simple browser extension to export and import cookies between browsers or devices.

---

## Contents

```text
cookie-porter/
├── manifest.json      # Extension configuration
├── popup.html         # User interface
├── popup.js           # Export / import logic
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Installation (Chrome & Edge)

### 1. Extract the ZIP file

Unzip the package into a permanent location on your computer:

```text
C:\Users\YourName\Extensions\cookie-porter
```

> [!IMPORTANT]
> Do not delete or move the folder after installation. Chromium-based browsers load unpacked extensions directly from this location.

### 2. Open the Extensions page

* **Chrome:** `chrome://extensions`
* **Edge:** `edge://extensions`

### 3. Enable Developer Mode

Turn on **Developer mode** using the toggle in the top-right corner.

### 4. Load the extension

Click **Load unpacked** and select the `cookie-porter` folder.

### 5. Verify installation

The extension should now appear in your browser toolbar.

> [!TIP]
> If the icon is hidden, open the extensions menu (puzzle icon) and pin **Cookie Porter**.

---

## Usage

### Export Cookies

1. Open the website whose cookies you want to save.
2. Click the **Cookie Porter** icon.
3. Select a scope:

   * Current Tab
   * Domain
   * All Cookies
4. Click **Export as JSON**.
5. Save the generated file wherever you prefer.

### Import Cookies

1. Install Cookie Porter on the target browser or computer.
2. Open the extension and switch to the **Import** tab.
3. Drag & drop a `.json` file or select it manually.
4. Review the detected cookies.
5. Click **Import Cookies**.

---

## Security Notes

> [!WARNING]
> Exported JSON files contain cookies in plain text and are **not encrypted**.

* Store exported files securely.
* Do not share cookie backups with other people.
* Anyone with access to the file may be able to access the associated accounts.

### Session Cookies

Cookies without an expiration date are restored as session cookies.

Some websites may invalidate these cookies and require a new login.

### Secure & HttpOnly Cookies

`Secure` and `HttpOnly` cookies are restored correctly when the target website is accessed over HTTPS.

---

## Troubleshooting

### No cookies found

* Verify that the correct browser tab is active.
* Confirm that the selected export scope matches your intention.

### Failed to import cookies

Some websites bind cookies to specific sessions, devices, or security contexts.

In those cases, you may need to sign in again manually.

### Privacy

Cookie Porter does not use external servers.

All processing happens locally inside your browser, and your data never leaves your computer.

---


