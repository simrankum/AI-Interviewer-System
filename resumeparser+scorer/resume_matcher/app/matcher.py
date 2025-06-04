import json
import spacy
import re
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

# Load NLP model once
nlp = spacy.load("en_core_web_sm")
model = SentenceTransformer('all-MiniLM-L6-v2')

# Load predefined skill list (from file or hardcoded)
with open("/Users/lvallabhaneni/Documents/GitHub/Jarvis-Techies/resumeparser+scorer/resume_matcher/models/skills.json") as f:
    SKILLS = json.load(f)["skills"]

def extract_skills(text):
    """Extract skills from resume or job description using NLP techniques."""
    doc = nlp(text)

    # 1. Get all noun chunks (potential skill phrases)
    noun_chunks = [chunk.text.strip() for chunk in doc.noun_chunks]

    # 2. Get named entities labeled as ORG, PRODUCT, WORK_OF_ART (often tool/tech names)
    named_ents = [ent.text.strip() for ent in doc.ents if ent.label_ in {"ORG", "PRODUCT", "WORK_OF_ART"}]

    # 3. Get proper nouns or alphanum tokens (e.g., Python, Java, AWS)
    proper_nouns = [token.text.strip() for token in doc if token.pos_ == "PROPN" and len(token.text) > 1]

    # Combine and clean
    raw_skills = noun_chunks + named_ents + proper_nouns
    skills = set()

    # Match skills against the predefined list
    for skill in raw_skills:
        if 2 <= len(skill) <= 50 and not skill.lower().startswith("resume"):
            # Match against predefined skills (case-insensitive)
            if any(skill.lower() == predefined_skill.lower() for predefined_skill in SKILLS):
                skills.add(skill)

    return sorted(skills)

def extract_additional_skills(text):
    """Extract additional tech skills based on common patterns."""
    tech_patterns = r'\b(?:[A-Z][a-z]+|\b[A-Za-z]{2,}\+\+?|Node\.js|React\.js|TypeScript|JavaScript|HTML|CSS|Git)\b'
    matches = re.findall(tech_patterns, text)
    
    # Filter matches by predefined skills
    valid_matches = [match for match in matches if match.lower() in [skill.lower() for skill in SKILLS]]
    
    
    return sorted(set(valid_matches))

def combined_skill_extractor(text):
    """Combine basic skill extraction and additional keyword-based skill extraction."""
    base_skills = extract_skills(text)
    extra_skills = extract_additional_skills(text)
    return sorted(set(base_skills + extra_skills))

def calculate_match_score(resume_text, job_desc_text):
    """Calculate ATS-like match score based on semantic similarity and skill match."""
    # Extract skills
    resume_skills = combined_skill_extractor(resume_text)
    job_desc_skills = combined_skill_extractor(job_desc_text)

    # Skill match score (percentage of shared skills)
    skill_match_score = len(set(resume_skills) & set(job_desc_skills)) / max(len(set(job_desc_skills)), 1)
    
    # Use Sentence-Transformers to compute semantic similarity between full texts
    embeddings = model.encode([resume_text, job_desc_text])
    semantic_similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    
    # Combine scores: weight skills match (40%) and semantic similarity (60%)
    total_score = (skill_match_score * 0.4) + (semantic_similarity * 0.6)
    
    # Return match score as percentage
    return round(total_score * 100, 2)