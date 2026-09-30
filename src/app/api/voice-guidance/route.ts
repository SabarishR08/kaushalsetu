import { apiError, handleApiError, json, readJson } from "@/lib/api-helpers";
import { chatJson, LlmMessage } from "@/lib/ai/llm";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

export interface VoiceGuidanceRequest {
  query: string;
  language?: "mr" | "en";
}

export interface VoiceGuidanceResponse {
  userQueryMarathi: string;
  userQueryEnglish: string;
  recommendedTrade: string;
  recommendedTradeMarathi: string;
  durationMonths: number;
  nearestIti: string;
  nearestItiLocation: string;
  placementRate: number;
  expectedSalary: string;
  aiExplanationMarathi: string;
  aiExplanationEnglish: string;
  actionSteps: string[];
  provider?: string;
}

const FALLBACK_GUIDANCE: VoiceGuidanceResponse[] = [
  {
    userQueryMarathi: "दादा, माझं १०वी झालंय आणि मला मेकॅनिकल मध्ये रस आहे. मला चाकण MIDC मध्ये लवकर नोकरी हवी आहे, मी कोणता कोर्स करू?",
    userQueryEnglish: "Dada, I passed 10th and like mechanical work. I want a job quickly in Chakan MIDC, which course should I do?",
    recommendedTrade: "CNC Machinist & Precision Turning (CTS)",
    recommendedTradeMarathi: "सीएनसी मशिनिस्ट आणि टर्निंग ट्रेड",
    durationMonths: 12,
    nearestIti: "Government ITI Pimpri-Chinchwad / Chakan",
    nearestItiLocation: "Chakan Industrial Zone, Pune",
    placementRate: 94,
    expectedSalary: "₹18,500 – ₹24,000 / month",
    aiExplanationMarathi: "तुमच्यासाठी चाकण MIDC मधील टाटा मोटर्स आणि भारत फोर्जच्या सप्लायर्ससाठी 'सीएनसी मशिनिस्ट' हा उत्तम पर्याय आहे. १०वीनंतर हा १ वर्षाचा कोर्स सरकारी ITI मध्ये मोफत उपलब्ध आहे आणि सध्या चाकणमध्ये ५२ पेक्षा जास्त कारखान्यांमध्ये सीएनसी ऑपरेटर्सची मोठी मागणी आहे.",
    aiExplanationEnglish: "For your background, 'CNC Machinist' is the highest ROI option for Tata Motors and Bharat Forge auto suppliers in Chakan MIDC. This 1-year course is free at Government ITIs and has 50+ active hiring vacancies.",
    actionSteps: [
      "DVET महास्वयं पोर्टलवर (mahaswayam.gov.in) मोफत ऑनलाइन अर्ज भरा.",
      "शासकीय ITI पिंपरी-चिंचवड किंवा चाकण येथे 'मशिनिस्ट' ट्रेड निवडा.",
      "कौशल्य सेतूचे ३० तासांचे 'फॅनुक ५-अ‍ॅक्सिस सीएनसी' अ‍ॅड-ऑन मॉड्यूल पूर्ण करा.",
      "कौशल पासपोर्ट QR कोड मिळवून चाकण MIDC रोजगार मेळाव्यात थेट मुलाखत द्या."
    ]
  },
  {
    userQueryMarathi: "माझं १२वी सायन्स झालंय. मला छत्रपती संभाजीनगर मधील फार्मा किंवा ऑटो कंपनीत टेक्निकल जॉब पाहिजे.",
    userQueryEnglish: "I completed 12th Science. I want a technical job in a pharma or auto company in Chh. Sambhajinagar.",
    recommendedTrade: "Chemical Plant Operator / Tool & Die",
    recommendedTradeMarathi: "केमिकल प्लांट ऑपरेटर / टूल अँड डाय",
    durationMonths: 24,
    nearestIti: "Government ITI Aurangabad (Chh. Sambhajinagar)",
    nearestItiLocation: "Railway Station Road, Chh. Sambhajinagar",
    placementRate: 91,
    expectedSalary: "₹21,000 – ₹28,000 / month",
    aiExplanationMarathi: "शेंद्रा आणि बिडकीन AURIC इंडस्ट्रियल सिटीमध्ये लुपिन, अजंता आणि एंड्युरन्स कंपन्यांमध्ये १२वी सायन्स नंतर 'केमिकल प्लांट ऑपरेटर' आणि 'क्वालिटी इन्स्पेक्शन' पदांसाठी थेट भरती सुरू आहे. सरकारी ITI मध्ये २ वर्षांचा कोर्स करून चांगल्या पगाराची नोकरी मिळेल.",
    aiExplanationEnglish: "With 12th Science, you qualify for Chemical Plant Operator and Quality Metrology roles across Shendra & Bidkin AURIC clusters with Lupin and Endurance.",
    actionSteps: [
      "शासकीय ITI संभाजीनगर येथे 'केमिकल ऑपरेटर' ट्रेडमध्ये प्रवेश घ्या.",
      "cGMP आणि क्लीनरूम सुरक्षा मानकांचे ३० तासांचे ब्रिज मॉड्यूल पूर्ण करा.",
      "शेंद्रा AURIC फार्मा क्लस्टरमध्ये १ वर्षाची राष्ट्रीय अ‍ॅपेंटिसशिप (NAPS) मिळवा."
    ]
  },
  {
    userQueryMarathi: "मी विदर्भात (नागपूर) राहतो. मला लॉजिस्टिक किंवा एअरपोर्ट (मिहान) मध्ये काम करायचं आहे.",
    userQueryEnglish: "I live in Vidarbha (Nagpur). I want to work in logistics or at the airport / MIHAN.",
    recommendedTrade: "Warehouse Logistics Associate & Heavy Fleet Maintenance",
    recommendedTradeMarathi: "वेअरहाऊस लॉजिस्टिक आणि फ्लीट मेंटेनन्स",
    durationMonths: 12,
    nearestIti: "Government ITI Nagpur (Deekshabhoomi)",
    nearestItiLocation: "South Ambazari Road, Nagpur",
    placementRate: 88,
    expectedSalary: "₹16,500 – ₹22,000 / month",
    aiExplanationMarathi: "नागपूरच्या मिहान (MIHAN) कार्गो हब आणि अदानी लॉजिस्टिक पार्कमध्ये वेअरहाऊस मॅनेजमेंट आणि इन्व्हेंटरी डेटा ऑपरेटरची प्रचंड मागणी आहे. हा १ वर्षाचा कोर्स करून तुम्हाला नागपुरातच चांगली नोकरी मिळेल.",
    aiExplanationEnglish: "Nagpur's MIHAN Cargo Hub and Adani Logistics have high demand for modern automated warehouse tracking and fleet maintenance technicians.",
    actionSteps: [
      "शासकीय ITI नागपूर येथे लॉजिस्टिक ट्रेडमध्ये प्रवेश नोंदणी करा.",
      "इन्व्हेंटरी बारकोड आणि डिजिटल वेअरहाऊस सॉफ्टवेअर शिका.",
      "मिहान एसईझेड मधील लॉजिस्टिक कंपन्यांमध्ये थेट ऑन-जॉब ट्रेनिंग (OJT) सुरू करा."
    ]
  }
];

function findClosestFallback(query: string): VoiceGuidanceResponse {
  const lower = query.toLowerCase();
  if (lower.includes("नागपूर") || lower.includes("nagpur") || lower.includes("logistics") || lower.includes("लॉजिस्टिक") || lower.includes("mihan")) {
    return FALLBACK_GUIDANCE[2];
  }
  if (lower.includes("संभाजीनगर") || lower.includes("aurangabad") || lower.includes("pharma") || lower.includes("फार्मा") || lower.includes("chemical") || lower.includes("12th")) {
    return FALLBACK_GUIDANCE[1];
  }
  return FALLBACK_GUIDANCE[0];
}

const SYSTEM_PROMPT = `You are "आवाज रोजगार सहाय्यक" (Voice Employment Sahayak), an expert AI career counsellor for the Directorate of Vocational Education and Training (DVET), Government of Maharashtra.
Your role is to guide rural and semi-urban students (10th pass, 12th pass, ITI, diploma) in colloquial, encouraging Marathi (with English translations) into formal vocational training (CTS/NCVT courses in 417 Government ITIs) mapped directly to Maharashtra industrial clusters (MIDC Chakan, Talegaon, Bhosari, Ranjangaon, AURIC Shendra/Bidkin, MIHAN Nagpur, Butibori, Waluj, TTC Thane-Belapur).

Context:
- Maharashtra has 13,511 active verified industrial vacancies analyzed across 36 districts.
- 417 Government ITIs offer 100% tuition-free education under DVET MahaSwayam.
- 6 bridge courses with NCVT 20% flex-band: CNC Machining, EV Powertrain Diagnostics, Semiconductor Packaging, Industrial IoT & PLC, Solar PV Grid-Tie, Warehouse Automation.

You must respond ONLY with a valid JSON object matching this schema:
{
  "userQueryMarathi": string (Marathi transcription or translation of candidate's inquiry),
  "userQueryEnglish": string (English translation of candidate's inquiry),
  "recommendedTrade": string (Name of CTS/ITI trade or bridge course in English),
  "recommendedTradeMarathi": string (Trade name in Marathi),
  "durationMonths": number (typically 6, 12, or 24),
  "nearestIti": string (Real DVET Maharashtra Government ITI name),
  "nearestItiLocation": string (MIDC zone / city / district),
  "placementRate": number (realistic percentage 80-96),
  "expectedSalary": string (e.g. "₹18,000 – ₹25,000 / month"),
  "aiExplanationMarathi": string (Warm, encouraging, practical Marathi advice addressing the student directly like a supportive elder brother 'दादा' or mentor),
  "aiExplanationEnglish": string (Clear English summary of the guidance),
  "actionSteps": string[] (3 to 4 actionable bullet points in Marathi mentioning MahaSwayam, Kaushal Passport, and MIDC placement)
}`;

export async function POST(request: Request) {
  const rl = checkRateLimit(request, { limit: 20, windowMs: 60_000 });
  if (!rl.success) return rateLimitResponse(rl);

  try {
    const body = await readJson<VoiceGuidanceRequest>(request);
    const query = body?.query?.trim();

    if (!query) {
      return apiError("Query string is required");
    }

    const messages: LlmMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Candidate Query: "${query}"` },
    ];

    const result = await chatJson<VoiceGuidanceResponse>(
      messages,
      (val: any): VoiceGuidanceResponse | null => {
        if (!val || typeof val !== "object") return null;
        if (!val.recommendedTrade || !val.aiExplanationMarathi) return null;
        return {
          userQueryMarathi: String(val.userQueryMarathi || query),
          userQueryEnglish: String(val.userQueryEnglish || query),
          recommendedTrade: String(val.recommendedTrade),
          recommendedTradeMarathi: String(val.recommendedTradeMarathi || val.recommendedTrade),
          durationMonths: Number(val.durationMonths) || 12,
          nearestIti: String(val.nearestIti || "Government ITI Maharashtra"),
          nearestItiLocation: String(val.nearestItiLocation || "MIDC Industrial Hub"),
          placementRate: Number(val.placementRate) || 90,
          expectedSalary: String(val.expectedSalary || "₹18,000 – ₹24,000 / month"),
          aiExplanationMarathi: String(val.aiExplanationMarathi),
          aiExplanationEnglish: String(val.aiExplanationEnglish || ""),
          actionSteps: Array.isArray(val.actionSteps) && val.actionSteps.length > 0 
            ? val.actionSteps.map(String) 
            : [
                "DVET महास्वयं पोर्टलवर (mahaswayam.gov.in) मोफत ऑनलाइन अर्ज भरा.",
                "जवळच्या शासकीय ITI मध्ये थेट प्रवेश घ्या.",
                "कौशल्य सेतू डिजिटल पासपोर्ट मिळवून स्थानिक MIDC रोजगार मेळाव्यात मुलाखत द्या."
              ],
        };
      },
      { maxTokens: 1200, temperature: 0.3, timeoutMs: 25_000 }
    );

    if (result) {
      return json({
        ...result.value,
        provider: result.provider,
      });
    }

    // Graceful fallback to deterministic nearest preset
    const fallback = findClosestFallback(query);
    return json({
      ...fallback,
      userQueryMarathi: query,
      provider: "deterministic-fallback",
    });
  } catch (e) {
    return handleApiError(e, "Voice guidance error");
  }
}
