"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  DollarSign, 
  GraduationCap, 
  Languages 
} from "lucide-react";

interface GuidanceResponse {
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
}

const PRESET_QUERIES: GuidanceResponse[] = [
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

export default function VoiceSahayakPage() {
  const [activeQueryIndex, setActiveQueryIndex] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [customQuery, setCustomQuery] = useState<string>("");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const activeResponse = PRESET_QUERIES[activeQueryIndex];

  const handleSimulateRecording = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setActiveQueryIndex((activeQueryIndex + 1) % PRESET_QUERIES.length);
    }, 1500);
  };

  const handlePlayVoice = () => {
    setIsPlayingAudio(true);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(activeResponse.aiExplanationMarathi);
      utterance.lang = "mr-IN";
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 2000);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-xs">
                AI4Bharat / Bhashini Speech Engine
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                Marathi NLP & Career Trajectory Reasoner
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Mic className="h-6 w-6 text-orange-400" /> आवाज रोजगार सहाय्यक (Marathi AI Career Mentor)
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Rural youth can speak in colloquial Marathi to get personalized vocational pathways directly mapped to MIDC job openings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="border-white/10 text-xs h-9">
              <Link href="/path">
                View Interactive Roadmap <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Voice Input Interaction Hub */}
        <Card className="bg-gradient-to-r from-orange-950/30 via-black to-black border-orange-500/30 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Giant Glowing Mic Button */}
              <button
                onClick={handleSimulateRecording}
                className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all shrink-0 ${
                  isRecording
                    ? "bg-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.6)] animate-pulse scale-105"
                    : "bg-gradient-to-br from-orange-500 to-amber-600 shadow-[0_0_25px_rgba(249,115,22,0.35)] hover:scale-105"
                }`}
              >
                {isRecording ? (
                  <MicOff className="h-9 w-9 text-white" />
                ) : (
                  <Mic className="h-9 w-9 text-white" />
                )}
                {isRecording && (
                  <span className="absolute -bottom-6 text-[10px] text-rose-400 font-bold whitespace-nowrap animate-bounce font-mono">
                    ऐकत आहे... (Listening)
                  </span>
                )}
              </button>

              {/* Spoken Query Display */}
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                    उमेदवाराचा आवाज (Candidate Audio Query):
                  </span>
                  <Badge variant="outline" className="text-[10px] border-white/10 text-muted-foreground font-mono">
                    Marathi Audio Stream
                  </Badge>
                </div>

                <div className="p-3 rounded-xl bg-black/60 border border-white/5 text-sm sm:text-base font-medium text-white italic">
                  "{activeResponse.userQueryMarathi}"
                </div>

                <div className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                  <Languages className="h-3 w-3 text-orange-400" />
                  <span>English Translation: "{activeResponse.userQueryEnglish}"</span>
                </div>
              </div>
            </div>

            {/* Quick Preset Selector Buttons */}
            <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium shrink-0">
                नमुना प्रश्न (Sample Inquiries):
              </span>
              {PRESET_QUERIES.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveQueryIndex(idx)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    activeQueryIndex === idx
                      ? "bg-orange-500/20 text-orange-300 border-orange-500/40 font-semibold"
                      : "bg-white/[0.02] border-white/5 text-muted-foreground hover:text-white"
                  }`}
                >
                  {idx === 0 ? "पुणे चाकण (Pune Chakan Auto)" : idx === 1 ? "संभाजीनगर (Aurangabad Pharma)" : "नागपूर मिहान (Nagpur Logistics)"}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Career Recommendation Result */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Column: Recommended Program & ITI Details */}
          <Card className="md:col-span-5 bg-white/[0.02] border-white/5 backdrop-blur-md">
            <CardHeader className="pb-3 border-b border-white/5">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                  {activeResponse.placementRate}% Historical Placement
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {activeResponse.durationMonths} Months Course
                </span>
              </div>
              <CardTitle className="text-lg sm:text-xl font-bold text-white mt-1">
                {activeResponse.recommendedTrade}
              </CardTitle>
              <div className="text-xs text-orange-400 font-medium">
                {activeResponse.recommendedTradeMarathi}
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4 text-xs">
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Building2 className="h-3.5 w-3.5 text-orange-400" /> जवळचे शासकीय ITI (Nearest ITI):
                  </div>
                  <div className="font-bold text-white text-sm">{activeResponse.nearestIti}</div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" /> {activeResponse.nearestItiLocation}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1">
                  <div className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> सुरुवातीचा अपेक्षित पगार (Entry Salary):
                  </div>
                  <div className="font-bold text-emerald-400 text-sm font-mono">{activeResponse.expectedSalary}</div>
                  <div className="text-muted-foreground">शासकीय ITI मध्ये प्रशिक्षण शुल्क: <strong>₹० (मोफत)</strong></div>
                </div>
              </div>

              <Button asChild size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">
                <Link href="/path">
                  Explore Interactive Learning Roadmap <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Right Column: AI Voice Synthesis & Action Plan */}
          <div className="md:col-span-7 space-y-4">
            <Card className="bg-gradient-to-b from-white/[0.03] to-white/[0.01] border-white/10 backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-orange-400" /> AI मार्गदर्शन (Marathi AI Response)
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePlayVoice}
                    className="border-orange-500/30 text-orange-300 text-xs h-8 bg-orange-500/10 hover:bg-orange-500/20"
                  >
                    <Volume2 className={`mr-1.5 h-3.5 w-3.5 ${isPlayingAudio ? "animate-bounce text-orange-400" : ""}`} />
                    {isPlayingAudio ? "आवाज चालू आहे..." : "आवाज ऐका (Play Audio)"}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/20 text-xs sm:text-sm text-orange-100 leading-relaxed font-medium">
                  {activeResponse.aiExplanationMarathi}
                </div>

                <div className="text-xs text-muted-foreground italic border-l-2 border-orange-500/30 pl-3">
                  "{activeResponse.aiExplanationEnglish}"
                </div>

                {/* Step-by-Step Action Roadmap */}
                <div className="pt-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    प्रवेश आणि रोजगाराची पुढील पावले (Step-by-Step Action Steps):
                  </h3>
                  <div className="space-y-2">
                    {activeResponse.actionSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs text-white">
                        <span className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center text-[10px] font-bold shrink-0 font-mono mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
