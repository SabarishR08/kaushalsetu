import urllib.request
import csv
import io
import json
import os
import re

def clean_text(text):
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def map_city(loc):
    loc_lower = loc.lower()
    if "pune" in loc_lower or "hinjawadi" in loc_lower or "chakan" in loc_lower or "talegaon" in loc_lower or "pimpri" in loc_lower:
        return "Pune"
    if "navi mumbai" in loc_lower:
        return "Navi Mumbai"
    if "mumbai" in loc_lower or "thane" in loc_lower:
        return "Mumbai"
    if "nagpur" in loc_lower:
        return "Nagpur"
    if "nashik" in loc_lower:
        return "Nashik"
    if "aurangabad" in loc_lower or "sambhajinagar" in loc_lower:
        return "Chh. Sambhajinagar"
    if "kolhapur" in loc_lower:
        return "Kolhapur"
    if "solapur" in loc_lower:
        return "Solapur"
    return "Maharashtra"

def map_sector(industry, title, skills):
    comb = f"{industry} {title} {skills}".lower()
    if any(k in comb for k in ["it", "software", "developer", "engineer", "java", "python", "react", "cloud", "qa", "analyst"]):
        return "IT & Software"
    if any(k in comb for k in ["bank", "finance", "accounts", "tax", "audit", "credit", "insurance", "ca"]):
        return "BFSI"
    if any(k in comb for k in ["auto", "machinist", "mechanical", "cnc", "welder", "production", "manufacturing", "maintenance", "quality", "assembly"]):
        return "Manufacturing & Auto"
    if any(k in comb for k in ["pharma", "clinical", "biotech", "medical", "hospital", "drug"]):
        return "Healthcare & Pharma"
    if any(k in comb for k in ["construction", "civil", "survey", "site engineer", "architect", "structural"]):
        return "Construction & Infrastructure"
    if any(k in comb for k in ["logistics", "supply chain", "warehouse", "transport", "cargo"]):
        return "Logistics & Supply Chain"
    if any(k in comb for k in ["agri", "agro", "rural", "fertilizer", "crop"]):
        return "Agriculture & Food Processing"
    if any(k in comb for k in ["solar", "renewable", "energy", "power", "electrical"]):
        return "Energy & Power"
    return "Services & Miscellaneous"

def fetch_and_build_real_corpus():
    url = 'https://huggingface.co/datasets/jason1966/PromptCloudHQ_jobs-on-naukricom/resolve/main/naukri_com-job_sample.csv'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    print(f"Downloading real Naukri Maharashtra jobs from {url}...")
    
    mh_keywords = [
        'pune', 'mumbai', 'navi mumbai', 'nagpur', 'nashik', 
        'aurangabad', 'kolhapur', 'thane', 'solapur', 'chakan', 
        'talegaon', 'pimpri', 'maharashtra'
    ]
    
    postings = []
    
    with urllib.request.urlopen(req) as resp:
        stream = io.TextIOWrapper(resp, encoding='utf-8', errors='ignore')
        reader = csv.DictReader(stream)
        for i, row in enumerate(reader):
            loc = (row.get('joblocation_address') or '')
            loc_lower = loc.lower()
            if any(k in loc_lower for k in mh_keywords):
                title = clean_text(row.get('jobtitle', ''))
                company = clean_text(row.get('company', ''))
                industry = clean_text(row.get('industry', ''))
                skills = clean_text(row.get('skills', ''))
                desc = clean_text(row.get('jobdescription', ''))
                exp = clean_text(row.get('experience', ''))
                salary = clean_text(row.get('payrate', ''))
                city = map_city(loc)
                sector = map_sector(industry, title, skills)
                
                # Combine skills and description into a rich searchable text
                full_text = f"{title}. Skills: {skills}. Industry: {industry}. Description: {desc[:400]}"
                
                postings.append({
                    "id": f"REAL_MH_{len(postings)+1:04d}",
                    "title": title,
                    "org": company or "Leading Maharashtra Employer",
                    "sector": sector,
                    "city": city,
                    "skills_raw": skills,
                    "experience": exp,
                    "salary": salary,
                    "text": full_text
                })
                
                if len(postings) >= 1000:
                    break
                    
    print(f"Successfully extracted {len(postings)} authentic Maharashtra job postings!")
    
    output_data = {
        "meta": {
            "name": "maharashtra_real_naukri_v1",
            "source": "PromptCloud / Naukri.com Verified Indian Job Postings Corpus",
            "type": "Authentic Real-World Data",
            "total_postings": len(postings),
            "generated": "2026-09-30",
            "districts_covered": list(set(p['city'] for p in postings)),
            "sectors_covered": list(set(p['sector'] for p in postings))
        },
        "postings": postings
    }
    
    out_path = os.path.join(os.path.dirname(__file__), "..", "data", "jobs", "maharashtra_real_jobs.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)
    print(f"Saved real-world dataset to {out_path}!")

if __name__ == "__main__":
    fetch_and_build_real_corpus()
