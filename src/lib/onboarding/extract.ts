import { db } from "@/lib/db";
import { loadSkillGraph } from "@/lib/engine/data";
import { executeWithGroqPool } from "@/lib/ai/groq-pool";
import type { ExtractedProfile } from "./agent";

const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20,
};

function extractHeuristics(history: Array<{ role: string; content: string }>, graph: any): ExtractedProfile {
  const profile: ExtractedProfile = {};
  const userTexts = history.filter((h) => h.role === "user").map((h) => h.content);
  const combined = userTexts.join(" ");

  // 1. Hours per week
  const hoursMatch = combined.match(/(?:^|\D)(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|twelve|fifteen|twenty)\s*(?:hours|hrs|h)(?:\s*(?:a|\/|per)\s*week)?/i);
  if (hoursMatch) {
    const raw = hoursMatch[1].toLowerCase();
    const val = parseInt(raw, 10) || WORD_NUMBERS[raw];
    if (val && val >= 1 && val <= 80) profile.hoursPerWeek = val;
  }

  // 2. Timeline in weeks (months or weeks)
  const monthsMatch = combined.match(/(?:^|\D)(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|twelve)\s*months?/i);
  if (monthsMatch) {
    const raw = monthsMatch[1].toLowerCase();
    const months = parseInt(raw, 10) || WORD_NUMBERS[raw];
    if (months && months > 0) profile.timelineWeeks = Math.round(months * 4.33);
  } else {
    const weeksMatch = combined.match(/(?:^|\D)(\d{1,2})\s*weeks?/i);
    if (weeksMatch) {
      const val = parseInt(weeksMatch[1], 10);
      if (val && val > 0) profile.timelineWeeks = val;
    }
  }

  // 3. Domain detection — Official Statistical System roles first, then generic knowledge domains.
  const lower = combined.toLowerCase();
  if (lower.includes("survey") || lower.includes("sampling") || lower.includes("field investigator") || lower.includes("statistical")) {
    profile.domain = "Survey & Sampling Methods";
    profile.targetRole = "Statistical Investigator / Survey Officer";
    profile.goalSkillId = "ss_survey_design";
  } else if (lower.includes("census") || lower.includes("cspro") || lower.includes("data processing")) {
    profile.domain = "Data Collection & Processing";
    profile.targetRole = "Data Processing / Census Operations Officer";
    profile.goalSkillId = "dc_cspro";
  } else if (lower.includes("price") || lower.includes("index") || lower.includes("cpi") || lower.includes("national accounts") || lower.includes("macro")) {
    profile.domain = "Official Data Sources";
    profile.targetRole = "Economic Statistician";
    profile.goalSkillId = "os_price_stats";
  } else if (lower.includes("data quality") || lower.includes("dissemination") || lower.includes("sdmx") || lower.includes("metadata")) {
    profile.domain = "Data Quality & Standards";
    profile.targetRole = "Data Quality / Dissemination Officer";
    profile.goalSkillId = "dq_frameworks";
  } else if (lower.includes("data science") || lower.includes("data scientist") || lower.includes("data analyst")) {
    profile.domain = "Statistical Methods";
    profile.targetRole = "Statistical Analyst";
    profile.goalSkillId = "sm_regression";
  } else if (lower.includes("it") || lower.includes("computer") || lower.includes("software") || lower.includes("programming")) {
    profile.domain = "Digital Competency";
    profile.targetRole = "IT / Systems Officer";
    profile.goalSkillId = "it_python_basics";
  }

  // 4. Specific goal skill ID match from skill graph (only if not already resolved)
  if (!profile.goalSkillId && graph?.skills) {
    for (const [id, s] of Object.entries<any>(graph.skills)) {
      const name = s.name.toLowerCase();
      if (name.length >= 4 && lower.includes(name)) {
        profile.goalSkillId = id;
        if (s.domain) profile.domain = s.domain;
        break;
      }
    }
  }

  // 5. Goal statement fallback
  if (userTexts.length > 0) {
    profile.goalStatement = userTexts.find((t) => t.length > 15 && !t.startsWith("/")) || userTexts[0];
  }

  return profile;
}

export async function extractProfile(learnerId: string): Promise<ExtractedProfile> {
  const state = await db.agentState.findUnique({ where: { learnerId } });
  if (!state) return {};
  const history = JSON.parse(state.historyJson || "[]");

  const graph = await loadSkillGraph();
  const heuristics = extractHeuristics(history, graph);

  const domains = graph.domains.join(", ");
  // Compact curriculum anchors (top goal skills instead of all graph skills to keep tokens under 300)
  const curriculumAnchors = [
    "Survey & Sampling Methods: ID 'ss_survey_design' (Survey Design), ID 'ss_sampling_basics' (Sampling Fundamentals), ID 'ss_weighting' (Survey Weighting & Expansion Factors)",
    "Data Collection & Processing: ID 'dc_cspro' (CSPro), ID 'dc_cleaning' (Data Cleaning & Validation), ID 'dc_metadata' (Statistical Metadata Management)",
    "Statistical Methods: ID 'sm_descriptive' (Descriptive Statistics), ID 'sm_estimation' (Estimation Theory), ID 'sm_regression' (Regression Analysis)",
    "Data Quality & Standards: ID 'dq_frameworks' (Statistical Quality Frameworks), ID 'dq_sdmx' (SDMX Data & Metadata Standards)",
    "Official Data Sources: ID 'os_nss' (NSS Rounds & Household Surveys), ID 'os_price_stats' (Price Statistics (CPI, WPI, IIP)), ID 'os_gva' (National Accounts (SNA, GVA))",
    "Digital Competency: ID 'it_python_basics' (Python for Official Statistics), ID 'it_data_viz' (Data Visualisation)",
  ].join("\n");

  const systemPrompt = `You are an expert data extraction bot.
Review the conversation history and extract the following information about the user.
Available domains: ${domains}
Sample goal skill IDs:
${curriculumAnchors}

Output a JSON object ONLY with the following structure (omit keys if not known):
{
  "name": "string",
  "goalStatement": "string",
  "targetRole": "string",
  "domain": "string (MUST match one of the available domains)",
  "goalSkillId": "string (the exact ID of the primary skill they want to master, e.g. 'ss_survey_design')",
  "hoursPerWeek": number,
  "timelineWeeks": number,
  "learningStyle": "string",
  "motivation": "string",
  "constraints": ["string"]
}`;

  const useGateway = Boolean(process.env.AI_GATEWAY_API_KEY);
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  const baseUrl = process.env.GROQ_BASE_URL || (useGateway ? "https://ai-gateway.vercel.sh/v1" : "https://api.groq.com/openai/v1");

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.slice(-10).map((h: any) => ({ role: h.role, content: h.content })),
    { role: "user", content: "Extract the profile as JSON now. Respond with ONLY valid JSON." }
  ];

  let llmExtracted: ExtractedProfile = {};

  try {
    llmExtracted = await executeWithGroqPool(async (apiKey) => {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: useGateway ? `groq/${model}` : model,
          messages,
          temperature: 0.1,
          response_format: { type: "json_object" }
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq extraction HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        return JSON.parse(content) as ExtractedProfile;
      }
      return {};
    });
  } catch (e) {
    console.warn("[ProfileExtraction] LLM extraction encountered error, falling back to heuristics:", e);
  }

  // Merge heuristics and LLM output so profile is never blank
  const merged: ExtractedProfile = {
    ...heuristics,
    ...llmExtracted,
  };

  // Guarantee required fallbacks if still null
  if (!merged.domain && heuristics.domain) merged.domain = heuristics.domain;
  if (!merged.goalSkillId && heuristics.goalSkillId) merged.goalSkillId = heuristics.goalSkillId;
  if (merged.goalSkillId) {
    if (merged.goalSkillId.includes("|")) {
      merged.goalSkillId = merged.goalSkillId.split("|")[0].trim();
    }
    merged.goalSkillId = merged.goalSkillId.replace(/\s*\([^)]*\)/, "").trim();
  }
  if (!merged.targetRole && heuristics.targetRole) merged.targetRole = heuristics.targetRole;
  if (!merged.hoursPerWeek && heuristics.hoursPerWeek) merged.hoursPerWeek = heuristics.hoursPerWeek;
  if (!merged.timelineWeeks && heuristics.timelineWeeks) merged.timelineWeeks = heuristics.timelineWeeks;
  if (!merged.goalStatement && heuristics.goalStatement) merged.goalStatement = heuristics.goalStatement;

  return merged;
}
