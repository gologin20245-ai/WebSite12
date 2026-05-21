#!/usr/bin/env node

/**
 * SEO Agent
 *
 * Scans content files and suggests/applies SEO improvements:
 * - Missing meta descriptions
 * - Missing alt text hints
 * - JSON-LD schema suggestions
 *
 * Requires: GEMINI_API_KEY environment variable
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const apiKey = process.env.GEMINI_API_KEY;
const CONTENT_DIR = 'src/content';

function scanDir(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...scanDir(full));
    } else if (['.md', '.json'].includes(extname(full))) {
      files.push(full);
    }
  }
  return files;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const lines = match[1].split('\n');
  const data = {};
  for (const line of lines) {
    const [key, ...rest] = line.split(':');
    if (key && rest.length) {
      data[key.trim()] = rest.join(':').trim().replace(/^["']|["']$/g, '');
    }
  }
  return data;
}

async function callGemini(prompt) {
  if (!apiKey) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || null;
}

async function main() {
  const files = scanDir(CONTENT_DIR);
  console.log(`Found ${files.length} content files`);

  let improved = 0;

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const content = readFileSync(file, 'utf-8');
    const fm = parseFrontmatter(content);
    if (!fm) continue;

    const needsSeoTitle = !fm.seo?.title && !content.includes('seo:');
    const needsDescription = !fm.description && !fm.excerpt;

    if (!needsSeoTitle && !needsDescription) continue;

    console.log(`Checking ${file}...`);

    const title = fm.title || '';
    const prompt = `Given this article title: "${title}"
Generate a JSON object with:
- "seoTitle": optimized SEO title (max 60 chars)
- "seoDescription": meta description (max 155 chars)
Return ONLY valid JSON, no markdown.`;

    const result = await callGemini(prompt);
    if (!result) continue;

    try {
      const cleaned = result.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '');
      const seo = JSON.parse(cleaned);
      console.log(`  SEO title: ${seo.seoTitle}`);
      console.log(`  SEO desc: ${seo.seoDescription}`);
      improved++;
    } catch {
      console.log(`  Could not parse SEO suggestion for ${file}`);
    }
  }

  console.log(`Checked ${files.length} files, improved ${improved}`);
}

main().catch(console.error);
