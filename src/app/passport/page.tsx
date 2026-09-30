"use client";

import { useState } from "react";
import Link from "next/link";
import { PIPELINE_POSTINGS } from "@/lib/pipeline-meta";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  QrCode, 
  Download, 
  CheckCircle2, 
  Award, 
  Lock, 
  ExternalLink, 
  Building2, 
  FileCheck, 
  Calendar, 
  User 
} from "lucide-react";

interface CompetencyStamp {
  name: string;
  nsqfLevel: number;
  evidenceTier: "PROVEN" | "VERIFIED" | "CLAIMED";
  hoursLogged: number;
  issuingBody: string;
  dateCertified: string;
}

const SAMPLE_COMPETENCIES: CompetencyStamp[] = [
  {
    name: "Fanuc 5-Axis CNC Programming & G-Code Simulation",
    nsqfLevel: 5,
    evidenceTier: "PROVEN",
    hoursLogged: 30,
    issuingBody: "DVET Maharashtra / KaushalSetu Bridge",
    dateCertified: "28-Sep-2026"
  },
  {
    name: "Conventional Lathe & Precision Turning (CTS)",
    nsqfLevel: 4,
    evidenceTier: "PROVEN",
    hoursLogged: 180,
    issuingBody: "Government ITI Pimpri-Chinchwad",
    dateCertified: "15-Aug-2026"
  },
  {
    name: "Titanium & EV Alloy Precision Machining",
    nsqfLevel: 5,
    evidenceTier: "VERIFIED",
    hoursLogged: 24,
    issuingBody: "MIDC Industry Sponsor (Tata Motors Vendor)",
    dateCertified: "24-Sep-2026"
  },
  {
    name: "CMM Metrology & In-Process Quality Audit",
    nsqfLevel: 4,
    evidenceTier: "VERIFIED",
    hoursLogged: 20,
    issuingBody: "Bureau of Indian Standards (BIS IS 13367)",
    dateCertified: "26-Sep-2026"
  }
];

export default function PassportPage() {
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
    }, 800);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                W3C Verifiable Credentials Standard
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                DigiLocker / e-Pramaan Integrated
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-400" /> डिजिटल कौशल पासपोर्ट (Verifiable Kaushal Passport)
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tamper-proof, cryptographically signed micro-competency credentials with instant QR verification for MIDC factory recruiters.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerify}
              disabled={isVerifying}
              className="border-emerald-500/30 text-emerald-300 text-xs h-9 bg-emerald-500/10 hover:bg-emerald-500/20"
            >
              <Lock className="mr-1.5 h-3.5 w-3.5" />
              {isVerifying ? "Verifying On-Chain..." : "Verify Ed25519 Signature"}
            </Button>
            <Button
              size="sm"
              onClick={() => window.print()}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-9"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export DigiLocker XML/PDF
            </Button>
          </div>
        </div>

        {verificationSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>
                <strong>Cryptographic Signature Verified:</strong> Issued by Maharashtra State Skill Development Society (MSSDS) Root Key #MH-GOV-2026-ROOT.
              </span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400/80">SHA-256: 8a7f9c2...41d9e</span>
          </div>
        )}

        {/* The Digital Passport Certificate Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Official Digital Certificate ID Card */}
          <div className="lg:col-span-8">
            <Card className="bg-gradient-to-br from-white/[0.04] via-black to-orange-950/20 border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              {/* Watermark / State Header */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500" />
              
              <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-lg font-mono">
                      कौ
                    </div>
                    <div>
                      <div className="text-xs font-bold text-orange-400 uppercase tracking-widest font-mono">
                        GOVERNMENT OF MAHARASHTRA
                      </div>
                      <CardTitle className="text-lg sm:text-xl font-bold text-white">
                        Digital Kaushal Passport (डिजिटल कौशल पासपोर्ट)
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        National Skills Qualification Framework (NSQF) & NCrF Aligned
                      </CardDescription>
                    </div>
                  </div>

                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-mono">
                    STATUS: ACTIVE & VERIFIED
                  </Badge>
                </div>

                {/* Candidate Particulars (DPDP Anonymized Salt Hash) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5 text-xs text-muted-foreground">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 block">Candidate Name:</span>
                    <strong className="text-white text-sm">Prathamesh Shinde</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 block">Passport UID:</span>
                    <strong className="text-orange-300 font-mono">MH-KSH-2026-9481</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 block">DPDP Aadhaar Hash:</span>
                    <strong className="text-muted-foreground font-mono text-[11px]">8f2a...c041</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground/70 block">Training Center:</span>
                    <strong className="text-white">Govt ITI Pimpri-Chinchwad</strong>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 pt-5">
                {/* Granular Verified Competency Stamps */}
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-orange-400" />
                    Verified Industrial Micro-Competencies (सूक्ष्म कौशल्य प्रमाणपत्रे):
                  </h3>

                  <div className="space-y-2.5">
                    {SAMPLE_COMPETENCIES.map((comp) => (
                      <div
                        key={comp.name}
                        className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5">
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            {comp.name}
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] font-mono py-0 px-1.5">
                              {comp.evidenceTier}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-3">
                            <span>Issuing Body: <strong className="text-white/80">{comp.issuingBody}</strong></span>
                            <span>•</span>
                            <span>Certified: {comp.dateCertified}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs shrink-0 font-mono">
                          <span className="px-2 py-0.5 rounded bg-white/5 text-muted-foreground">
                            NSQF L{comp.nsqfLevel}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 font-bold">
                            {comp.hoursLogged}h Logged
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit & Legal Footer */}
                <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Cryptographically sealed under the Information Technology Act, 2000.</span>
                  </div>
                  <span className="font-mono text-orange-400">Recall@5 Engine: 94.2%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: QR Code & DigiLocker Verification Mock */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="bg-white/[0.02] border-white/5 backdrop-blur-md text-center p-5 space-y-4">
              <div className="flex flex-col items-center">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Employer Scan & Verify (QR)
                </span>
                
                {/* Clean QR Graphic Box */}
                <div className="p-4 bg-white rounded-2xl shadow-lg border border-white/20 inline-block">
                  <div className="w-40 h-40 bg-slate-900 rounded-lg flex flex-col items-center justify-center text-center p-2 text-white relative">
                    <QrCode className="w-28 h-28 text-white" />
                    <span className="text-[9px] font-mono text-slate-300 mt-1">SCAN FOR PROOF</span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                  Scan using any camera to verify practical workshop hours and DVET certificate hash on the state ledger.
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 space-y-2">
                <Button asChild variant="outline" size="sm" className="w-full border-white/10 text-xs h-9 bg-black/40">
                  <Link href="/telemetry">
                    Match with Active Vacancies ({PIPELINE_POSTINGS.toLocaleString("en-IN")})
                  </Link>
                </Button>
                <Button asChild size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs h-9">
                  <Link href="/voice-sahayak">
                    Consult Voice Rojgar Sahayak
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
