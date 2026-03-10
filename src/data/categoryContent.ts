import type { ToolCategory } from "@/lib/tools";

export interface CategoryContent {
  slug: string;
  category: ToolCategory;
  name: string;
  headline: string;
  description: string;
  longDescription: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  faqs: { q: string; a: string }[];
  relatedCategories: string[];
  iconName: string;
  color: string;
  bgColor: string;
}

export const categoryContent: CategoryContent[] = [
  // ─── PDF ────────────────────────────────────────────────────────────────────
  {
    slug: "pdf",
    category: "PDF",
    name: "PDF Tools",
    headline: "Free PDF Tools — Merge, Split & Convert In Your Browser",
    description:
      "Merge multiple PDFs into one, split a document into individual pages, convert PDFs to images, or turn your photos into a PDF — all completely free and without uploading a single file. Every PDF operation runs entirely in your browser using WebAssembly, so your documents stay private.",
    longDescription: `Our PDF tools give you everything you need to work with PDF files without downloading heavy desktop software or paying for a subscription. Whether you need to combine reports, extract a few pages from a contract, or convert scanned photos into a shareable PDF, you can do it in seconds right inside your browser tab.

All processing happens locally on your device using WebAssembly-powered PDF engines. This means your files never leave your computer — not even for a split second. There are no upload limits, no file-size caps imposed by a server, and no watermarks added to your output documents.

Currently available tools include PDF Merge, PDF Split, PDF to Images, and Images to PDF. Coming soon: PDF Compress (reduce file size while preserving quality), PDF Password (add or remove password protection), and PDF Rotate (fix landscape or upside-down pages). Bookmark this page and check back soon.

We built these tools because PDF work shouldn't require a paid subscription or a privacy risk. Our goal is to provide professional-grade PDF utilities that work everywhere — desktop, tablet, and mobile — with zero friction.`,
    metaTitle: "Free PDF Tools — Merge, Split & Convert PDFs Online | QuickUtil",
    metaDescription:
      "Merge, split, convert, and edit PDFs free online. No upload required — all PDF tools run 100% in your browser. Fast, private, and no file-size limits.",
    keywords: [
      "free pdf tools",
      "merge pdf online",
      "pdf merger no upload",
      "split pdf free",
      "pdf to images",
      "images to pdf",
      "pdf editor online",
      "combine pdf files",
    ],
    faqs: [
      {
        q: "Is PDF merging completely free?",
        a: "Yes, all PDF tools on this site are 100% free. There are no hidden fees, no watermarks on merged PDFs, and no subscription required.",
      },
      {
        q: "Do my PDFs get uploaded to a server?",
        a: "No. Every PDF tool runs entirely in your browser using WebAssembly. Your files never leave your device and are never sent to any server.",
      },
      {
        q: "Is there a page limit when merging or splitting PDFs?",
        a: "There is no server-imposed page limit because processing happens locally. Very large files may be limited by your device's available memory.",
      },
      {
        q: "What PDF version is supported?",
        a: "Our tools support PDF versions 1.0 through 2.0, covering virtually all PDFs created by Adobe Acrobat, Word, LibreOffice, and modern printers.",
      },
      {
        q: "How many PDF files can I merge at once?",
        a: "You can merge as many PDFs as you like in a single session. Simply drag and drop all the files you want to combine, reorder them, and click Merge.",
      },
    ],
    relatedCategories: ["image", "converter", "developer"],
    iconName: "FileText",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },

  // ─── Image ──────────────────────────────────────────────────────────────────
  {
    slug: "image",
    category: "Image",
    name: "Image Tools",
    headline: "Free Image Tools — Compress, Resize & Convert Without Uploads",
    description:
      "Compress images to cut file sizes by up to 90%, resize to exact pixel dimensions, crop to any aspect ratio, convert between JPG, PNG, WebP and GIF, or add a custom text watermark — all free and 100% in-browser. Your photos never leave your device.",
    longDescription: `Images make up the majority of page weight on the web, and oversized images slow down websites and eat up storage. Our image tools let you compress, resize, crop, and convert images in seconds without ever uploading them to a server. Simply drag your file into the tool, adjust the settings, and download the result.

We support the most common image formats: JPEG, PNG, WebP, and GIF. Whether you're a developer optimising images for production, a blogger resizing photos before upload, or a designer preparing assets for print, you'll find the right tool here.

The Background Remover and Image Watermark tools use the Canvas API and client-side machine learning to process your images entirely on your device. This means your photos remain completely private — we never see them, store them, or analyse them.

Coming soon: batch processing for compression and resizing, so you can handle entire folders of images in one go. All tools are mobile-friendly and work on any modern browser.`,
    metaTitle: "Free Image Tools — Compress, Resize & Convert Images Online | QuickUtil",
    metaDescription:
      "Free online image compressor, resizer, cropper, and converter. Reduce image size without losing quality. No upload — all processing is in your browser.",
    keywords: [
      "free image compressor",
      "resize image online",
      "compress image without losing quality",
      "image converter online",
      "crop image free",
      "webp converter",
      "jpg to png",
      "image optimizer",
    ],
    faqs: [
      {
        q: "What image formats are supported?",
        a: "Our tools support JPEG, PNG, WebP, and GIF. The Image Convert tool lets you switch between all four formats freely.",
      },
      {
        q: "Does compressing an image affect quality?",
        a: "Lossy compression (used for JPEG/WebP) does reduce quality slightly, but our default settings are tuned to be imperceptible to the human eye while achieving maximum file-size reduction. You can always adjust the quality slider.",
      },
      {
        q: "Can I compress multiple images at once?",
        a: "The Image Compress tool supports batch input — you can drop several images at once and download them all compressed. Additional batch tools for resize and convert are coming soon.",
      },
      {
        q: "Do my images get uploaded to a server?",
        a: "No. All image processing — compression, resizing, cropping, conversion, and watermarking — runs entirely in your browser. Your images never leave your device.",
      },
      {
        q: "Is there a file size limit?",
        a: "There is no server-side file size limit since processing is local. Extremely large images (50 MB+) may be slow depending on your device's memory and CPU speed.",
      },
    ],
    relatedCategories: ["pdf", "converter", "generator"],
    iconName: "ImageIcon",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },

  // ─── Calculator ─────────────────────────────────────────────────────────────
  {
    slug: "calculator",
    category: "Calculator",
    name: "Calculator Tools",
    headline: "Free Online Calculators — BMI, Mortgage, Tip & More",
    description:
      "From BMI and mortgage payments to tip splitting, age calculation, and scientific math — our calculators give you instant, accurate results with no ads, no sign-up, and no data collection. Works perfectly on mobile.",
    longDescription: `Whether you need to check your BMI before a doctor's appointment, figure out monthly payments on a new loan, or just split a restaurant bill fairly, our calculators have you covered. Every calculator on this site is free, works instantly, and runs entirely in your browser.

Our collection covers everyday needs: the BMI Calculator uses WHO standards to classify weight; the Loan Calculator produces a full amortization schedule; the Percentage Calculator handles increase, decrease, and ratio calculations; the Age Calculator gives you your exact age in years, months, and days; and the Tip Calculator splits bills fairly for any group size.

For productivity, we include a Pomodoro Timer to help you stay focused, a Stopwatch with lap tracking, and a Countdown Timer with audio alerts. The Timezone Converter makes it easy to schedule meetings across countries, and the Scientific Calculator supports trigonometry, logarithms, and exponents with full calculation history.

No account is required, no data is saved to any server, and all calculators are fully mobile-responsive. Results are calculated client-side and never transmitted anywhere.`,
    metaTitle: "Free Online Calculators — BMI, Mortgage, Tip & More | QuickUtil",
    metaDescription:
      "Free online calculators for BMI, mortgage payments, percentages, age, tips, and more. No sign-up, no ads, instant results on any device.",
    keywords: [
      "free online calculator",
      "bmi calculator",
      "mortgage calculator",
      "loan calculator",
      "tip calculator",
      "percentage calculator",
      "age calculator",
      "scientific calculator",
    ],
    faqs: [
      {
        q: "Are the calculators mathematically accurate?",
        a: "Yes. All calculators use standard, industry-accepted formulas. For example, the mortgage calculator uses the standard amortization formula, and the BMI calculator follows WHO guidelines.",
      },
      {
        q: "Are there any fees or subscriptions?",
        a: "No. Every calculator on this site is completely free to use with no subscription, no premium tier, and no hidden charges.",
      },
      {
        q: "Do the calculators work on mobile?",
        a: "Yes. All calculators are designed to be fully responsive and work well on smartphones, tablets, and desktops.",
      },
      {
        q: "Do I need an account to use the calculators?",
        a: "No. You can use every calculator immediately without creating an account or providing any personal information.",
      },
      {
        q: "Is my input data saved anywhere?",
        a: "No. All calculations happen in your browser and no data is ever sent to a server or stored in any database.",
      },
    ],
    relatedCategories: ["math", "finance", "health"],
    iconName: "Calculator",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },

  // ─── Text ───────────────────────────────────────────────────────────────────
  {
    slug: "text",
    category: "Text",
    name: "Text Tools",
    headline: "Free Text Tools — Word Counter, Case Converter & More Online",
    description:
      "Count words and characters, convert case, check readability scores, compare text differences, generate slugs, validate emails, and more — all free, instant, and without storing your content anywhere.",
    longDescription: `Text is the foundation of communication, and our text tools help you write, analyse, and transform it efficiently. From a simple word count to a full readability analysis using Flesch-Kincaid, Gunning Fog, and SMOG scores, these tools are designed for writers, developers, SEO specialists, and content marketers alike.

The Word Counter updates in real time as you type, showing words, characters (with and without spaces), sentences, paragraphs, and estimated reading time. The Case Converter supports eight case styles including camelCase, snake_case, and kebab-case — essential for developers working across different naming conventions.

The Text Diff Checker highlights additions, deletions, and changes between any two blocks of text, making it invaluable for proofreading edits or comparing versions of documents. The Keyword Density Checker analyses your content for SEO, showing word frequency and density percentages instantly.

Additional tools include a Lorem Ipsum Generator for placeholder content, an Email Validator for checking address formats, a Text to Slug converter for creating clean URLs, a Markdown to HTML converter with live preview, and a Readability Checker to improve the clarity of your writing. All processing happens in your browser — your text is never stored or transmitted.`,
    metaTitle: "Free Text Tools — Word Counter, Case Converter & Readability | QuickUtil",
    metaDescription:
      "Free online text tools: word counter, case converter, readability checker, text diff, lorem ipsum, and more. No login, instant results, text stays in your browser.",
    keywords: [
      "word counter online",
      "case converter",
      "readability checker",
      "text diff tool",
      "lorem ipsum generator",
      "keyword density checker",
      "text to slug",
      "markdown to html",
    ],
    faqs: [
      {
        q: "Is the word count accurate?",
        a: "Yes. The Word Counter splits text on whitespace and punctuation boundaries, consistent with how most word processors count words. It also counts characters, sentences, and paragraphs separately.",
      },
      {
        q: "What readability scoring methods are used?",
        a: "The Readability Checker calculates five scores: Flesch Reading Ease, Flesch-Kincaid Grade Level, Gunning Fog Index, SMOG Index, and the Automated Readability Index (ARI).",
      },
      {
        q: "Can I paste large blocks of text?",
        a: "Yes. There is no practical character limit for pasting text. All tools process text in-memory in your browser, so performance depends only on your device.",
      },
      {
        q: "Is there a character or word limit?",
        a: "There is no enforced limit. For very large documents (100,000+ words), some tools may take a moment to process, but they will complete without errors.",
      },
      {
        q: "Is my text saved or sent to a server?",
        a: "No. All text processing happens entirely in your browser using JavaScript. Your content is never sent to any server or stored in any database.",
      },
    ],
    relatedCategories: ["developer", "generator", "converter"],
    iconName: "Type",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },

  // ─── Converter ──────────────────────────────────────────────────────────────
  {
    slug: "converter",
    category: "Converter",
    name: "Converter Tools",
    headline: "Free Online Converters — Units, Color, Currency & More",
    description:
      "Convert between metric and imperial units, HEX/RGB/HSL colors, CSV and JSON data formats, binary and hexadecimal numbers, Roman numerals, and world currencies — all free, instant, and running entirely in your browser.",
    longDescription: `Conversion tools are essential for developers, designers, scientists, and anyone working across different systems and formats. Our converter collection covers the most common real-world conversion needs without requiring any account or software installation.

The Unit Converter handles length, weight, temperature, speed, area, volume, and digital data units — switching between metric and imperial systems instantly. The Color Converter supports HEX, RGB, HSL, HSV, and CMYK with a live color preview, making it a daily companion for web designers and front-end developers.

For data work, the CSV to JSON Converter and its reverse let you switch between spreadsheet and API-friendly formats in a single click. The Base64 Encode/Decode tool handles text and binary files, while the Binary/Hex/Octal Converter is indispensable for low-level programming tasks.

The Number to Words converter is useful for writing cheques and legal documents, while the Roman Numeral Converter handles numbers up to 3,999. The Currency Converter provides fast conversion between 30+ world currencies. All tools work offline once the page is loaded, and none of your data is ever sent to a server.`,
    metaTitle: "Free Online Converters — Unit, Color, Currency & Data | QuickUtil",
    metaDescription:
      "Free unit converter, color converter, currency converter, CSV to JSON, Base64, and more. Instant online conversions with no upload and no sign-up required.",
    keywords: [
      "unit converter",
      "currency converter",
      "color converter",
      "csv to json",
      "base64 encoder",
      "binary to hex converter",
      "roman numeral converter",
      "number to words",
    ],
    faqs: [
      {
        q: "How accurate are the unit conversions?",
        a: "All unit conversions use exact or internationally standardised conversion factors (e.g., 1 inch = 25.4 mm exactly). Results are accurate to the precision of JavaScript's 64-bit floating-point arithmetic.",
      },
      {
        q: "Are live exchange rates used for currency conversion?",
        a: "The Currency Converter fetches rates from a public exchange rate API. Rates are indicative and may differ slightly from bank or institutional rates.",
      },
      {
        q: "Does the unit converter support all measurement systems?",
        a: "Yes. The Unit Converter supports metric (SI), imperial, and US customary units across length, mass, temperature, speed, area, volume, and digital storage categories.",
      },
      {
        q: "Do the converters work offline?",
        a: "Most converters work fully offline once the page is loaded, as all logic runs in JavaScript. The Currency Converter requires an internet connection to fetch current exchange rates.",
      },
      {
        q: "Are the converters free to use?",
        a: "Yes, all converters are completely free with no usage limits, no account required, and no watermarks.",
      },
    ],
    relatedCategories: ["developer", "math", "finance"],
    iconName: "ArrowLeftRight",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },

  // ─── Generator ──────────────────────────────────────────────────────────────
  {
    slug: "generator",
    category: "Generator",
    name: "Generator Tools",
    headline: "Free Online Generators — QR Codes, Barcodes, UUIDs & More",
    description:
      "Generate QR codes, barcodes, UUIDs, color palettes, fake test data, and Lorem Ipsum placeholder text instantly — all free, downloadable, and processed entirely in your browser with no data sent to any server.",
    longDescription: `Our generator tools save you time on repetitive creation tasks that developers, designers, and marketers face every day. Whether you need a QR code for a product label, a UUID for a new database record, or a realistic-looking dataset for testing, you can generate it here in seconds.

The QR Code Generator supports URLs, plain text, email addresses, and Wi-Fi credentials. You can customise the size, colors, and error-correction level, then download the result as a PNG or SVG. The Barcode Generator supports Code128, EAN-13, and UPC-A formats — the industry standards for retail and logistics.

For developers and QA engineers, the Fake Data Generator creates realistic test data including names, email addresses, phone numbers, and postal addresses. The UUID Generator produces cryptographically random v4 UUIDs in bulk, supporting lowercase, uppercase, and no-dash formats.

Creative tools include the Color Palette Generator, which creates complementary, triadic, analogous, and monochromatic palettes from any seed color and exports them as CSS variables. The Lorem Ipsum Generator produces placeholder text by paragraphs, sentences, or words. All generators run client-side — nothing you create is stored on our servers.`,
    metaTitle: "Free Online Generators — QR Code, Barcode, UUID & More | QuickUtil",
    metaDescription:
      "Free QR code generator, barcode generator, UUID generator, color palette generator, and fake data generator. Instant results, no upload, no sign-up.",
    keywords: [
      "qr code generator",
      "barcode generator",
      "uuid generator",
      "color palette generator",
      "fake data generator",
      "lorem ipsum generator",
      "free online generator",
      "random data generator",
    ],
    faqs: [
      {
        q: "Can I download the generated output?",
        a: "Yes. QR codes and barcodes can be downloaded as PNG or SVG files. UUIDs and fake data can be copied to the clipboard or downloaded as a text/CSV file.",
      },
      {
        q: "What QR code format is generated?",
        a: "QR codes are generated as standard ISO/IEC 18004 QR codes, readable by all modern smartphone cameras and QR scanning apps without any special software.",
      },
      {
        q: "Are generated passwords or UUIDs stored anywhere?",
        a: "No. All generated output — including passwords, UUIDs, and fake data — is created in your browser and never sent to or stored on any server.",
      },
      {
        q: "How random are the generated UUIDs?",
        a: "UUIDs are generated using the Web Crypto API's `crypto.getRandomValues()`, which is a cryptographically secure pseudorandom number generator (CSPRNG) suitable for production use.",
      },
      {
        q: "Is it safe to use fake data generated here in tests?",
        a: "Yes. The fake data is generated locally and is completely fictional. It follows realistic patterns for names, emails, and addresses but does not correspond to any real person.",
      },
    ],
    relatedCategories: ["security", "developer", "text"],
    iconName: "Sparkles",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },

  // ─── Security ───────────────────────────────────────────────────────────────
  {
    slug: "security",
    category: "Security",
    name: "Security Tools",
    headline: "Free Security Tools — Password Generator, Hash & JWT Tools",
    description:
      "Generate strong random passwords, compute MD5/SHA-256/SHA-512 hashes, decode JWT tokens, and create fake test data — all security-critical operations that run exclusively in your browser with zero server contact.",
    longDescription: `Security tools need to be trustworthy by design, and the most trustworthy design is one where your data never leaves your device. Every tool in this security category processes your input entirely in your browser using the Web Crypto API and well-audited open-source libraries.

The Password Generator creates cryptographically random passwords of any length, with full control over which character sets to include: uppercase letters, lowercase letters, numbers, and symbols. A built-in strength indicator shows you how strong your generated password is in real time.

The Hash Generator computes MD5, SHA-1, SHA-256, and SHA-512 hashes for any text input or file. It also supports HMAC with a secret key. These tools are useful for verifying file integrity, storing password hashes in development, and comparing checksums.

The JWT Decoder parses any JSON Web Token and displays the decoded header, payload claims, and expiry time in a readable format. It works entirely offline — your token is never sent to a server, making it safe to use with real tokens from your staging and production environments.

All security tools are built to the principle of least privilege: they request no permissions, store nothing, and transmit nothing.`,
    metaTitle: "Free Security Tools — Password Generator, Hash & JWT Online | QuickUtil",
    metaDescription:
      "Free password generator, hash generator (MD5, SHA-256, SHA-512), and JWT decoder. All security tools run 100% in your browser — nothing is ever transmitted.",
    keywords: [
      "password generator",
      "hash generator online",
      "md5 sha256 online",
      "sha512 hash",
      "jwt decoder",
      "secure password maker",
      "hmac generator",
      "checksum calculator",
    ],
    faqs: [
      {
        q: "Are generated passwords stored anywhere?",
        a: "No. Passwords are generated using the browser's Web Crypto API and exist only in your current browser tab. They are never sent to any server or logged anywhere.",
      },
      {
        q: "How random are the generated passwords?",
        a: "Passwords are generated using `crypto.getRandomValues()`, a cryptographically secure random number generator built into every modern browser. This is the same standard used by password managers.",
      },
      {
        q: "What hash algorithms are supported?",
        a: "The Hash Generator supports MD5, SHA-1, SHA-224, SHA-256, SHA-384, and SHA-512, as well as HMAC variants for all SHA algorithms.",
      },
      {
        q: "Is it safe to paste a real JWT token into the JWT Decoder?",
        a: "Yes. The JWT Decoder runs entirely in your browser and never sends your token to any server. It is safe to use with tokens from any environment, including production.",
      },
      {
        q: "Can anyone else verify my hash output?",
        a: "Hashes are deterministic — anyone who hashes the same input with the same algorithm will get the same output. This is by design and is how hash verification works.",
      },
    ],
    relatedCategories: ["developer", "generator", "converter"],
    iconName: "Lock",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
  },

  // ─── Developer ──────────────────────────────────────────────────────────────
  {
    slug: "developer",
    category: "Developer",
    name: "Developer Tools",
    headline: "Free Developer Tools — JSON, Regex, JWT, SQL & More Online",
    description:
      "Format and validate JSON, test regular expressions with live highlighting, decode JWTs, minify CSS, format SQL, encode URLs, parse cron expressions, encode HTML entities, and convert Base64 — all in your browser, all free.",
    longDescription: `Developer tools should be fast, reliable, and private. Every tool in this collection loads instantly and works without sending your code to a server — critical when you're working with proprietary SQL queries, internal API tokens, or production JWT credentials.

The JSON Formatter validates your JSON in real time, highlights errors with line numbers, and lets you switch between pretty-printed and minified output. The Regex Tester provides live match highlighting, match count, named capture groups, and all standard flags (g, i, m, s, u, y) — making it far easier to debug complex patterns than trial and error in code.

The JWT Decoder reveals the complete header, payload, and claims of any JSON Web Token, including expiry time formatted in your local timezone. The SQL Formatter beautifies messy queries with proper indentation for SELECT, INSERT, UPDATE, DELETE, and complex JOINs. The Cron Expression Parser translates any 5- or 6-field cron string into plain English and shows the next 10 scheduled run times.

Additional tools include CSS Minifier for shrinking stylesheet file sizes, URL Encoder/Decoder for handling query parameters, HTML Entities Encoder for escaping special characters, Base64 Encode/Decode for data encoding tasks, Binary/Hex/Octal Converter for low-level work, and Hash Generator for computing checksums. All tools are keyboard-friendly and designed for developer workflows.`,
    metaTitle: "Free Developer Tools — JSON Formatter, Regex Tester, JWT & More | QuickUtil",
    metaDescription:
      "Free developer tools online: JSON formatter, regex tester, JWT decoder, SQL formatter, URL encoder, cron parser. All run in-browser, no data sent to servers.",
    keywords: [
      "json formatter",
      "regex tester online",
      "jwt decoder",
      "sql formatter",
      "css minifier",
      "url encoder decoder",
      "cron expression parser",
      "html entities encoder",
      "base64 online",
      "developer tools online",
    ],
    faqs: [
      {
        q: "What JSON features does the formatter support?",
        a: "The JSON Formatter validates JSON syntax, highlights errors with line and column numbers, supports pretty-printing with 2 or 4 space indentation, and minifies JSON for production use.",
      },
      {
        q: "Does the regex tester support all JavaScript flags?",
        a: "Yes. The Regex Tester supports all standard JavaScript regex flags: global (g), case-insensitive (i), multiline (m), dotAll (s), Unicode (u), and sticky (y).",
      },
      {
        q: "Is the SQL formatter aware of different SQL dialects?",
        a: "The SQL Formatter uses a general ANSI SQL beautifier that works well with MySQL, PostgreSQL, SQLite, and MS SQL Server syntax. Dialect-specific keywords may not be perfectly indented in all cases.",
      },
      {
        q: "Can I save my work between sessions?",
        a: "Currently, work is not persisted between sessions. We recommend copying your formatted output to your editor or using your browser's local storage manually.",
      },
      {
        q: "Is my JWT token sent anywhere when I decode it?",
        a: "No. The JWT Decoder parses the token entirely in your browser using JavaScript's `atob()` and JSON parsing. Your token never leaves your device.",
      },
    ],
    relatedCategories: ["security", "converter", "text"],
    iconName: "Code2",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },

  // ─── Health ─────────────────────────────────────────────────────────────────
  {
    slug: "health",
    category: "Health",
    name: "Health Tools",
    headline: "Free Health Calculators — BMI, Calories, Due Date & More",
    description:
      "Calculate your BMI using WHO standards, find your daily calorie and macro targets, estimate your pregnancy due date and milestones, and compute exact date differences — free health tools that keep your personal data private.",
    longDescription: `Health calculations are personal, and personal data should stay on your device. Every tool in this health category runs entirely in your browser — your weight, height, age, and other health inputs are never sent to any server or stored in any database.

The BMI Calculator uses the standard WHO Body Mass Index formula (weight in kg divided by height in metres squared) and provides your BMI value alongside the corresponding weight classification: Underweight, Normal weight, Overweight, or Obese. It supports both metric and imperial inputs.

The Calorie & Macro Calculator computes your Total Daily Energy Expenditure (TDEE) using the Mifflin-St Jeor formula — the most widely recommended BMR equation in current nutrition science. It then adjusts for your activity level and goal (lose weight, maintain, or gain muscle) to produce personalised calorie and macronutrient targets.

The Pregnancy Due Date Calculator lets you enter your last menstrual period (LMP) or known conception date to estimate your due date, current gestational week, and trimester, plus key developmental milestones. The Date Difference Calculator rounds out the category, computing exact intervals between any two dates in years, months, weeks, and days.

These tools are intended as a helpful reference and should not replace professional medical advice. Always consult a qualified healthcare provider for medical decisions.`,
    metaTitle: "Free Health Calculators — BMI, Calorie & Due Date | QuickUtil",
    metaDescription:
      "Free BMI calculator, calorie & macro calculator, pregnancy due date calculator, and date difference tool. Private, in-browser health tools with no data storage.",
    keywords: [
      "bmi calculator",
      "calorie calculator",
      "due date calculator",
      "tdee calculator",
      "macro calculator",
      "pregnancy calculator",
      "body mass index",
      "bmr calculator",
    ],
    faqs: [
      {
        q: "How is BMI calculated?",
        a: "BMI is calculated as weight (kg) divided by height (m) squared. For imperial inputs, the formula is weight (lb) × 703 divided by height (in) squared. WHO classifications range from Underweight (<18.5) to Obese (≥30).",
      },
      {
        q: "Are these health tools medically accurate?",
        a: "The tools use standard, widely-accepted medical formulas (WHO BMI classifications, Mifflin-St Jeor for TDEE, Naegele's rule for due dates). However, they are for reference only and do not replace professional medical advice.",
      },
      {
        q: "Is my health data private?",
        a: "Yes. All inputs — including your weight, height, age, and health goals — are processed exclusively in your browser and are never sent to any server or stored in any database.",
      },
      {
        q: "Which BMR formula is used in the Calorie Calculator?",
        a: "The Calorie Calculator uses the Mifflin-St Jeor equation, which is currently recommended by the Academy of Nutrition and Dietetics as the most accurate BMR formula for the general population.",
      },
      {
        q: "What is the calorie target based on?",
        a: "The calorie target is your BMR multiplied by an activity factor (sedentary to very active), then adjusted by ±250–500 calories depending on your goal: lose weight, maintain weight, or build muscle.",
      },
    ],
    relatedCategories: ["calculator", "finance", "math"],
    iconName: "Heart",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },

  // ─── Finance ────────────────────────────────────────────────────────────────
  {
    slug: "finance",
    category: "Finance",
    name: "Finance Tools",
    headline: "Free Financial Calculators — Mortgage, Currency, VAT & More",
    description:
      "Calculate mortgage payments and amortization schedules, convert currencies, compute VAT and sales tax, find discount savings, project compound interest growth, and estimate investment returns — all free, private, and in-browser.",
    longDescription: `Financial planning shouldn't require expensive software or sharing your numbers with a third-party service. Our finance tools give you professional-grade calculations for everyday financial decisions, from monthly mortgage payments to long-term investment projections.

The Mortgage Calculator uses the standard amortization formula to compute your monthly principal and interest payment, total interest paid over the loan term, and a full month-by-month amortization schedule. It also supports extra monthly payments so you can see how overpaying reduces your loan term and total interest.

The Currency Converter provides fast conversion between 30+ world currencies including USD, EUR, GBP, JPY, INR, AUD, and more. The VAT Calculator lets you add or remove VAT/GST/sales tax at any rate, making it ideal for invoicing and shopping calculations.

The Compound Interest Calculator shows how investments grow over time with configurable compounding frequency (daily, monthly, quarterly, annually), while the Investment Return Calculator computes ROI, total return, and annualised return for any investment. The Discount Calculator quickly finds sale prices, savings amounts, and original prices from any percentage-off deal.

All financial inputs remain private in your browser. No data is shared with financial institutions, advertisers, or any third party.`,
    metaTitle: "Free Financial Calculators — Mortgage, Currency, VAT & More | QuickUtil",
    metaDescription:
      "Free mortgage calculator, currency converter, VAT calculator, compound interest, and investment return tools. Private, in-browser finance calculators with no data storage.",
    keywords: [
      "mortgage calculator",
      "vat calculator",
      "currency converter",
      "compound interest calculator",
      "investment return calculator",
      "discount calculator",
      "loan amortization",
      "financial calculator online",
    ],
    faqs: [
      {
        q: "Are the financial calculations accurate?",
        a: "Yes. All formulas follow standard financial conventions — the mortgage calculator uses the standard annuity amortization formula, compound interest uses the standard A = P(1 + r/n)^(nt) formula, and ROI is calculated as (gain − cost) / cost × 100.",
      },
      {
        q: "Are the currency exchange rates live?",
        a: "The Currency Converter fetches rates from a public exchange rate API. Rates are updated regularly and are indicative — for large transactions, always verify with your bank or broker.",
      },
      {
        q: "Is the mortgage formula the same as what banks use?",
        a: "The mortgage calculator uses the standard amortization formula used globally by banks and lenders for fixed-rate mortgages. Variable-rate and offset mortgage products require specialised calculations beyond this tool.",
      },
      {
        q: "Can I print or save my calculation results?",
        a: "Yes. You can use your browser's Print function (Ctrl+P / Cmd+P) to print any results page or save it as a PDF.",
      },
      {
        q: "Are my financial details stored anywhere?",
        a: "No. All inputs — including loan amounts, interest rates, and investment figures — are processed exclusively in your browser and never sent to any server.",
      },
    ],
    relatedCategories: ["calculator", "math", "converter"],
    iconName: "DollarSign",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },

  // ─── Math ───────────────────────────────────────────────────────────────────
  {
    slug: "math",
    category: "Math",
    name: "Math Tools",
    headline: "Free Math Tools — Statistics, Compound Interest & Grade Calculator",
    description:
      "Compute descriptive statistics, project compound interest growth, calculate investment ROI, find weighted grade averages and GPA, work out percentages, and perform advanced scientific calculations — all free, accurate, and in-browser.",
    longDescription: `Mathematics underpins every quantitative decision, and our math tools give you fast, accurate answers without needing a graphing calculator, spreadsheet, or specialist software. Every tool runs in your browser with zero data transmission.

The Statistics Calculator accepts a comma-separated list of numbers and instantly computes the mean, median, mode, range, variance, population standard deviation, sample standard deviation, minimum, maximum, and sum. It's ideal for students, data analysts, and anyone working with numerical datasets.

The Compound Interest Calculator visualises investment growth using the A = P(1 + r/n)^(nt) formula, with configurable compounding frequency. The Investment Return Calculator computes total return, ROI percentage, and annualised (CAGR) return for any investment, supporting both simple and compound growth models.

The Grade / GPA Calculator supports weighted assignments — add each task with its score and weight, and the calculator determines your overall grade percentage and GPA on the standard 4.0 scale. The Percentage Calculator handles three common calculations: find X% of a number, calculate what percentage one number is of another, and compute percentage increase or decrease.

The Scientific Calculator provides sin, cos, tan, log, natural log, square root, exponentiation, and factorial functions with full calculation history and support for both degree and radian modes.`,
    metaTitle: "Free Math Tools — Statistics, Compound Interest & Grade Calculator | QuickUtil",
    metaDescription:
      "Free statistics calculator, compound interest calculator, grade and GPA calculator, percentage calculator, and scientific calculator. Instant, accurate, in-browser math tools.",
    keywords: [
      "statistics calculator",
      "compound interest calculator",
      "grade calculator",
      "gpa calculator",
      "percentage calculator",
      "scientific calculator",
      "standard deviation calculator",
      "investment return calculator",
    ],
    faqs: [
      {
        q: "What statistical measures does the Statistics Calculator compute?",
        a: "The Statistics Calculator computes mean, median, mode, range, minimum, maximum, sum, count, population variance, sample variance, population standard deviation, and sample standard deviation.",
      },
      {
        q: "Is the compound interest formula standard?",
        a: "Yes. The formula used is A = P(1 + r/n)^(nt), where P is principal, r is annual interest rate, n is compounding frequency per year, and t is time in years. This is the internationally standard compound interest formula.",
      },
      {
        q: "How is GPA calculated in the Grade Calculator?",
        a: "The Grade Calculator converts your weighted percentage score to a GPA on the 4.0 scale using the standard US grading rubric: A (90–100%) = 4.0, B (80–89%) = 3.0, C (70–79%) = 2.0, D (60–69%) = 1.0, F (<60%) = 0.0.",
      },
      {
        q: "What formula does the Investment Return Calculator use?",
        a: "For total return it uses (Final Value − Initial Investment) / Initial Investment × 100. For annualised return (CAGR), it uses (Final / Initial)^(1/years) − 1 × 100, which is the standard compound annual growth rate formula.",
      },
      {
        q: "Can I export or save my calculation results?",
        a: "You can copy results to the clipboard from any tool, or use your browser's Print function (Ctrl+P / Cmd+P) to save a PDF of your results. Persistent save functionality is on our roadmap.",
      },
    ],
    relatedCategories: ["finance", "calculator", "converter"],
    iconName: "Sigma",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
];

export function getCategoryBySlug(slug: string): CategoryContent | undefined {
  return categoryContent.find((c) => c.slug === slug);
}
