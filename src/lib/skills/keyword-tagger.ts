/**
 * Text → catalogue skill ids, deterministic and offline.
 *
 * This is the fallback the trained tagger (`src/lib/ml/tagger.ts`) documents:
 * when the 34 MB ONNX encoder is not installed, scanning the text for the
 * curated alias table keeps the demand pipeline runnable with zero model
 * downloads. When the encoder IS installed, `tagPostings` transparently uses
 * the trained logistic heads instead — callers never change.
 *
 * The alias table lives in `data/skill_aliases.json` so sector experts can
 * extend coverage (e.g. Marathi trade terms) without touching code.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

import type { TaggedSkill } from "../ml/tagger";
import { tagTexts } from "../ml/tagger";
import { encoderAvailable } from "../ml/encoder";

/** Fixed calibrated-feeling probability for a keyword hit (keyword evidence is binary). */
export const KEYWORD_PROBABILITY = 0.85;

type AliasTable = Record<string, string[]>;

export interface KeywordMatch {
  skillId: string;
  matchedAlias: string;
}

let aliasCache: { table: AliasTable; compiled: Map<string, string[]> } | null = null;

function aliasesPath(): string {
  return path.join(process.cwd(), "data", "skill_aliases.json");
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Padded-substring match on the normalized text — exact token boundaries, no regex surprises. */
function containsToken(normalizedText: string, alias: string): boolean {
  return normalizedText.includes(` ${alias} `);
}

async function loadAliases(): Promise<{ table: AliasTable; compiled: Map<string, string[]> }> {
  if (aliasCache) return aliasCache;
  const raw = JSON.parse(await fs.readFile(aliasesPath(), "utf8")) as AliasTable;
  const compiled = new Map<string, string[]>();
  for (const [skillId, aliases] of Object.entries(raw)) {
    compiled.set(
      skillId,
      aliases.map((a) => normalize(a)).filter(Boolean),
    );
  }
  aliasCache = { table: raw, compiled };
  return aliasCache;
}

/**
 * Scan one text against every skill's aliases. Returns the hits sorted by
 * number of distinct aliases matched (a text mentioning "sql" twice and
 * "excel" once ranks sql first), then alphabetically for stability.
 */
export async function keywordTag(text: string, maxSkills = 15): Promise<TaggedSkill[]> {
  const { compiled } = await loadAliases();
  const norm = ` ${normalize(text)} `;
  if (norm.trim().length < 2) return [];

  const hits: { skillId: string; score: number }[] = [];
  for (const [skillId, aliases] of compiled) {
    let score = 0;
    let matched = false;
    for (const alias of aliases) {
      if (containsToken(norm, alias)) {
        matched = true;
        score += 1;
      }
    }
    if (matched) hits.push({ skillId, score });
  }
  hits.sort((a, b) => b.score - a.score || a.skillId.localeCompare(b.skillId));
  return hits.slice(0, maxSkills).map((h) => ({
    skillId: h.skillId,
    probability: KEYWORD_PROBABILITY,
    strength: 3,
  }));
}

/** Which alias fired for each skill — used by the audit trail in demand reports. */
export async function keywordMatches(text: string): Promise<KeywordMatch[]> {
  const { compiled } = await loadAliases();
  const norm = ` ${normalize(text)} `;
  const out: KeywordMatch[] = [];
  for (const [skillId, aliases] of compiled) {
    for (const alias of aliases) {
      if (containsToken(norm, alias)) {
        out.push({ skillId, matchedAlias: alias });
        break; // one alias per skill is enough for the audit trail
      }
    }
  }
  return out;
}

/**
 * Tag a batch of texts with the best available tagger: the trained logistic
 * heads when the encoder is installed, the deterministic keyword scan
 * otherwise. Never returns null — the keyword path always answers.
 */
export async function tagPostings(texts: string[], maxSkills = 15): Promise<TaggedSkill[][]> {
  const clean = texts.map((t) => t.trim()).filter(Boolean);
  if (!clean.length) return [];
  if (await encoderAvailable()) {
    try {
      const trained = await tagTexts(clean, maxSkills);
      if (trained) return trained;
    } catch {
      // fall through to the keyword path
    }
  }
  const out: TaggedSkill[][] = [];
  for (const t of clean) out.push(await keywordTag(t, maxSkills));
  return out;
}

/** Test seam. */
export function resetAliasCache(): void {
  aliasCache = null;
}
