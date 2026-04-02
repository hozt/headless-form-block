# Headless Form Block

A WordPress Gutenberg block plugin that renders server-side HTML forms for **headless WordPress + Astro (astro-wp)** setups. WordPress acts as the content backend only — form markup is delivered through the REST or WPGraphQL API, and your Astro static site handles submission.

**Author:** [Jeffrey Haug](https://hozt.com)

---

## How it works

1. You add and configure the **Headless Form** block inside the WordPress editor.
2. WordPress stores the field definitions as block attributes (JSON).
3. On request, the PHP render callback produces a plain HTML `<form>` — no jQuery, no WP form libraries.
4. Your Astro site fetches the page content (REST/WPGraphQL), injects the rendered `<form>` HTML, and intercepts the submit event to POST to your own API endpoint or serverless function.
5. A Cloudflare Turnstile CAPTCHA placeholder (`<div id="cf-turnstile">`) is included automatically — wire it up in your Astro component.

---

## Features

- Drag-and-drop field ordering in the block editor
- Supported field types: **text, email, textarea, select, checkbox, radio, date, hidden, password**
- Per-field options: label, name, required, size / maxlength, rows / cols, options (comma-separated for select/radio)
- Form-level settings: Form Name, Email Subject (passed as a hidden field), Submit Button Text
- CSS classes on `<form>` and each `<div class="form-field">` for targeted styling
- Color-coded field types in the editor sidebar for quick scanning
- No front-end JavaScript dependency — submit handling is entirely yours

---

## Requirements

- WordPress 6.0+
- Node.js 18+ (for building the editor script)

---

## Installation

### From a zip archive

```bash
# In the plugin directory, create a distributable zip:
git archive --format=zip --output=headless-form-block.zip main

# Or, if wp-cli dist-archive is available (run from wp-content/plugins):
wp dist-archive headless-form-block
```

Upload the zip via **Plugins → Add New → Upload Plugin** in WordPress, then activate.

### Manual / development install

```bash
# Clone into your plugins directory
cd wp-content/plugins
git clone <repo-url> headless-form-block
cd headless-form-block

# Install dependencies and build the editor script
npm install
npm run build
```

Activate the plugin in **Plugins → Installed Plugins**.

---

## Development

```bash
npm run start   # watch mode — rebuilds src/index.js on change
npm run build   # production build → build/index.js
npm run clean   # remove dist/ (if used)
```

Source files:

| File | Purpose |
|---|---|
| `src/index.js` | Block editor UI — field builder, drag-and-drop, inspector controls |
| `block.json` | Block metadata and attribute schema |
| `headless-form-block.php` | Plugin bootstrap, block registration, PHP render callback |
| `styles/style.css` | Front-end form styles (loaded on public pages) |
| `styles/editor.css` | Compiled editor styles (loaded inside Gutenberg only) |

---

## Block attributes

| Attribute | Type | Default | Description |
|---|---|---|---|
| `formName` | string | `""` | Slug added as a CSS class on `<form>` |
| `emailSubject` | string | `""` | Emitted as `<input type="hidden" name="email_subject">` |
| `formFields` | array | `[]` | Ordered list of field definition objects |
| `submitButtonText` | string | `"Submit"` | Label on the submit button |

Each field object in `formFields`:

```json
{
  "id": "field-1700000000000",
  "type": "text",
  "label": "Your Name",
  "name": "your_name",
  "required": true,
  "size": 30,
  "maxLength": 100,
  "rows": "",
  "cols": "",
  "options": "",
  "value": ""
}
```

---

## Rendered HTML

```html
<form class="headless-form-block contact-form contact-page">
  <input type="hidden" name="email_subject" value="Contact Form Submission">

  <div class="form-field field-your-name form-field-text">
    <label for="your_name">Your Name <span class="required">*</span></label>
    <input type="text" id="your_name" name="your_name" size="30" maxlength="100" required>
  </div>

  <!-- …more fields… -->

  <div id="cf-turnstile"></div>
  <button type="submit" id="submitButton">Submit</button>
</form>
```

CSS classes on `<form>`: `headless-form-block`, a slug of the **Form Name**, and a slug of the **post slug**.

---

## Cloudflare Turnstile

The `<div id="cf-turnstile">` is rendered before the submit button on every form. In your Astro component, initialize Turnstile after the form mounts:

```js
// Example — replace with your actual site key
turnstile.render('#cf-turnstile', { sitekey: 'YOUR_SITE_KEY' });
```

Verify the token server-side in your form-handling API route before processing the submission.

---

## Styling

Front-end styles live in `styles/style.css` and are scoped to `.headless-form-block`. Override them in your Astro stylesheet:

```css
/* Example — increase max width and change button color */
.headless-form-block { max-width: 800px; }
.headless-form-block button[type="submit"] { background-color: #e63946; }
```

Field wrapper classes follow the pattern `field-{name}` and `form-field-{type}`, e.g. `field-your-name form-field-text`.

---

## License

GPL-2.0-or-later (WordPress plugin standard)
