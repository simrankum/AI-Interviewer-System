# Resume Analyzer API

This repository contains the backend API for the Resume Analyzer application, which helps match candidate resumes to job requirements.

## API Endpoints

### Job APIs

1. **Get All Jobs**
   - `GET /api/jobs`
   - Returns a list of all available jobs

2. **Get Job Details**
   - `GET /api/jobs/:id`
   - Returns detailed information about a specific job



### Resume APIs

1. **Upload and Analyze Resumes**
   - `POST /api/resumes/upload`
   - Uploads multiple resume files and analyzes them against a job

## Frontend UI Components

The application includes several key UI components that interact with the backend API:

### JobDetail Component

The `JobDetail` component provides an interface for viewing job details and uploading resumes. Key features include:

- Drag-and-drop resume upload functionality
- Multi-file selection with validation
- Real-time processing feedback
- Interactive resume analysis results display

### Resume Upload Hook

The `useResumeUpload` custom hook manages the resume upload workflow:

- Handles file selection and validation
- Manages file state (add/delete)
- Controls pagination for multiple resumes
- Submits files to the backend API
- Processes and displays response data

## Sample API Response Formats

### Get All Jobs Response
- `GET /api/jobs`

```json
{
  "success": true,
  "count": 5,
  "data": 
    {
    "jobId": "string",
    "jobTitle": "string",
    "location": "string",
    "locationType": "'On-site' | 'Remote' | 'Hybrid'",
    "postedDate": "string",
    "jobType": "'Full-time' | 'Part-time' | 'Contract'",
    "jobStatus": "'open' | 'close'",
    "experience?": "string",
    "[key: string]": "any",
    },
}
```

### Get Job Details Response
 - `GET /api/jobs/:id`
 
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Frontend Developer",
    "company": "TechCorp",
    "location": "San Francisco, CA",
    "locationType": "Hybrid",
    "postedDate": "2023-09-15",
    "jobType": "Full-time",
    "description": "We are looking for a skilled Frontend Developer to join our team...",
    "requiredSkills": [
      "React", 
      "TypeScript", 
      "HTML", 
      "CSS", 
      "Tailwind", 
      "JavaScript", 
      "Git", 
      "REST API"
    ]
  }
}
```

### Match Skills Response

```json
{
  "success": true,
  "data": {
    "matchPercentage": 75,
    "matchedSkills": ["React", "JavaScript", "HTML", "CSS", "Git", "REST API"],
    "missingSkills": ["TypeScript", "Tailwind"]
  }
}
```

### Resume Upload and Analysis Response
 - `POST /api/resumes/upload`

```json
{
  "success": true,
  "jobDetails": {
    "id": "1",
    "title": "Frontend Developer",
    "company": "TechCorp"
  },
  "results": [
    {
      "id": "resume-1689478965412-a8f3bc",
      "fileName": "john_doe_resume.pdf",
      "status": "Excellent Match",
      "matchScore": 85,
      "skills": ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Tailwind", "Git"],
      "feedback": "Strong match for Frontend Developer at TechCorp. Your skills align well with the job requirements."
    },
    {
      "id": "resume-1689478965413-b7e2ac",
      "fileName": "jane_smith_resume.pdf",
      "status": "Potential",
      "matchScore": 65,
      "skills": ["JavaScript", "HTML", "CSS", "jQuery", "Bootstrap", "Git"],
      "feedback": "Good match for Frontend Developer at TechCorp. You have many relevant skills, but could benefit from developing expertise in: React, TypeScript, Tailwind."
    },
    {
      "id": "resume-1689478965414-c6d1ba",
      "fileName": "corrupt_file.pdf",
      "status": "Processing Error",
      "matchScore": 0,
      "skills": [],
      "processingError": true,
      "feedback": "We couldn't analyze this file. Please try uploading a different file format or check if the file is corrupted."
    }
  ]
}
```

## UI-API Integration

### Resume Upload Flow

1. User selects resume file(s) in the JobDetail component
2. Files are validated for type (PDF, DOC, DOCX) and size
3. The UI displays an animated processing state
4. Files are submitted to `/api/resumes/upload` endpoint
5. The backend processes files and returns analysis results
6. Results are displayed with match statistics and skill breakdown

### Status Categories

The API returns candidate status in the following categories:
- **Excellent Match** (85%+ match score)
- **Matched** (70-84% match score)
- **Potential** (50-69% match score)
- **Needs Review** (30-49% match score)
- **Not Qualified** (<30% match score)
- **Processing Error** (file couldn't be processed)

## Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Set up environment variables (see `.env.example`)
4. Run `npm run dev` to start the development server
5. The server will be available at `http://localhost:3000`
