#!/usr/bin/env node

/**
 * A/B Variator Agent
 *
 * Generates N variations of headline/CTA for a given content file.
 * Creates copies with different titles and CTA text for split testing.
 *
 * Usage:
 *   node scripts/ab-variator.mjs --file src/content/articles/vitamins-guide.md --count 3
 *
 * Requires: GEMINI_API_KEY environment variable
 */

import { readFileSync, writeFileSync } from 'fs';
import { basename, dirname, extname, join } from 'path';

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}

const filePath = getArg('file');
const count = parseInt(getArg('count') || '3', 10);
const apiKey = process.env.GEMINI_API_KEY;

if (!filePath) {
  console.error('Usage: node ab-variator.mjs --file <path> --count <n>');
  process.exit(1);
}

if (!apiKey) {
  console.error('Error: GEMINI_API_KEY not set');
  process.exit(1);
}

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

async function callGemini(prompt) {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 1024 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function main() {
  const content = readFileSync(filePath, 'utf-8');
  const ext = extname(filePath);
  const dir = dirname(filePath);
  const name = basename(filePath, ext);

  const titleMatch = content.match(/title:\s*["']?(.+?)["']?\s*$/m);
  const ctaMatch = content.match(/ctaText:\s*["']?(.+?)["']?\s*$/m);
  const currentTitle = titleMatch?.[1] || 'Unknown';
  const currentCta = ctaMatch?.[1] || 'Learn more';

  const prompt = `Given this headline: "${currentTitle}"
And this CTA button text: "${currentCta}"

Generate ${count} alternative variations for A/B testing.
Return ONLY valid JSON array (no markdown fences):
[
  { "title": "...", "ctaText": "..." },
  ...
]

Make each variation distinct in tone/angle:
- Variation 1: curiosity/question-based
- Variation 2: benefit-focused
- Variation 3: urgency/social proof
Keep the language the same as the original.`;

  console.log(`Generating ${count} A/B variations for: ${currentTitle}`);

  const result = await callGemini(prompt);
  const cleaned = result.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '');
  const variations = JSON.parse(cleaned);

  for (let i = 0; i < variations.length; i++) {
    const v = variations[i];
    let newContent = content;

    if (titleMatch) {
      newContent = newContent.replace(
        /title:\s*["']?.+?["']?\s*$/m,
        `title: "${v.title}"`
      );
    }
    if (ctaMatch && v.ctaText) {
      newContent = newContent.replace(
        /ctaText:\s*["']?.+?["']?\s*$/m,
        `ctaText: "${v.ctaText}"`
      );
    }

    // Update slug
    const slugSuffix = `-v${i + 1}`;
    newContent = newContent.replace(
      /slug:\s*["']?(.+?)["']?\s*$/m,
      (match, slug) => `slug: "${slug.replace(/["']/g, '')}${slugSuffix}"`
    );

    const outPath = join(dir, `${name}-v${i + 1}${ext}`);
    writeFileSync(outPath, newContent, 'utf-8');
    console.log(`  Variation ${i + 1}: "${v.title}" → ${outPath}`);
  }

  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
