# Shadow AI Detection Assessment

Production-ready static frontend for:

`https://tanishqsingh.in/shadow-ai-assessment/`

## Files

- `index.html` — answer-first SEO/AEO/GEO page + assessment UI
- `styles.css` — isolated styles; does not depend on the portfolio CSS
- `script.js` — question rendering, progress, validation, results gate and API integration

## Deploy

Create this directory in the existing `WebFolio` repository:

```text
shadow-ai-assessment/
  index.html
  styles.css
  script.js
```

The page uses independent branding and identifies itself as an **Independent security research experiment**.

## UX notes

- The hero is sized so the primary CTA is visible on a normal desktop viewport without requiring an initial scroll.
- The assessment is visually separated from the informational content.
- A prominent “Assessment starts here” block marks the beginning of the interactive section.
- Every item is explicitly labeled `QUESTION 01 / 12`, `QUESTION 02 / 12`, etc., with a distinct control-question label, category badge and visible selection controls.
- The progress indicator stays visible beside the question set on desktop and moves above it on smaller screens.

## Before launch

1. Deploy the folder to GitHub Pages.
2. Deploy the Cloudflare Worker endpoint that validates the 12 answers server-side, stores the lead in D1 and sends the requested report through the dedicated transactional sending subdomain.
3. Put the Worker URL into `CONFIG.API_ENDPOINT` in `script.js`.
4. Keep `DEMO_MODE: false` in production.
5. Test invalid input, duplicate submissions, CORS, rate limits, email delivery and server-side score recalculation.
6. Add the URL to the site's sitemap and an internal link from the main site after the page is live.
7. Request indexing through Google Search Console after deployment.

## Worker response contract

The frontend expects:

```json
{
  "ok": true,
  "result": {
    "score": 17,
    "maxScore": 24,
    "band": "Established control coverage",
    "summary": "...",
    "categories": [
      {"name":"Discovery","score":3,"max":4,"label":"Developing"}
    ]
  }
}
```

The Worker must **recalculate the score from the submitted answers**. Never trust a score supplied by the browser.

## Assessment scoring

Each of 12 questions has three response levels:

- `0` — no / unknown / not established
- `1` — partial
- `2` — established

Maximum = 24.

Score bands are deliberately described as **control coverage screening**, not security maturity, assurance, compliance or certification.

## Privacy / data minimization

Collect only:

- work email
- job title
- company
- optional LinkedIn URL
- assessment answers
- timestamp / referrer / UTM metadata needed to measure the experiment

Do not collect passwords, credentials, confidential information, customer data or security-sensitive environment details.

## Latest UX refinement

- Every assessment question is now contained entirely inside its own question card; the question label, prompt, category, and answer controls share one clear visual boundary.
- The progress indicator becomes a compact sticky header once the question list begins scrolling.
- That sticky progress state persists through the results gate and revealed results, then hides again after the result card has been scrolled past.

- Sticky progress uses a translucent glass treatment and hides when the Continue to results area is passed or opened.
