#!/usr/bin/env node

/**
 * AI Content Generator Agent
 *
 * Uses Google Gemini API to generate pre-lander content.
 * Supports: article, quiz, comparison, review, faq, story
 *
 * Usage:
 *   node scripts/generate-content.mjs --type article --topic "витамины для мужчин" --lang ru --offer "https://example.com/offer"
 *
 * Requires: GEMINI_API_KEY environment variable
 */

import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
}

const type = getArg('type') || 'article';
const topic = getArg('topic') || 'health supplement';
const lang = getArg('lang') || 'ru';
const offerUrl = getArg('offer') || 'https://example.com/offer';
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('Error: GEMINI_API_KEY not set');
  process.exit(1);
}

const slug = topic
  .toLowerCase()
  .replace(/[^a-zа-яё0-9\s-]/gi, '')
  .replace(/\s+/g, '-')
  .substring(0, 60);

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

async function callGemini(prompt) {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

const prompts = {
  article: `Write a detailed expert article in ${lang} language about "${topic}".
Format: markdown with YAML frontmatter.
Frontmatter fields: title, slug ("${slug}"), date (today ISO), author (expert name), category, tags (array), excerpt (1-2 sentences), offerUrl ("${offerUrl}"), ctaText, lang ("${lang}"), noindex (true).
Include: introduction, 3-5 sections with h2/h3, practical advice, conclusion with recommendation.
The article should be informative and persuasive but NOT make medical claims.
Return ONLY the markdown file content, nothing else.`,

  quiz: `Create a quiz funnel in ${lang} language about "${topic}".
Return ONLY valid JSON (no markdown fences) with this structure:
{
  "title": "...",
  "slug": "${slug}",
  "description": "...",
  "lang": "${lang}",
  "offerUrl": "${offerUrl}",
  "trackerId": "",
  "noindex": true,
  "steps": [
    { "question": "...", "type": "single", "answers": [{"text": "...", "icon": "emoji"}] }
  ],
  "result": { "title": "...", "text": "...", "ctaText": "..." }
}
Include 5-7 questions. Make it feel personal and engaging.`,

  comparison: `Create a product comparison in ${lang} language about "${topic}".
Return ONLY valid JSON (no markdown fences) with this structure:
{
  "title": "...",
  "slug": "${slug}",
  "description": "...",
  "lang": "${lang}",
  "offerUrl": "${offerUrl}",
  "trackerId": "",
  "noindex": true,
  "products": [
    { "name": "...", "rating": 4.8, "price": "...", "pros": ["..."], "cons": ["..."], "isRecommended": true/false, "features": {"key": "value"} }
  ],
  "criteria": ["key1", "key2"]
}
Compare 3-4 products. Make one clearly recommended.`,

  review: `Write a detailed product review in ${lang} language about "${topic}".
Format: markdown with YAML frontmatter.
Frontmatter fields: title, slug ("${slug}"), productName, rating (0-5), price, pros (array), cons (array), verdict (1-2 sentences), offerUrl ("${offerUrl}"), ctaText, lang ("${lang}"), noindex (true), author, date (today ISO).
Include: what it is, how it works, composition, personal experience, conclusion.
Be honest and balanced but positive overall. Do NOT make medical claims.
Return ONLY the markdown file content, nothing else.`,

  faq: `Create a FAQ page in ${lang} language about "${topic}".
Return ONLY valid JSON (no markdown fences) with this structure:
{
  "title": "...",
  "slug": "${slug}",
  "description": "...",
  "lang": "${lang}",
  "offerUrl": "${offerUrl}",
  "trackerId": "",
  "ctaText": "...",
  "noindex": true,
  "items": [ { "question": "...", "answer": "..." } ]
}
Include 6-10 questions covering common objections and concerns.`,

  story: `Write a personal success story in ${lang} language about "${topic}".
Format: markdown with YAML frontmatter.
Frontmatter fields: title, slug ("${slug}"), heroName (realistic name), heroAge, heroLocation, disclaimer ("Это собирательный образ. Результаты индивидуальны."), offerUrl ("${offerUrl}"), ctaText, lang ("${lang}"), noindex (true), date (today ISO).
Write in first person. Include: how the problem started, what they tried, how they found the solution, what changed after 1 month.
Keep it realistic and relatable. Include the disclaimer. Do NOT make medical claims.
Return ONLY the markdown file content, nothing else.`,
};

async function main() {
  console.log(`Generating ${type} content about "${topic}" in ${lang}...`);

  const prompt = prompts[type];
  if (!prompt) {
    console.error(`Unknown content type: ${type}`);
    process.exit(1);
  }

  let content = await callGemini(prompt);

  // Clean up markdown fences if present
  content = content.replace(/^```(?:json|markdown|md|yaml)?\n?/m, '').replace(/\n?```$/m, '');

  const ext = ['quiz', 'comparison', 'faq', 'calculator'].includes(type) ? 'json' : 'md';
  const folder = {
    article: 'articles',
    quiz: 'quiz',
    comparison: 'comparisons',
    review: 'reviews',
    faq: 'faqs',
    story: 'stories',
  }[type];

  const filePath = join('src', 'content', folder, `${slug}.${ext}`);
  writeFileSync(filePath, content, 'utf-8');
  console.log(`Content saved to ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
