# ──────────────────────────────────────────────────────────────────────────────
#  CVScan – Intelligent Resume Review Tool (Updated)
# ──────────────────────────────────────────────────────────────────────────────
import streamlit as st
import pdfplumber
import docx
import base64
from fpdf import FPDF
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import requests
import openai

# ─── 1. Set API Keys ──────────────────────────────────────────────────────────
openai.api_key = "sk-4086040f1a1d4010bf05af81851ecd75"  # Replace with your actual DeepSeek key
openai.base_url = "https://api.deepseek.com/v1"

RAPIDAPI_KEY = "0479d7a68fmsh66470b21b0d3b27p127da9jsn83e5f3c4542a"

# ─── 2. Helper Functions ──────────────────────────────────────────────────────

def extract_text_from_pdf(file):
    with pdfplumber.open(file) as pdf:
        return "\n".join(p.extract_text() for p in pdf.pages if p.extract_text())

def extract_text_from_docx(file):
    doc = docx.Document(file)
    return "\n".join(p.text for p in doc.paragraphs)

def get_resume_text(resume_file):
    if resume_file.name.lower().endswith(".pdf"):
        return extract_text_from_pdf(resume_file)
    elif resume_file.name.lower().endswith(".docx"):
        return extract_text_from_docx(resume_file)
    return ""

def calculate_match_score(resume_text, job_text):
    vect = TfidfVectorizer(stop_words="english")
    mat = vect.fit_transform([resume_text, job_text])
    return round(cosine_similarity(mat[0:1], mat[1:2])[0, 0] * 100, 2)

def generate_pdf_report(score, formatting_issues, suggestions):
    pdf = FPDF(); pdf.add_page(); pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, "CVScan Resume Analysis Report", ln=True, align="C"); pdf.ln(10)
    pdf.cell(200, 10, f"Match Score: {score}%", ln=True); pdf.ln(5)

    pdf.set_font("Arial", "B", 12); pdf.cell(200, 10, "Formatting Feedback:", ln=True)
    pdf.set_font("Arial", size=12)
    for iss in formatting_issues: pdf.multi_cell(0, 8, f"- {iss}")
    pdf.ln(4)

    pdf.set_font("Arial", "B", 12); pdf.cell(200, 10, "Suggestions for Improvement:", ln=True)
    pdf.set_font("Arial", size=12)
    for tip in suggestions: pdf.multi_cell(0, 8, f"- {tip}")

    out_file = "resume_analysis_report.pdf"; pdf.output(out_file)
    with open(out_file, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    return f'<a href="data:application/pdf;base64,{b64}" download="CVScan_Report.pdf">📥 Download Report</a>'

def get_gpt_suggestions(resume_text, job_description):
    messages = [{
        "role": "user",
        "content": f"Give suggestions to improve this resume based on the job description:\n\nResume:\n{resume_text[:3000]}\n\nJob Description:\n{job_description[:1500]}"
    }]

    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.3,
        max_tokens=200,
    )
    return response.choices[0].message.content.strip()

def extract_keywords_from_resume(resume_text):
    messages = [{
        "role": "user",
        "content": f"Extract top 3 job titles and top 5 skills from this resume:\n\n{resume_text[:4000]}"
    }]
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.3,
        max_tokens=150,
    )
    return response.choices[0].message.content.strip()

def find_jobs(keyword, location="Japan", num_results=5):
    url = "https://jsearch.p.rapidapi.com/search"
    querystring = {"query": keyword, "page": "1", "num_pages": "1", "location": location}
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }
    response = requests.get(url, headers=headers, params=querystring)
    data = response.json()

    job_list = []
    for job in data.get("data", [])[:num_results]:
        job_list.append({
            "title": job.get("job_title", "No title"),
            "company": job.get("employer_name", "Unknown"),
            "location": job.get("job_city", "Unknown"),
            "url": job.get("job_apply_link", "#")
        })

    return job_list

# ─── 3. Streamlit UI ───────────────────────────────────────────────────────────
st.set_page_config(page_title="CVScan – Resume Analyzer", layout="wide")
st.title("📄 CVScan: Intelligent Resume Review Tool")

st.subheader("1️⃣ Upload Your Resume")
resume_file = st.file_uploader("Upload PDF or DOCX", type=["pdf", "docx"])

st.subheader("2️⃣ Paste or Upload Job Description")
job_desc_text = st.text_area("Paste job description")
job_desc_file = st.file_uploader("…or upload TXT/PDF", type=["txt", "pdf"])

# ─── 4. Analyze ────────────────────────────────────────────────────────────────
if st.button("🔍 Analyze Resume"):
    if not resume_file:
        st.warning("Please upload a resume.")
    elif not job_desc_text.strip() and not job_desc_file:
        st.warning("Please provide a job description.")
    else:
        # Get job description from text or file
        if job_desc_file:
            if job_desc_file.name.lower().endswith(".txt"):
                job_text = job_desc_file.read().decode("utf-8", errors="ignore")
            elif job_desc_file.name.lower().endswith(".pdf"):
                job_text = extract_text_from_pdf(job_desc_file)
            else:
                job_text = ""
        else:
            job_text = job_desc_text

        resume_text = get_resume_text(resume_file)
        score = calculate_match_score(resume_text, job_text)

        st.metric("🔎 Job Match Score", f"{score}%")

        formatting_issues = []
        if len(resume_text.split()) < 150:
            formatting_issues.append("Resume is very short (under 150 words).")
        if "objective" not in resume_text.lower():
            formatting_issues.append("Consider adding an Objective / Summary section.")

        suggestions = [
            "Include more role-specific keywords.",
            "Quantify achievements (e.g., ‘increased sales by 15%’).",
        ]

        st.markdown("### ⚠️ Formatting Feedback")
        for issue in formatting_issues:
            st.warning(issue)

        st.markdown("### 💡 Basic Suggestions")
        for tip in suggestions:
            st.info(tip)

        with st.spinner("🤖 GPT is reviewing your resume..."):
            gpt_feedback = get_gpt_suggestions(resume_text, job_text)
        st.markdown("### 🧠 GPT-Powered Suggestions")
        st.success(gpt_feedback)

        with st.spinner("🔍 Extracting job titles and skills..."):
            extracted_keywords = extract_keywords_from_resume(resume_text)
        st.markdown("### 🧷 Extracted Keywords")
        st.code(extracted_keywords)

        search_keyword = extracted_keywords.split("\n")[0].replace("Top job titles:", "").split(",")[0].strip()
        st.markdown(f"**🔎 Searching jobs for:** `{search_keyword}`")

        jobs = find_jobs(search_keyword)
        st.markdown("### 💼 Matching Job Opportunities")
        if jobs:
            for job in jobs:
                st.write(f"**🧾 {job['title']}** at *{job['company']}* ({job['location']})")
                st.markdown(f"[Apply Here]({job['url']})", unsafe_allow_html=True)
                st.markdown("---")
        else:
            st.info("No jobs found matching your profile.")

        st.markdown("### 📥 Download Resume Report")
        pdf_link = generate_pdf_report(score, formatting_issues, suggestions + [gpt_feedback])
        st.markdown(pdf_link, unsafe_allow_html=True)
