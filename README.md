
# AI Interviewer System

The **AI Interviewer System** is a modular full-stack application designed to streamline and automate various parts of the recruitment process. It supports resume parsing, candidate scoring, AI-generated interview questions, and a frontend dashboard for managing candidates and interviews.

---

##  Project Structure

```

AI-Interviewer-System/
├── backend                      # Spring Boot backend service
├── Recruitment Dashboard        # React dashboard for recruiters
├── Frontend                     # Vue frontend interface
├── resumeparser+scorer          # Resume parser and scoring service (Python)
└── interview-question-generator # AI interview question generator (Python)

````

---

## ⚙ Requirements

- Java 17+
- Maven
- PostgreSQL
- Node.js and npm
- Python 3
- pip

---

##  Setup and Run Instructions

### 1. Backend

**Tech Stack:** Java 17, Spring Boot, Maven, PostgreSQL

#### Prerequisites:
- PostgreSQL should be installed and running.
- Database connection settings should be configured in `application.properties`.

#### How to Run:
```bash
cd backend
./mvnw spring-boot:run
````

> Alternatively, open the project in **IntelliJ IDEA** and run the `BackendApplication.java` file directly.

---

### 2. Recruitment Dashboard

**Tech Stack:** React, Vite

#### How to Run:

```bash
cd "Recruitment Dashboard"
npm install
npm run dev
```

---

### 3. Frontend

**Tech Stack:** Vue 3, Vite, TypeScript

#### How to Run:

```bash
cd Frontend
npm install
npm run dev
```

---

### 4. Resume Parser + Scorer

**Tech Stack:** Python 3, NLP Libraries

#### How to Run:

```bash
cd resumeparser+scorer
pip install -r requirements.txt
python3 main.py
```

---

### 5. Interview Question Generator

**Tech Stack:** Python 3, AI APIs (e.g., OpenAI)

#### How to Run:

```bash
cd interview-question-generator
pip install -r requirements.txt
python3 app.py
```

---

##  Technology Stack Summary

| Component              | Tech Stack                              |
| ---------------------- | --------------------------------------- |
| Backend                | Java 17, Spring Boot, Maven, PostgreSQL |
| Recruitment Dashboard  | React.js, Vite, Node.js                 |
| Frontend (UI)          | Vue 3, Vite, TypeScript                 |
| Resume Parser + Scorer | Python 3, spaCy, scikit-learn           |
| Interview Question Gen | Python 3, LLM APIs (e.g., OpenAI)       |

---

##  Notes

* Always start the backend first before launching the dashboard or frontend, as they rely on API connections.
* Ensure no port conflicts exist across modules.
* Update any `.env` or config files as needed to match your local environment.

---

##  Future Improvements

* Dockerize all modules for easier deployment
* Implement authentication and role-based access
* Add CI/CD support for automated testing and deployment

```

---

Let me know if you'd like me to include instructions for setting up a `.env` file, PostgreSQL schema, or API endpoint documentation as well.
```
