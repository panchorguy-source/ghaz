# Global Institute of Studies (GIS) — Landing Page Development Brief

**Version:** 1.0  
**Language:** Bahasa Melayu (Malaysia)  
**Audience:** Parents/guardians aged approximately 40–55 with children aged 18, and SPM school-leavers  
**Objective:** Convert visitors into qualified enquiries for GIS TVET/SKM and Diploma programmes.

> This document is a **developer-ready specification**, not the website itself. The existing implementation is available separately in `gis-landing-page.zip` and should be used as the starting point. Photos included in the prototype are AI-generated illustrations, not actual GIS students or facilities.

## 1. Brand, visual direction and constraints

- Institution: **Global Institute of Studies (GIS)**, Nilai, Negeri Sembilan, Malaysia.
- Tone: professional, reassuring, family-oriented, credible and forward-looking.
- **Light mode only:** white/very light grey surfaces, GIS-style blue and warm yellow accents. Do not use a dark-mode theme.
- Hero: cinematic, **wide-screen 16:9 or wider**, with a Malaysian youth group placed to the right and sufficient negative space for headline/CTAs on the left. The image should crop well across screen sizes.
- Visuals: realistic Malaysian youth (about 18–22 years old), diverse appearances and appropriately dressed for technical/vocational or diploma learning. Prefer authentic GIS photography with permission for production use.
- Layout: clean spacing, rounded cards, subtle borders/shadows, strong visual hierarchy and large legible type for parents.
- Responsive breakpoints: desktop, tablet and mobile; avoid sideways scrolling.
- Animation: staggered scroll-reveal (fade/translate), gentle text transitions and subtle slow hero zoom; keep animations tasteful, avoid overuse, and honor `prefers-reduced-motion`.

## 2. Main message and campaign positioning

**Main headline:** “Masa depan anak anda bermula di sini.”  
**Support copy:** “Terokai laluan TVET, SKM dan Diploma yang menggabungkan pembelajaran praktikal, panduan pengajian dan persediaan ke dunia kerjaya.”  
**Primary CTA:** “Mohon Pendaftaran Online” or “Dapatkan Maklumat Program” (link to the enquiry section).  
**Secondary CTA:** “WhatsApp Penasihat GIS” (link to WhatsApp).

The page must address **five parent concerns** clearly and prominently:

1. **Pembiayaan:** Loan or financing assistance may be available depending on programme and student eligibility; do not promise universal approval.
2. **Peluang kerjaya:** Practical training, industry partnerships and assistance/guidance for placement; **do not guarantee employment**.
3. **Pengiktirafan:** Recognition/accreditation is programme-specific. Clearly distinguish JPK/SKM from MQA/Diploma; confirm each exact accreditation status before publishing.
4. **Penginapan:** GIS can assist with accommodation arrangements, subject to availability, pricing and conditions.
5. **Program relevan:** Practical programmes intended to match interests and industry needs; do not claim unverifiable placement or salary outcomes.

## 3. Page architecture and content

### A. Sticky header

- GIS official logo placeholder (replace with approved logo asset).
- Desktop links: Utama, Kelebihan GIS, Program, Soalan Lazim, Hubungi.
- Prominent yellow enrolment CTA.
- Mobile hamburger menu with proper expanded state, keyboard access and visible focus.

### B. Cinematic hero

- Full-bleed cinematic image with Malaysian students.
- Left-aligned hero eyebrow (e.g. “PILIHAN LEPASAN SPM”), headline, brief supporting paragraph and two CTAs.
- Give text sufficient contrast using a light gradient/overlay; avoid making the whole page dark.
- Display 2–3 concise credibility statements such as “TVET/SKM & Diploma”, “Bantuan Pembiayaan Mengikut Kelayakan”, “Khidmat Nasihat Pengajian”.
- Animation: one-time headline entrance and subtle hero-image motion; stop/reduce when preferred motion setting requests it.

### C. Five questions parents want answered

Five responsive cards with icons, succinct descriptions and links to detail or enquiries:

| Concern | Heading | Suggested copy |
|---|---|---|
| Funding | Bantuan Pembiayaan | “Semak pilihan bantuan pembiayaan atau pinjaman mengikut program dan kelayakan pelajar.” |
| Career | Peluang Kerjaya | “Pembelajaran amali, pendedahan industri dan panduan menuju kerjaya.” |
| Recognition | Program Diiktiraf | “Semak status JPK/SKM atau akreditasi MQA bagi program pilihan.” |
| Accommodation | Penginapan Pelajar | “Bantuan penginapan melalui pihak GIS tertakluk kepada ketersediaan.” |
| Relevance | Kursus Relevan | “Bidang kemahiran dan diploma yang berkaitan dengan keperluan pekerjaan.” |

### D. Programme discovery section

Two accessible tabs:

**TVET / Sijil Kemahiran (SKM)** — draft examples from the prototype:
- Teknologi Automotif
- Teknologi Kimpalan
- Seni Kulinari
- Pendidikan Awal Kanak-kanak

**Diploma** — draft examples from the prototype:
- Pengurusan Logistik & Pengangkutan
- Pengurusan Maritim
- Seni Kulinari
- Pengurusan Automotif
- Pendidikan Prasekolah
- Pentadbiran Perniagaan

Each programme card has a relevant image, programme category, title, concise summary and “Saya Berminat” link. **These are draft programme labels and must be confirmed with the GIS academic/marketing team before going live.** Never represent a draft programme as currently open for intake without verification.

Clicking a programme CTA scrolls to the enquiry form; optionally preserve the selected programme internally as metadata without adding a visible fourth field.

### E. “Kenapa pilih GIS?” / parents' reassurance section

Use concise paragraphs or a comparison-style visual to explain:
- Practical teaching and skills development.
- Explanation of financing requirements before applying.
- Accreditation verification and appropriate programme selection.
- Support in exploring employment pathways and industry connections.
- Hostel/accommodation enquiry support.

Avoid invented alumni outcomes, employer logos, placement rates and salary promises.

### F. FAQ / “Soalan Lazim”

Accessible accordion addressing:
- “Adakah semua program GIS diiktiraf?”
- “Bolehkah anak saya memohon pinjaman atau bantuan kewangan?”
- “Adakah GIS menjamin pekerjaan selepas tamat belajar?”
- “Adakah penginapan disediakan?”
- “Apakah perbezaan TVET/SKM dengan Diploma?”
- “Bagaimana proses pendaftaran?”

Answers must be plain-language, short, truthful and programme-specific where necessary.

### G. Lead capture / enquiry form

**Visible fields: only three:**
1. Nama penuh (`name`, required)
2. Nombor telefon (`phone`, required; Malaysian phone format validation)
3. Alamat e-mel (`email`, required; email format validation)

A short statement must clarify that this is an **enquiry/registration of interest**, not automatic admission. Provide privacy notice/consent wording suited to Malaysian PDPA requirements before live deployment.

Form interactions:
- Inline accessible validation; clear error/status announcements.
- Anti-bot honeypot and production spam protection/rate limiting.
- Prevent repeat submissions while awaiting a request.
- Send data to a configured Google Sheets-backed endpoint, or a secure backend.
- Show a truthful status message. **Do not claim storage success solely because a `no-cors` browser request completed.**
- If the endpoint has not been configured, offer a WhatsApp alternative; do not imply data was saved.

### H. WhatsApp contact

**Business contact number:** `012-66189332`  
**International number for WhatsApp URL:** `601266189332`  
**Default WhatsApp message (preserve wording):**

> saya berminat untuk mengetahui maklumat lanjut berkenaan program logistic.

Use:

```text
https://wa.me/601266189332?text=saya%20berminat%20untuk%20mengetahui%20maklumat%20lanjut%20berkenaan%20program%20logistic.
```

Add a floating WhatsApp button on mobile/desktop without obstructing the registration CTA.

### I. Footer

- GIS name and brief description.
- Quick navigation.
- Telephone: `06-850 0688`.
- Email: `info@gis.edu.my`.
- Website: `https://www.gis.edu.my/bm/`.
- Location: Putra Point, Nilai, Negeri Sembilan (verify official address).
- Privacy notice and copyright.
- Disclose prototype AI-created illustration images until replaced by official photographs.

## 4. Proposed technology and file structure

Implement as a lightweight, static, deployable website. The supplied starter already uses HTML5, CSS3 and vanilla JavaScript, so **no frontend framework is required** unless there is a clear deployment/maintenance reason.

```text
gis-landing-page/
├── index.html                 # Semantic content and page sections
├── assets/
│   ├── styles.css             # Light theme, responsive layout and transitions
│   ├── app.js                 # Navigation, tabs, FAQ, animations, form and WhatsApp
│   ├── hero-malaysian-students.webp
│   ├── automotif.webp
│   ├── kimpalan.webp
│   ├── elektrik.webp
│   ├── kulinari.webp
│   ├── logistik.webp
│   ├── maritim.webp
│   └── awal-kanak.webp
├── Code.gs                    # Optional Google Apps Script receiver
└── README.md                  # Setup / deployment notes
```

Use image lazy loading for below-the-fold media, width/height or aspect ratio to reduce layout shift, descriptive `alt` text, semantic headings, properly labelled controls and accessible tab/accordion interactions.

## 5. Google Sheets integration

**Desired data owner:** `panchorguy@gmail.com` (as requested previously). Account ownership does **not** mean the page can write to Google Sheets without explicit setup and authorization.

Target sheet: a private sheet such as **GIS Leads 2026**. Suggested columns:

| Timestamp | Name | Phone | Email | Source | Programme interest |
|---|---|---|---|---|---|

`Programme interest` can be metadata captured from a programme CTA, while preserving **only three visible form inputs**.

Implementation steps:
1. Create the Google Sheet in the chosen account.
2. Open **Extensions → Apps Script** and add or adapt the provided `Code.gs`.
3. Configure the spreadsheet ID via a Script Property (e.g. `SHEET_ID`) rather than hardcoding private account credentials.
4. Deploy the Apps Script as a Web App with appropriate execution/permissions.
5. Copy the `/exec` URL into `GIS_CONFIG.googleAppsScriptWebAppUrl` in `assets/app.js`.
6. Submit test leads and **verify the rows actually appear** in Sheets.
7. Limit Sheet access to authorized GIS staff. Protect against spam, unintended edits, leaks and malicious formula insertion. Apply a suitable data retention policy.

**Important engineering note:** Cross-origin browser `fetch(..., mode: 'no-cors')` cannot inspect the Apps Script response, so an opaque response is **not proof of a successful save**. For a production-grade verified success/error UX, use a controlled same-origin backend or CORS-capable proxy that returns an authenticated JSON response, with proper abuse prevention. Otherwise the front end must display a qualified status and the integration must be confirmed server-side.

## 6. Interaction and animation requirements

- Sticky header with smooth anchored navigation.
- Mobile menu opens/closes, reflects `aria-expanded`, closes after tapping a link.
- Scroll reveals use `IntersectionObserver`, trigger once, and do not hide content if JS fails.
- Tab keyboard support: Left/Right arrows plus Home/End; synchronized `aria-selected`, focus and panel visibility.
- FAQ accordion usable with keyboard and screen readers.
- Subtle hover animations on cards and CTAs.
- Respect `prefers-reduced-motion: reduce` (disable large movements and continuous zoom).
- Prevent animations from delaying crucial content, causing cumulative layout shifts or obstructing taps.

## 7. SEO, analytics and accessibility

- Set Malay page language `lang="ms"`.
- Use an SEO title such as “GIS Nilai | Program TVET, SKM & Diploma Selepas SPM”.
- Provide an accurate meta description and social share image (Open Graph).
- Use one H1, hierarchical H2/H3 sections, keyword-appropriate and non-spammy content.
- Measure enquiry-form submissions, form starts, WhatsApp clicks and programme-card interest clicks (with privacy safeguards); never send phone numbers/emails as analytics event labels.
- Maintain readable contrast, 44px-friendly touch targets, visible focus and full keyboard navigation.
- Test against WCAG 2.2 AA as a practical target.

## 8. Definition of done / acceptance criteria

- [ ] Works in recent Chrome, Edge, Safari and Firefox.
- [ ] Fully responsive at approximately 360px, 768px, 1280px and wide desktop widths.
- [ ] Uses a light color scheme with a wide cinematic Malaysian-student hero image.
- [ ] Animations and text transitions function and respect reduced motion.
- [ ] Clearly answers the five parent concerns without unverified guarantees.
- [ ] TVET/SKM and Diploma tabs work with mouse, touch and keyboard.
- [ ] Enquiry form contains **only name, phone and email** as visible inputs.
- [ ] Form validation works and true saving status is not misrepresented.
- [ ] Google Sheets integration is configured and verified using a test submission before launch.
- [ ] WhatsApp contact uses **601266189332** and the specified default message.
- [ ] Official logo, approved course list, accreditation claims, financing details, hostel details and privacy text are signed off by GIS.
- [ ] Contact links, page anchors, accessibility, load performance and mobile view are tested.

## 9. Materials that require GIS confirmation

1. Official logo and brand guidelines.
2. Current programme list, intake status and exact government recognition/accreditation for each offering.
3. Eligibility and current availability of education loans/financing.
4. Industry partnerships and exact form of career/placement support.
5. Hostel availability, pricing and facility photographs.
6. Institution privacy notice, data processing practices and named lead follow-up owner.

## 10. Existing starter deliverable

The companion implementation package `gis-landing-page.zip` contains a working visual prototype with the hero, programme cards, scroll animation, tabs, WhatsApp contact, three-field form and optional Apps Script receiver. **Use it as the implementation baseline** and refine according to this brief; do not mistake the current unconfigured Google Sheets endpoint for an active integration.

---

**End of development brief.**
