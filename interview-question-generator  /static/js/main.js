document.addEventListener('DOMContentLoaded', function() {
    const questionForm = document.getElementById('questionForm');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const questionResults = document.getElementById('questionResults');
    const questionAccordion = document.getElementById('questionAccordion');
    const printBtn = document.getElementById('printBtn');
    const newQuestionsBtn = document.getElementById('newQuestionsBtn');
    const generateFollowUpBtn = document.getElementById('generateFollowUpBtn');
    
    setupInterviewerFeedback();
    document.querySelectorAll('[data-bs-toggle="modal"]').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-bs-target');
            if (targetId) {
                const modalElement = document.querySelector(targetId);
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                }
            }
        });
    });
    // Bootstrap modal
    const followUpModal = new bootstrap.Modal(document.getElementById('followUpModal'));
    let currentQuestionElement = null;
    
    // Handle form submission
    questionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Show loading indicator
        loadingIndicator.classList.remove('d-none');
        questionResults.classList.add('d-none');
        
        // Get form data
        const formData = {
            job_role: document.getElementById('job_role').value,
            industry: document.getElementById('industry').value,
            experience_level: document.getElementById('experience_level').value,
            candidate_background: document.getElementById('candidate_background').value,
            question_count: document.getElementById('question_count').value
        };
        
        // Call API to generate questions
        fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            // Hide loading indicator
            loadingIndicator.classList.add('d-none');
            
            // Display questions
            displayQuestions(data);
            questionResults.classList.remove('d-none');
        })
        .catch(error => {
            console.error('Error:', error);
            loadingIndicator.classList.add('d-none');
            alert('An error occurred while generating questions. Please try again.');
        });
    });
    
    // Display generated questions
    function displayQuestions(questions) {
        questionAccordion.innerHTML = '';
        
        questions.forEach((question, index) => {
            const questionId = `question-${index}`;
            const questionType = question.type || 'General';
            
            // Create the question card
            const questionCard = document.createElement('div');
            questionCard.className = 'accordion-item question-card mb-3 shadow-sm';
            
            // Create question header
            const questionHeader = document.createElement('h2');
            questionHeader.className = 'accordion-header';
            questionHeader.id = `heading-${questionId}`;
            
            const accordionButton = document.createElement('button');
            accordionButton.className = 'accordion-button collapsed';
            accordionButton.type = 'button';
            accordionButton.setAttribute('data-bs-toggle', 'collapse');
            accordionButton.setAttribute('data-bs-target', `#collapse-${questionId}`);
            accordionButton.setAttribute('aria-expanded', 'false');
            accordionButton.setAttribute('aria-controls', `collapse-${questionId}`);
            
            // Add type badge
            const typeBadge = document.createElement('span');
            typeBadge.className = `question-type-badge ${questionType.toLowerCase().replace(' ', '-')}`;
            typeBadge.textContent = questionType;
            
            const questionText = document.createElement('span');
            questionText.className = 'ms-2';
            questionText.textContent = question.question;
            
            accordionButton.appendChild(typeBadge);
            accordionButton.appendChild(questionText);
            questionHeader.appendChild(accordionButton);
            
            // Create question content
            const questionContent = document.createElement('div');
            questionContent.id = `collapse-${questionId}`;
            questionContent.className = 'accordion-collapse collapse';
            questionContent.setAttribute('aria-labelledby', `heading-${questionId}`);
            questionContent.setAttribute('data-bs-parent', '#questionAccordion');
            
            // Create accordion body
            const accordionBody = document.createElement('div');
            accordionBody.className = 'accordion-body';
            
            // What this evaluates
            if (question.evaluates) {
                const evaluatesSection = document.createElement('div');
                evaluatesSection.className = 'mb-3';
                
                const evaluatesLabel = document.createElement('div');
                evaluatesLabel.className = 'fw-bold mb-1';
                evaluatesLabel.textContent = 'This question evaluates:';
                
                const evaluatesValue = document.createElement('div');
                
                // Format evaluates as tags if it's a string
                if (typeof question.evaluates === 'string') {
                    const skills = question.evaluates.split(',').map(skill => skill.trim());
                    skills.forEach(skill => {
                        const tag = document.createElement('span');
                        tag.className = 'evaluates-tag';
                        tag.textContent = skill;
                        evaluatesValue.appendChild(tag);
                    });
                } else {
                    evaluatesValue.textContent = question.evaluates;
                }
                
                evaluatesSection.appendChild(evaluatesLabel);
                evaluatesSection.appendChild(evaluatesValue);
                accordionBody.appendChild(evaluatesSection);
            }
            
            // Strong answer example
            if (question.strong_answer_example) {
                const answerSection = document.createElement('div');
                answerSection.className = 'mb-3';
                
                const answerLabel = document.createElement('div');
                answerLabel.className = 'fw-bold mb-1';
                answerLabel.textContent = 'What makes a strong answer:';
                
                const answerValue = document.createElement('div');
                answerValue.className = 'p-2 bg-light rounded';
                answerValue.textContent = question.strong_answer_example;
                
                answerSection.appendChild(answerLabel);
                answerSection.appendChild(answerValue);
                accordionBody.appendChild(answerSection);
            }
            
            // Follow-up questions
            if (question.follow_ups && question.follow_ups.length > 0) {
                const followUpsSection = document.createElement('div');
                followUpsSection.className = 'mb-3';
                
                const followUpsLabel = document.createElement('div');
                followUpsLabel.className = 'fw-bold mb-1';
                followUpsLabel.textContent = 'Suggested follow-up questions:';
                
                const followUpsList = document.createElement('ul');
                followUpsList.className = 'list-group list-group-flush';
                
                if (Array.isArray(question.follow_ups)) {
                    question.follow_ups.forEach(followUp => {
                        const followUpItem = document.createElement('li');
                        followUpItem.className = 'list-group-item px-0';
                        followUpItem.textContent = typeof followUp === 'string' ? followUp : followUp.follow_up_question || followUp;
                        followUpsList.appendChild(followUpItem);
                    });
                } else {
                    // Handle case where follow_ups might not be an array
                    const followUpItem = document.createElement('li');
                    followUpItem.className = 'list-group-item px-0';
                    followUpItem.textContent = question.follow_ups.toString();
                    followUpsList.appendChild(followUpItem);
                }
                
                followUpsSection.appendChild(followUpsLabel);
                followUpsSection.appendChild(followUpsList);
                accordionBody.appendChild(followUpsSection);
            }
            
            // Add button to generate more follow-up questions
            const generateMoreFollowUps = document.createElement('div');
            generateMoreFollowUps.className = 'text-end no-print';
            
            const followUpButton = document.createElement('button');
            followUpButton.className = 'btn btn-sm btn-outline-primary';
            followUpButton.textContent = 'Generate Follow-up Questions';
            followUpButton.addEventListener('click', function() {
                openFollowUpModal(question.question, questionId);
            });
            
            generateMoreFollowUps.appendChild(followUpButton);
            accordionBody.appendChild(generateMoreFollowUps);
            
            questionContent.appendChild(accordionBody);
            
            // Add question to accordion
            questionCard.appendChild(questionHeader);
            questionCard.appendChild(questionContent);
            questionAccordion.appendChild(questionCard);
        });
    }
    
    // Open follow-up question modal
    function openFollowUpModal(question, questionId) {
        document.getElementById('originalQuestion').textContent = question;
        document.getElementById('candidateAnswer').value = '';
        document.getElementById('followUpResults').classList.add('d-none');
        currentQuestionElement = questionId;
        followUpModal.show();
    }
    
    // Generate follow-up questions based on candidate's answer
    generateFollowUpBtn.addEventListener('click', function() {
        const question = document.getElementById('originalQuestion').textContent;
        const answer = document.getElementById('candidateAnswer').value.trim();
        
        if (!answer) {
            alert('Please enter the candidate\'s answer.');
            return;
        }
        
        const followUpLoading = document.getElementById('followUpLoading');
        const followUpResults = document.getElementById('followUpResults');
        const followUpList = document.getElementById('followUpList');
        
        followUpLoading.classList.remove('d-none');
        followUpResults.classList.add('d-none');
        
        // Call API to generate follow-up questions
        fetch('/follow-up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question, answer })
        })
        .then(response => response.json())
        .then(data => {
            followUpLoading.classList.add('d-none');
            
            // Display follow-up questions
            followUpList.innerHTML = '';
            
            data.forEach(followUp => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                
                const question = document.createElement('div');
                question.className = 'follow-up-question';
                question.textContent = followUp.follow_up_question;
                
                const purpose = document.createElement('div');
                purpose.className = 'purpose-text mt-1';
                purpose.textContent = followUp.purpose;
                
                li.appendChild(question);
                li.appendChild(purpose);
                followUpList.appendChild(li);
            });
            
            followUpResults.classList.remove('d-none');
        })
        .catch(error => {
            console.error('Error:', error);
            followUpLoading.classList.add('d-none');
            alert('An error occurred while generating follow-up questions. Please try again.');
        });
    });
    // Real-time Suggestions Panel
function setupRealtimeSuggestions() {
    const suggestionPanel = document.createElement('div');
    suggestionPanel.id = 'suggestionPanel';
    suggestionPanel.className = 'suggestion-panel card shadow-sm';
    suggestionPanel.innerHTML = `
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <span>AI Interview Assistant</span>
            <button class="btn btn-sm btn-light" id="refreshSuggestions">
                <i class="bi bi-arrow-clockwise"></i> Refresh
            </button>
        </div>
        <div class="card-body">
            <div class="mb-3">
                <label for="interviewContext" class="form-label">Current Discussion Context</label>
                <textarea class="form-control form-control-sm" id="interviewContext" rows="3"
                    placeholder="Paste recent interview conversation here..."></textarea>
            </div>
            <button class="btn btn-sm btn-primary" id="getSuggestions">Get Suggestions</button>
            
            <div id="suggestionsLoading" class="text-center my-3 d-none">
                <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                <span class="ms-2">Generating suggestions...</span>
            </div>
            
            <div id="suggestionsContent" class="mt-3 d-none">
                <h6 class="border-bottom pb-2">Suggested Questions</h6>
                <ul id="nextQuestionsList" class="list-group list-group-flush small mb-3"></ul>
                
                <h6 class="border-bottom pb-2">Uncovered Areas</h6>
                <ul id="uncoveredAreasList" class="list-group list-group-flush small mb-3"></ul>
                
                <h6 class="border-bottom pb-2">Probe Deeper On</h6>
                <ul id="probeDeeperList" class="list-group list-group-flush small"></ul>
            </div>
        </div>
    `;
    
    document.body.appendChild(suggestionPanel);
    
    // Setup event listeners
    document.getElementById('getSuggestions').addEventListener('click', getRealtimeSuggestions);
    document.getElementById('refreshSuggestions').addEventListener('click', getRealtimeSuggestions);
}

function getRealtimeSuggestions() {
    const interviewContext = document.getElementById('interviewContext').value;
    const job_role = document.getElementById('job_role').value || sessionStorage.getItem('job_role') || 'this position';
    
    if (!interviewContext) {
        alert('Please enter some interview conversation context');
        return;
    }
    
    const suggestionsLoading = document.getElementById('suggestionsLoading');
    const suggestionsContent = document.getElementById('suggestionsContent');
    
    suggestionsLoading.classList.remove('d-none');
    suggestionsContent.classList.add('d-none');
    
    fetch('/realtime-suggestions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            job_role: job_role,
            discussion_context: interviewContext,
            interview_stage: 'middle'
        })
    })
    .then(response => response.json())
    .then(data => {
        suggestionsLoading.classList.add('d-none');
        
        // Populate suggestion lists
        const nextQuestionsList = document.getElementById('nextQuestionsList');
        const uncoveredAreasList = document.getElementById('uncoveredAreasList');
        const probeDeeperList = document.getElementById('probeDeeperList');
        
        nextQuestionsList.innerHTML = '';
        uncoveredAreasList.innerHTML = '';
        probeDeeperList.innerHTML = '';
        
        // Next questions
        if (data.next_questions && data.next_questions.length > 0) {
            data.next_questions.forEach(item => {
                const li = document.createElement('li');
                li.className = 'list-group-item py-1 px-2';
                li.innerHTML = `<i class="bi bi-chat-square-text me-2 text-primary"></i>${item}`;
                nextQuestionsList.appendChild(li);
            });
        }
        
        // Uncovered areas
        if (data.uncovered_areas && data.uncovered_areas.length > 0) {
            data.uncovered_areas.forEach(item => {
                const li = document.createElement('li');
                li.className = 'list-group-item py-1 px-2';
                li.innerHTML = `<i class="bi bi-exclamation-circle me-2 text-warning"></i>${item}`;
                uncoveredAreasList.appendChild(li);
            });
        }
        
        // Probe deeper
        if (data.probe_deeper && data.probe_deeper.length > 0) {
            data.probe_deeper.forEach(item => {
                const li = document.createElement('li');
                li.className = 'list-group-item py-1 px-2';
                li.innerHTML = `<i class="bi bi-search me-2 text-info"></i>${item}`;
                probeDeeperList.appendChild(li);
            });
        }
        
        suggestionsContent.classList.remove('d-none');
    })
    .catch(error => {
        console.error('Error:', error);
        suggestionsLoading.classList.add('d-none');
        alert('Failed to get suggestions. Please try again.');
    });
}

// Candidate Evaluation Component
function setupCandidateEvaluationModal() {
    const modalHTML = `
    <div class="modal fade" id="evaluationModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Candidate Evaluation</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="container-fluid">
                        <form id="evaluationForm">
                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <label for="evalJobRole" class="form-label">Job Role</label>
                                    <input type="text" class="form-control" id="evalJobRole" required>
                                </div>
                                <div class="col-md-8">
                                    <label class="form-label">Evaluation Criteria</label>
                                    <div class="d-flex flex-wrap" id="criteriaContainer">
                                        <div class="form-check me-3 mb-2">
                                            <input class="form-check-input" type="checkbox" value="Technical Competence" id="criteriaTechnical" checked>
                                            <label class="form-check-label" for="criteriaTechnical">
                                                Technical Competence
                                            </label>
                                        </div>
                                        <div class="form-check me-3 mb-2">
                                            <input class="form-check-input" type="checkbox" value="Communication Skills" id="criteriaCommunication" checked>
                                            <label class="form-check-label" for="criteriaCommunication">
                                                Communication Skills
                                            </label>
                                        </div>
                                        <div class="form-check me-3 mb-2">
                                            <input class="form-check-input" type="checkbox" value="Problem-Solving" id="criteriaProblemSolving" checked>
                                            <label class="form-check-label" for="criteriaProblemSolving">
                                                Problem-Solving
                                            </label>
                                        </div>
                                        <div class="form-check me-3 mb-2">
                                            <input class="form-check-input" type="checkbox" value="Cultural Fit" id="criteriaCulturalFit" checked>
                                            <label class="form-check-label" for="criteriaCulturalFit">
                                                Cultural Fit
                                            </label>
                                        </div>
                                        <div class="form-check me-3 mb-2">
                                            <input class="form-check-input" type="checkbox" value="Leadership" id="criteriaLeadership" checked>
                                            <label class="form-check-label" for="criteriaLeadership">
                                                Leadership
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div id="responsesContainer">
                                <h6>Candidate Responses</h6>
                                <div class="response-pair mb-3">
                                    <div class="row g-2">
                                        <div class="col-md-5">
                                            <input type="text" class="form-control form-control-sm response-question" 
                                                placeholder="Question asked" required>
                                        </div>
                                        <div class="col-md-7">
                                            <textarea class="form-control form-control-sm response-answer" rows="2" 
                                                placeholder="Candidate's answer" required></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3 text-end">
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="addResponseBtn">
                                    <i class="bi bi-plus-circle"></i> Add Response
                                </button>
                            </div>
                            
                            <button type="submit" class="btn btn-primary" id="evaluateBtn">Evaluate Candidate</button>
                        </form>
                        
                        <div id="evaluationLoading" class="text-center my-4 d-none">
                            <div class="spinner-border text-primary" role="status"></div>
                            <p class="mt-2">Analyzing candidate performance...</p>
                        </div>
                        
                        <div id="evaluationResults" class="mt-4 d-none">
                            <h5 class="border-bottom pb-2">Evaluation Results</h5>
                            
                            <div class="row">
                                <div class="col-md-8">
                                    <div id="scoreCardsContainer" class="d-flex flex-wrap"></div>
                                </div>
                                <div class="col-md-4">
                                    <div class="card mb-3">
                                        <div class="card-header bg-light">
                                            <strong>Overall Fit</strong>
                                        </div>
                                        <div class="card-body">
                                            <div id="overallFitDisplay" class="text-center mb-3"></div>
                                            
                                            <h6 class="border-bottom pb-1">Key Strengths</h6>
                                            <ul id="strengthsList" class="small"></ul>
                                            
                                            <h6 class="border-bottom pb-1">Areas for Improvement</h6>
                                            <ul id="improvementsList" class="small"></ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="printEvaluation" disabled>Print Evaluation</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Append modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Setup event listeners
    document.getElementById('addResponseBtn').addEventListener('click', addResponseField);
    document.getElementById('evaluationForm').addEventListener('submit', evaluateCandidate);
    document.getElementById('printEvaluation').addEventListener('click', printEvaluation);
    
    // Initialize with job role if available
    const jobRoleInput = document.getElementById('job_role');
    if (jobRoleInput && jobRoleInput.value) {
        document.getElementById('evalJobRole').value = jobRoleInput.value;
    }
}

function addResponseField() {
    const container = document.getElementById('responsesContainer');
    const responseDiv = document.createElement('div');
    responseDiv.className = 'response-pair mb-3';
    responseDiv.innerHTML = `
        <div class="row g-2">
            <div class="col-md-5">
                <input type="text" class="form-control form-control-sm response-question" 
                    placeholder="Question asked" required>
            </div>
            <div class="col-md-7 d-flex">
                <textarea class="form-control form-control-sm response-answer me-2" rows="2" 
                    placeholder="Candidate's answer" required></textarea>
                <button type="button" class="btn btn-outline-danger btn-sm remove-response">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        </div>
    `;
    
    container.appendChild(responseDiv);
    
    // Add listener to remove button
    responseDiv.querySelector('.remove-response').addEventListener('click', function() {
        container.removeChild(responseDiv);
    });
}

function evaluateCandidate(e) {
    e.preventDefault();
    
    const jobRole = document.getElementById('evalJobRole').value;
    
    // Get selected criteria
    const criteria = [];
    document.querySelectorAll('#criteriaContainer input[type="checkbox"]:checked').forEach(cb => {
        criteria.push(cb.value);
    });
    
    // Get candidate responses
    const responses = [];
    const responsePairs = document.querySelectorAll('.response-pair');
    responsePairs.forEach(pair => {
        const question = pair.querySelector('.response-question').value;
        const answer = pair.querySelector('.response-answer').value;
        
        if (question && answer) {
            responses.push({ question, answer });
        }
    });
    
    if (responses.length === 0) {
        alert('Please add at least one question and answer');
        return;
    }
    
    // Show loading, hide form and results
    document.getElementById('evaluationForm').style.display = 'none';
    document.getElementById('evaluationLoading').classList.remove('d-none');
    document.getElementById('evaluationResults').classList.add('d-none');
    
    // Call API
    fetch('/evaluate-candidate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            job_role: jobRole,
            candidate_responses: responses,
            evaluation_criteria: criteria
        })
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading
        document.getElementById('evaluationLoading').classList.add('d-none');
        
        // Display results
        displayEvaluationResults(data);
        
        // Enable print button
        document.getElementById('printEvaluation').disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('evaluationLoading').classList.add('d-none');
        document.getElementById('evaluationForm').style.display = 'block';
        alert('Failed to evaluate candidate. Please try again.');
    });
}

function displayEvaluationResults(data) {
    const scoreCardsContainer = document.getElementById('scoreCardsContainer');
    const strengthsList = document.getElementById('strengthsList');
    const improvementsList = document.getElementById('improvementsList');
    const overallFitDisplay = document.getElementById('overallFitDisplay');
    
    // Clear previous results
    scoreCardsContainer.innerHTML = '';
    strengthsList.innerHTML = '';
    improvementsList.innerHTML = '';
    
    // Display score cards
    if (data.scores && data.scores.length > 0) {
        data.scores.forEach(score => {
            const scoreCard = document.createElement('div');
            scoreCard.className = 'card m-2';
            scoreCard.style.width = '45%';
            
            let scoreColorClass = 'bg-danger text-white';
            if (score.score >= 4) scoreColorClass = 'bg-success text-white';
            else if (score.score >= 3) scoreColorClass = 'bg-primary text-white';
            else if (score.score >= 2) scoreColorClass = 'bg-warning';
            
            scoreCard.innerHTML = `
                <div class="card-header d-flex justify-content-between align-items-center">
                    <span>${score.criterion}</span>
                    <span class="badge rounded-pill ${scoreColorClass}">${score.score}/5</span>
                </div>
                <div class="card-body p-2">
                    <p class="card-text small mb-1"><strong>Evidence:</strong> ${score.evidence}</p>
                    <p class="card-text small mb-0"><strong>Improvement:</strong> ${score.improvement}</p>
                </div>
            `;
            
            scoreCardsContainer.appendChild(scoreCard);
        });
    }
    
    // Display overall assessment
    if (data.overall_assessment) {
        // Strengths
        if (data.overall_assessment.strengths && data.overall_assessment.strengths.length > 0) {
            data.overall_assessment.strengths.forEach(strength => {
                const li = document.createElement('li');
                li.textContent = strength;
                strengthsList.appendChild(li);
            });
        }
        
        // Areas for improvement
        if (data.overall_assessment.areas_for_improvement && data.overall_assessment.areas_for_improvement.length > 0) {
            data.overall_assessment.areas_for_improvement.forEach(area => {
                const li = document.createElement('li');
                li.textContent = area;
                improvementsList.appendChild(li);
            });
        }
        
        // Overall fit
        if (data.overall_assessment.overall_fit) {
            let fitClass = '';
            let fitIcon = '';
            
            switch(data.overall_assessment.overall_fit.toLowerCase()) {
                case 'excellent fit':
                    fitClass = 'text-success';
                    fitIcon = 'bi-check-circle-fill';
                    break;
                case 'good fit':
                    fitClass = 'text-primary';
                    fitIcon = 'bi-check-circle';
                    break;
                case 'potential fit':
                    fitClass = 'text-warning';
                    fitIcon = 'bi-question-circle';
                    break;
                case 'not suitable':
                    fitClass = 'text-danger';
                    fitIcon = 'bi-x-circle';
                    break;
                default:
                    fitClass = 'text-secondary';
                    fitIcon = 'bi-dash-circle';
            }
            
            overallFitDisplay.innerHTML = `
                <i class="bi ${fitIcon} ${fitClass}" style="font-size: 2rem;"></i>
                <div class="${fitClass} fw-bold">${data.overall_assessment.overall_fit}</div>
            `;
        }
    }
    
    // Show results section
    document.getElementById('evaluationResults').classList.remove('d-none');
}

function printEvaluation() {
    window.print();
}

// Tone Analysis Component
function setupToneAnalysisModal() {
    const modalHTML = `
    <div class="modal fade" id="toneAnalysisModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Response Tone Analysis</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="toneResponseText" class="form-label">Candidate's Response</label>
                        <textarea class="form-control" id="toneResponseText" rows="5" 
                            placeholder="Paste or type the candidate's response here..."></textarea>
                    </div>
                    
                    <button class="btn btn-primary" id="analyzeToneBtn">Analyze Tone</button>
                    
                    <div id="toneLoading" class="text-center my-4 d-none">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p>Analyzing communication style and tone...</p>
                    </div>
                    
                    <div id="toneResults" class="mt-4 d-none">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-header">
                                        <strong>Tone & Confidence</strong>
                                    </div>
                                    <div class="card-body">
                                        <div id="primaryTones" class="mb-3"></div>
                                        
                                        <div class="mb-2">
                                            <label class="form-label small mb-1">Confidence Level</label>
                                            <div class="progress">
                                                <div id="confidenceBar" class="progress-bar" role="progressbar" style="width: 0%"></div>
                                            </div>
                                        </div>
                                        
                                        <div class="mb-2">
                                            <label class="form-label small mb-1">Enthusiasm</label>
                                            <div class="progress">
                                                <div id="enthusiasmBar" class="progress-bar bg-success" role="progressbar" style="width: 0%"></div>
                                            </div>
                                        </div>
                                        
                                        <p class="small mt-3" id="toneEvidence"></p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-header">
                                        <strong>Language Patterns</strong>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-2">
                                            <label class="form-label small mb-1">Concreteness</label>
                                            <div class="progress">
                                                <div id="concretenessBar" class="progress-bar bg-info" role="progressbar" style="width: 0%"></div>
                                            </div>
                                        </div>
                                        
                                        <div class="mb-2">
                                            <label class="form-label small mb-1">Specificity</label>
                                            <div class="progress">
                                                <div id="specificityBar" class="progress-bar bg-info" role="progressbar" style="width: 0%"></div>
                                            </div>
                                        </div>
                                        
                                        <div class="mb-2">
                                            <label class="form-label small mb-1">Active Voice</label>
                                            <div class="progress">
                                                <div id="activeVoiceBar" class="progress-bar bg-info" role="progressbar" style="width: 0%"></div>
                                            </div>
                                        </div>
                                        
                                        <p class="small mt-3" id="languageEvidence"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-header">
                                        <strong>Emotional Intelligence</strong>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-2">
                                            <label class="form-label small mb-1">Self-Awareness</label>
                                            <div class="progress">
                                                <div id="selfAwarenessBar" class="progress-bar bg-warning" role="progressbar" style="width: 0%"></div>
                                            </div>
                                        </div>
                                        
                                        <div class="mb-2">
                                            <label class="form-label small mb-1">Empathy</label>
                                            <div class="progress">
                                                <div id="empathyBar" class="progress-bar bg-warning" role="progressbar" style="width: 0%"></div>
                                            </div>
                                        </div>
                                        
                                        <p class="small mt-3" id="eiEvidence"></p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <div class="card mb-3">
                                    <div class="card-header">
                                        <strong>Communication Effectiveness</strong>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-2">
                                            <label class="form-label small mb-1">Clarity</label>
                                            <div class="progress">
                                                <div id="clarityBar" class="progress-bar bg-secondary" role="progressbar" style="width: 0%"></div>
                                            </div>
                                        </div>
                                        
                                        <div class="mb-2">
                                            <label class="form-label small mb-1">Organization</label>
                                            <div class="progress">
                                                <div id="organizationBar" class="progress-bar bg-secondary" role="progressbar" style="width: 0%"></div>
                                            </div>
                                        </div>
                                        
                                        <div class="mb-2">
                                            <label class="form-label small mb-1">Persuasiveness</label>
                                            <div class="progress">
                                                <div id="persuasivenessBar" class="progress-bar bg-secondary" role="progressbar" style="width: 0%"></div>
                                            </div>
                                        </div>
                                        
                                        <p class="small mt-3" id="commEvidence"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <strong>Overall Impression</strong>
                            </div>
                            <div class="card-body">
                                <p id="overallImpression"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Append modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Setup event listener
    document.getElementById('analyzeToneBtn').addEventListener('click', analyzeTone);
}

function analyzeTone() {
    const responseText = document.getElementById('toneResponseText').value;
    
    if (!responseText) {
        alert('Please enter the candidate\'s response');
        return;
    }
    
    const toneLoading = document.getElementById('toneLoading');
    const toneResults = document.getElementById('toneResults');
    
    toneLoading.classList.remove('d-none');
    toneResults.classList.add('d-none');
    
    fetch('/analyze-tone', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            candidate_response: responseText
        })
    })
    .then(response => response.json())
    .then(data => {
        toneLoading.classList.add('d-none');
        
        // Display tone analysis results
        displayToneAnalysis(data);
        
        toneResults.classList.remove('d-none');
    })
    .catch(error => {
        console.error('Error:', error);
        toneLoading.classList.add('d-none');
        alert('Failed to analyze tone. Please try again.');
    });
}

function displayToneAnalysis(data) {
    // Process tone data
    if (data.tone) {
        // Primary tones
        const primaryTones = document.getElementById('primaryTones');
        primaryTones.innerHTML = '';
        
        if (data.tone.primary_tones && data.tone.primary_tones.length > 0) {
            data.tone.primary_tones.forEach(tone => {
                const badge = document.createElement('span');
                badge.className = 'badge bg-primary me-1 mb-1';
                badge.textContent = tone;
                primaryTones.appendChild(badge);
            });
        }
        
        // Confidence level
        if (data.tone.confidence_level) {
            const confidenceBar = document.getElementById('confidenceBar');
            confidenceBar.style.width = `${data.tone.confidence_level * 20}%`;
            confidenceBar.textContent = `${data.tone.confidence_level}/5`;
        }
        
        // Enthusiasm
        if (data.tone.enthusiasm) {
            const enthusiasmBar = document.getElementById('enthusiasmBar');
            enthusiasmBar.style.width = `${data.tone.enthusiasm * 20}%`;
            enthusiasmBar.textContent = `${data.tone.enthusiasm}/5`;
        }
        
        // Tone evidence
        if (data.tone.evidence) {
            document.getElementById('toneEvidence').textContent = data.tone.evidence;
        }
    }
    
    // Process language patterns
    if (data.language_patterns) {
        // Concreteness
        if (data.language_patterns.concreteness) {
            const concretenessBar = document.getElementById('concretenessBar');
            concretenessBar.style.width = `${data.language_patterns.concreteness * 20}%`;
            concretenessBar.textContent = `${data.language_patterns.concreteness}/5`;
        }
        
        // Specificity
        if (data.language_patterns.specificity) {
            const specificityBar = document.getElementById('specificityBar');
            specificityBar.style.width = `${data.language_patterns.specificity * 20}%`;
            specificityBar.textContent = `${data.language_patterns.specificity}/5`;
        }
        
        // Active voice
        if (data.language_patterns.active_voice) {
            const activeVoiceBar = document.getElementById('activeVoiceBar');
            activeVoiceBar.style.width = `${data.language_patterns.active_voice * 20}%`;
            activeVoiceBar.textContent = `${data.language_patterns.active_voice}/5`;
        }
        
        // Language evidence
        if (data.language_patterns.evidence) {
            document.getElementById('languageEvidence').textContent = data.language_patterns.evidence;
        }
    }
    
    // Process emotional intelligence
    if (data.emotional_intelligence) {
        // Self-awareness
        if (data.emotional_intelligence.self_awareness) {
            const selfAwarenessBar = document.getElementById('selfAwarenessBar');
            selfAwarenessBar.style.width = `${data.emotional_intelligence.self_awareness * 20}%`;
            selfAwarenessBar.textContent = `${data.emotional_intelligence.self_awareness}/5`;
        }
        
        // Empathy
        if (data.emotional_intelligence.empathy) {
            const empathyBar = document.getElementById('empathyBar');
            empathyBar.style.width = `${data.emotional_intelligence.empathy * 20}%`;
            empathyBar.textContent = `${data.emotional_intelligence.empathy}/5`;
        }
        
        // EI evidence
        if (data.emotional_intelligence.evidence) {
            document.getElementById('eiEvidence').textContent = data.emotional_intelligence.evidence;
        }
    }
    
    // Process communication effectiveness
    if (data.communication_effectiveness) {
        // Clarity
        if (data.communication_effectiveness.clarity) {
            const clarityBar = document.getElementById('clarityBar');
            clarityBar.style.width = `${data.communication_effectiveness.clarity * 20}%`;
            clarityBar.textContent = `${data.communication_effectiveness.clarity}/5`;
        }
        
        // Organization
        if (data.communication_effectiveness.organization) {
            const organizationBar = document.getElementById('organizationBar');
            organizationBar.style.width = `${data.communication_effectiveness.organization * 20}%`;
            organizationBar.textContent = `${data.communication_effectiveness.organization}/5`;
        }
        
        // Persuasiveness
        if (data.communication_effectiveness.persuasiveness) {
            const persuasivenessBar = document.getElementById('persuasivenessBar');
            persuasivenessBar.style.width = `${data.communication_effectiveness.persuasiveness * 20}%`;
            persuasivenessBar.textContent = `${data.communication_effectiveness.persuasiveness}/5`;
        }
        
        // Communication evidence
        if (data.communication_effectiveness.evidence) {
            document.getElementById('commEvidence').textContent = data.communication_effectiveness.evidence;
        }
    }
    
    // Overall impression
    if (data.overall_impression) {
        document.getElementById('overallImpression').textContent = data.overall_impression;
    }
}

// Initialize all components when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Setup main navbar with new options
    addInterviewAssistantNavbar();
    
    // Setup real-time suggestions panel
    setupRealtimeSuggestions();
    
    // Setup candidate evaluation modal
    setupCandidateEvaluationModal();
    
    // Setup tone analysis modal
    setupToneAnalysisModal();
    
    // The existing code from the original main.js should remain
});

// Add navbar with new options
function addInterviewAssistantNavbar() {
    const navbar = document.createElement('div');
    navbar.className = 'interviewer-assistant-navbar';
    navbar.innerHTML = `
        <div class="d-flex justify-content-center mb-3 mt-2">
            <button class="btn btn-outline-primary mx-1" id="showSuggestionsBtn">
                <i class="bi bi-lightbulb"></i> Real-time Suggestions
            </button>
            <button class="btn btn-outline-primary mx-1" data-bs-toggle="modal" data-bs-target="#evaluationModal">
                <i class="bi bi-graph-up"></i> Evaluate Candidate
            </button>
            <button class="btn btn-outline-primary mx-1" data-bs-toggle="modal" data-bs-target="#toneAnalysisModal">
                <i class="bi bi-soundwave"></i> Analyze Tone
            </button>
        </div>
    `;
    
    // Insert after the main title but before the form
    const mainTitle = document.querySelector('h1.text-center');
    if (mainTitle) {
        mainTitle.parentNode.insertBefore(navbar, mainTitle.nextSibling);
    } else {
        // Fallback - insert at the beginning of the container
        const container = document.querySelector('.container');
        if (container) {
            container.insertBefore(navbar, container.firstChild);
        }
    }
    
    // Toggle suggestions panel
    document.getElementById('showSuggestionsBtn').addEventListener('click', function() {
        const panel = document.getElementById('suggestionPanel');
        if (panel.classList.contains('active')) {
            panel.classList.remove('active');
        } else {
            panel.classList.add('active');
        }
    });
}
    
    // Print questions
    printBtn.addEventListener('click', function() {
        window.print();
    });
    
    // Generate new questions
    newQuestionsBtn.addEventListener('click', function() {
        window.scrollTo(0, 0);
        questionResults.classList.add('d-none');
    });
});
// Post-Interview Feedback Components

function submitInterviewerFeedback(e) {
    e.preventDefault();
    
    // Show a loading indicator
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
    
    // Collect form data
    const feedbackData = {
        candidate_name: document.getElementById('candidateName').value,
        position_applied: document.getElementById('positionApplied').value,
        interview_date: document.getElementById('interviewDate').value,
        interviewer_name: document.getElementById('interviewerName').value,
        ratings: {
            technical_skills: parseInt(document.getElementById('technicalSkills').value),
            communication_skills: parseInt(document.getElementById('communicationSkills').value),
            problem_solving: parseInt(document.getElementById('problemSolving').value),
            cultural_fit: parseInt(document.getElementById('culturalFit').value),
            experience: parseInt(document.getElementById('experience').value)
        },
        key_strengths: document.getElementById('keyStrengths').value,
        areas_for_improvement: document.getElementById('areasForImprovement').value,
        overall_assessment: document.getElementById('overallAssessment').value,
        hiring_recommendation: document.querySelector('input[name="hiringRecommendation"]:checked').value
    };
    
    console.log("Submitting feedback data:", feedbackData);  // Debug log
    
    // Send data to server
    fetch('/save-interviewer-feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
    })
    .then(response => {
        console.log("Response status:", response.status);  // Debug log
        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Response data:", data);  // Debug log
        
        // Reset button
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
        
        if (data.success) {
            // Show success message
            document.getElementById('interviewerFeedbackForm').style.display = 'none';
            document.getElementById('feedbackSuccess').classList.remove('d-none');
            
            // Store in session storage for comparison report
            let savedCandidates = JSON.parse(sessionStorage.getItem('savedCandidates') || '[]');
            savedCandidates.push({
                id: data.feedback_id,
                name: feedbackData.candidate_name,
                position: feedbackData.position_applied,
                feedback: feedbackData.overall_assessment,
                scores: [
                    {criterion: 'Technical Skills', score: feedbackData.ratings.technical_skills},
                    {criterion: 'Communication Skills', score: feedbackData.ratings.communication_skills},
                    {criterion: 'Problem Solving', score: feedbackData.ratings.problem_solving},
                    {criterion: 'Cultural Fit', score: feedbackData.ratings.cultural_fit},
                    {criterion: 'Experience', score: feedbackData.ratings.experience}
                ],
                strengths: feedbackData.key_strengths.split(',').map(s => s.trim()).filter(s => s),
                weaknesses: feedbackData.areas_for_improvement.split(',').map(s => s.trim()).filter(s => s),
                recommendation: feedbackData.hiring_recommendation
            });
            sessionStorage.setItem('savedCandidates', JSON.stringify(savedCandidates));
            
            // Update counters if the function exists
            if (typeof updateFeedbackCounters === 'function') {
                updateFeedbackCounters();
            }
            
            // Reset form after 2 seconds and properly close the modal
            setTimeout(() => {
                document.getElementById('interviewerFeedbackForm').reset();
                document.getElementById('interviewerFeedbackForm').style.display = 'block';
                document.getElementById('feedbackSuccess').classList.add('d-none');
                
                // Reset rating displays
                document.querySelectorAll('.rating-slider').forEach(slider => {
                    slider.value = 3;
                    const displayId = slider.id + 'Display';
                    if (document.getElementById(displayId)) {
                        document.getElementById(displayId).textContent = '3';
                    }
                });
                
                // Properly close the modal using Bootstrap's API
                const modal = bootstrap.Modal.getInstance(document.getElementById('interviewerFeedbackModal'));
                if (modal) {
                    modal.hide();
                } else {
                    // Fallback: manually remove backdrop and allow scrolling
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) backdrop.remove();
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }
            }, 2000);
        } else {
            // Show error message
            alert('Error: ' + (data.message || 'Failed to submit feedback'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        
        // Reset button
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
        
        // Check if it's a network error
        if (error.message.includes('Failed to fetch')) {
            alert('Network error: Could not connect to the server. Please check your internet connection and try again.');
        } else {
            alert('Error: ' + error.message + '. Please try again or contact support if the issue persists.');
        }
    });
}
// Add this function to your main.js file
function testFeedbackSubmission() {
    console.log("Testing feedback submission...");
    
    const testData = {
        test_field: "This is a test submission",
        timestamp: new Date().toString()
    };
    
    fetch('/save-interviewer-feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
    })
    .then(response => {
        console.log("Test response status:", response.status);
        return response.json();
    })
    .then(data => {
        console.log("Test response data:", data);
        alert("Test successful! Check console for details.");
    })
    .catch(error => {
        console.error('Test error:', error);
        alert("Test failed: " + error.message);
    });
}

// Add a test button somewhere in your HTML
document.addEventListener('DOMContentLoaded', function() {
    // Create a test button in the footer
    const testButton = document.createElement('button');
    testButton.className = 'btn btn-sm btn-outline-secondary position-fixed';
    testButton.style.bottom = '10px';
    testButton.style.right = '10px';
    testButton.style.zIndex = '1000';
    testButton.textContent = 'Test API';
    testButton.addEventListener('click', testFeedbackSubmission);
    
    document.body.appendChild(testButton);
});
// Add this validation function to your main.js file
function validateFeedbackForm() {
    // Check if all required fields exist
    const requiredFields = [
        'candidateName',
        'positionApplied',
        'interviewDate',
        'interviewerName',
        'technicalSkills',
        'communicationSkills',
        'problemSolving',
        'culturalFit',
        'experience'
    ];
    
    const missingFields = [];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field) {
            missingFields.push(fieldId);
        }
    });
    
    if (missingFields.length > 0) {
        console.error("Missing form fields:", missingFields);
        alert("Form validation error: Some required fields are missing. Please check the console for details.");
        return false;
    }
    
    return true;
}

// Update your submit function to use validation
function submitInterviewerFeedback(e) {
    e.preventDefault();
    
    // Validate form first
    if (!validateFeedbackForm()) {
        return;
    }
    
    // Rest of your submission code...
}
function updateFeedbackCounters() {
    // Get counts from session storage
    const interviewerCount = JSON.parse(sessionStorage.getItem('interviewerFeedbacks') || '[]').length;
    const candidateCount = JSON.parse(sessionStorage.getItem('candidateSurveys') || '[]').length;
    const comparisonCount = JSON.parse(sessionStorage.getItem('comparisonReports') || '[]').length;

    // Update counters if they exist
    const interviewerEl = document.getElementById('interviewerCount');
    const candidateEl = document.getElementById('candidateCount'); 
    const comparisonEl = document.getElementById('comparisonCount');
    
    if (interviewerEl) interviewerEl.textContent = interviewerCount;
    if (candidateEl) candidateEl.textContent = candidateCount;
    if (comparisonEl) comparisonEl.textContent = comparisonCount;
}

function submitInterviewerFeedback(e) {
    e.preventDefault();
    
    // Collect form data
    const feedbackData = {
        candidate_name: document.getElementById('candidateName').value,
        position_applied: document.getElementById('positionApplied').value,
        interview_date: document.getElementById('interviewDate').value,
        interviewer_name: document.getElementById('interviewerName').value,
        ratings: {
            technical_skills: parseInt(document.getElementById('technicalSkills').value),
            communication_skills: parseInt(document.getElementById('communicationSkills').value),
            problem_solving: parseInt(document.getElementById('problemSolving').value),
            cultural_fit: parseInt(document.getElementById('culturalFit').value),
            experience: parseInt(document.getElementById('experience').value)
        },
        key_strengths: document.getElementById('keyStrengths').value,
        areas_for_improvement: document.getElementById('areasForImprovement').value,
        overall_assessment: document.getElementById('overallAssessment').value,
        hiring_recommendation: document.querySelector('input[name="hiringRecommendation"]:checked').value
    };
    
    // Send data to server
    fetch('/save-interviewer-feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            document.getElementById('interviewerFeedbackForm').style.display = 'none';
            document.getElementById('feedbackSuccess').classList.remove('d-none');
            
            // Store in session storage for comparison report
            let savedCandidates = JSON.parse(sessionStorage.getItem('savedCandidates') || '[]');
            savedCandidates.push({
                id: data.feedback_id,
                name: feedbackData.candidate_name,
                position: feedbackData.position_applied,
                feedback: feedbackData.overall_assessment,
                scores: [
                    {criterion: 'Technical Skills', score: feedbackData.ratings.technical_skills},
                    {criterion: 'Communication Skills', score: feedbackData.ratings.communication_skills},
                    {criterion: 'Problem Solving', score: feedbackData.ratings.problem_solving},
                    {criterion: 'Cultural Fit', score: feedbackData.ratings.cultural_fit},
                    {criterion: 'Experience', score: feedbackData.ratings.experience}
                ],
                strengths: feedbackData.key_strengths.split(',').map(s => s.trim()),
                weaknesses: feedbackData.areas_for_improvement.split(',').map(s => s.trim()),
                recommendation: feedbackData.hiring_recommendation
            });
            sessionStorage.setItem('savedCandidates', JSON.stringify(savedCandidates));
            
            // Reset form after 2 seconds
            setTimeout(() => {
                document.getElementById('interviewerFeedbackForm').reset();
                document.getElementById('interviewerFeedbackForm').style.display = 'block';
                document.getElementById('feedbackSuccess').classList.add('d-none');
                
                // Reset rating displays
                document.querySelectorAll('.rating-slider').forEach(slider => {
                    slider.value = 3;
                    const displayId = slider.id + 'Display';
                    document.getElementById(displayId).textContent = '3';
                });
                
                // Hide modal
                const feedbackModal = bootstrap.Modal.getInstance(document.getElementById('interviewerFeedbackModal'));
                feedbackModal.hide();
            }, 2000);
        } else {
            alert('Error: ' + (data.message || 'Failed to submit feedback'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit feedback. Please try again.');
    });
}

// Candidate Feedback Form
function setupCandidateFeedbackModal() {
    const modalHTML = `
    <div class="modal fade" id="candidateFeedbackModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Candidate Interview Experience</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="candidateFeedbackForm">
                        <div class="mb-3">
                            <label for="candidateFeedbackName" class="form-label">Your Name</label>
                            <input type="text" class="form-control" id="candidateFeedbackName" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="interviewPosition" class="form-label">Position You Interviewed For</label>
                            <input type="text" class="form-control" id="interviewPosition" required>
                        </div>
                        
                        <div class="mb-3">
                            <label for="interviewerNames" class="form-label">Interviewer Name(s)</label>
                            <input type="text" class="form-control" id="interviewerNames">
                        </div>
                        
                        <div class="mb-3">
                            <label class="form-label">How would you rate your overall interview experience?</label>
                            <div class="d-flex align-items-center">
                                <input type="range" class="form-range flex-grow-1 me-2" min="1" max="5" step="1" id="overallExperience" value="3">
                                <span class="rating-display badge bg-primary" id="overallExperienceDisplay">3</span>
                            </div>
                            <div class="d-flex justify-content-between small text-muted">
                                <span>Poor</span>
                                <span>Excellent</span>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="interviewPositives" class="form-label">What aspects of the interview process worked well?</label>
                            <textarea class="form-control" id="interviewPositives" rows="2"></textarea>
                        </div>
                        
                        <div class="mb-3">
                            <label for="interviewImprovements" class="form-label">What could we improve about our interview process?</label>
                            <textarea class="form-control" id="interviewImprovements" rows="2"></textarea>
                        </div>
                        
                        <div class="mb-3">
                            <label for="jobClarityRating" class="form-label">How clearly was the job role explained?</label>
                            <div class="d-flex align-items-center">
                                <input type="range" class="form-range flex-grow-1 me-2" min="1" max="5" step="1" id="jobClarityRating" value="3">
                                <span class="rating-display badge bg-primary" id="jobClarityRatingDisplay">3</span>
                            </div>
                            <div class="d-flex justify-content-between small text-muted">
                                <span>Not Clear</span>
                                <span>Very Clear</span>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="interviewFairness" class="form-label">Did you feel the questions were relevant and fair?</label>
                            <div class="d-flex align-items-center">
                                <input type="range" class="form-range flex-grow-1 me-2" min="1" max="5" step="1" id="interviewFairness" value="3">
                                <span class="rating-display badge bg-primary" id="interviewFairnessDisplay">3</span>
                            </div>
                            <div class="d-flex justify-content-between small text-muted">
                                <span>Not Fair</span>
                                <span>Very Fair</span>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="additionalFeedback" class="form-label">Any additional feedback?</label>
                            <textarea class="form-control" id="additionalFeedback" rows="3"></textarea>
                        </div>
                        
                        <button type="submit" class="btn btn-primary">Submit Feedback</button>
                    </form>
                    
                    <div id="candidateFeedbackSuccess" class="alert alert-success mt-3 d-none">
                        <i class="bi bi-check-circle-fill me-2"></i>
                        Thank you for your feedback! We appreciate your input to help improve our interview process.
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Append modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Setup event listeners for rating sliders
    document.querySelectorAll('#candidateFeedbackModal .form-range').forEach(slider => {
        const displayId = slider.id + 'Display';
        slider.addEventListener('input', function() {
            document.getElementById(displayId).textContent = this.value;
        });
    });
    
    // Setup form submission
    document.getElementById('candidateFeedbackForm').addEventListener('submit', submitCandidateFeedback);
}

function submitCandidateFeedback(e) {
    e.preventDefault();
    
    // Collect form data
    const feedbackData = {
        candidate_name: document.getElementById('candidateFeedbackName').value,
        position: document.getElementById('interviewPosition').value,
        interviewers: document.getElementById('interviewerNames').value,
        ratings: {
            overall_experience: parseInt(document.getElementById('overallExperience').value),
            job_clarity: parseInt(document.getElementById('jobClarityRating').value),
            interview_fairness: parseInt(document.getElementById('interviewFairness').value)
        },
        positives: document.getElementById('interviewPositives').value,
        improvements: document.getElementById('interviewImprovements').value,
        additional_feedback: document.getElementById('additionalFeedback').value
    };
    
    // Send data to server
    fetch('/save-candidate-feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            document.getElementById('candidateFeedbackForm').style.display = 'none';
            document.getElementById('candidateFeedbackSuccess').classList.remove('d-none');
            
            // Reset form after 2 seconds
            setTimeout(() => {
                document.getElementById('candidateFeedbackForm').reset();
                document.getElementById('candidateFeedbackForm').style.display = 'block';
                document.getElementById('candidateFeedbackSuccess').classList.add('d-none');
                
                // Reset rating displays
                document.querySelectorAll('#candidateFeedbackModal .form-range').forEach(slider => {
                    slider.value = 3;
                    const displayId = slider.id + 'Display';
                    document.getElementById(displayId).textContent = '3';
                });
                
                // Hide modal
                const feedbackModal = bootstrap.Modal.getInstance(document.getElementById('candidateFeedbackModal'));
                feedbackModal.hide();
            }, 2000);
        } else {
            alert('Error: ' + (data.message || 'Failed to submit feedback'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit feedback. Please try again.');
    });
}

// Candidate Comparison Report
function setupComparisonReportModal() {
    const modalHTML = `
    <div class="modal fade" id="comparisonReportModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Candidate Comparison Report</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div id="compareSetup">
                        <div class="alert alert-info mb-3">
                            <i class="bi bi-info-circle-fill me-2"></i>
                            Select candidates to compare from your feedback history.
                        </div>
                        
                        <div id="noCandidatesWarning" class="alert alert-warning d-none">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            No candidate feedback found. Please submit feedback for at least two candidates to generate a comparison report.
                        </div>
                        
                        <div id="candidateCheckboxes" class="mb-3"></div>
                        
                        <div class="mb-3">
                            <label class="form-label">Comparison Metrics</label>
                            <div class="d-flex flex-wrap" id="metricsContainer">
                                <div class="form-check me-3 mb-2">
                                    <input class="form-check-input" type="checkbox" value="Technical Skills" id="metricTechnical" checked>
                                    <label class="form-check-label" for="metricTechnical">
                                        Technical Skills
                                    </label>
                                </div>
                                <div class="form-check me-3 mb-2">
                                    <input class="form-check-input" type="checkbox" value="Communication" id="metricCommunication" checked>
                                    <label class="form-check-label" for="metricCommunication">
                                        Communication
                                    </label>
                                </div>
                                <div class="form-check me-3 mb-2">
                                    <input class="form-check-input" type="checkbox" value="Problem Solving" id="metricProblemSolving" checked>
                                    <label class="form-check-label" for="metricProblemSolving">
                                        Problem Solving
                                    </label>
                                </div>
                                <div class="form-check me-3 mb-2">
                                    <input class="form-check-input" type="checkbox" value="Cultural Fit" id="metricCulturalFit" checked>
                                    <label class="form-check-label" for="metricCulturalFit">
                                        Cultural Fit
                                    </label>
                                </div>
                                <div class="form-check me-3 mb-2">
                                    <input class="form-check-input" type="checkbox" value="Experience" id="metricExperience" checked>
                                    <label class="form-check-label" for="metricExperience">
                                        Experience
                                    </label>
                                </div>
                                <div class="form-check me-3 mb-2">
                                    <input class="form-check-input" type="checkbox" value="Leadership" id="metricLeadership" checked>
                                    <label class="form-check-label" for="metricLeadership">
                                        Leadership
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <button class="btn btn-primary" id="generateComparisonBtn">Generate Comparison Report</button>
                    </div>
                    
                    <div id="comparisonLoading" class="text-center my-4 d-none">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="mt-2">Generating comparison report...</p>
                    </div>
                    
                    <div id="comparisonResults" class="mt-4 d-none">
                        <div class="mb-4">
                            <h6 class="border-bottom pb-2 mb-3">Metrics Comparison</h6>
                            <div id="metricsComparisonContainer"></div>
                        </div>
                        
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <h6 class="border-bottom pb-2 mb-3">Key Differentiators</h6>
                                <div id="differentiatorsList"></div>
                            </div>
                            
                            <div class="col-md-6">
                                <h6 class="border-bottom pb-2 mb-3">Recommendations</h6>
                                <div id="recommendationsList"></div>
                            </div>
                        </div>
                        
                        <div class="card mb-3">
                            <div class="card-header bg-light">
                                <strong>Overall Summary</strong>
                            </div>
                            <div class="card-body">
                                <p id="comparisonSummary"></p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" id="printComparisonBtn" disabled>Print Report</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // Append modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Setup event listeners
    document.getElementById('generateComparisonBtn').addEventListener('click', generateComparisonReport);
    document.getElementById('printComparisonBtn').addEventListener('click', function() {
        window.print();
    });
    
    // Initialize candidate checkboxes when modal is opened
    document.getElementById('comparisonReportModal').addEventListener('show.bs.modal', initializeCandidateCheckboxes);
}

function initializeCandidateCheckboxes() {
    const candidateCheckboxes = document.getElementById('candidateCheckboxes');
    const noCandidatesWarning = document.getElementById('noCandidatesWarning');
    const generateBtn = document.getElementById('generateComparisonBtn');
    
    // Get saved candidates from session storage
    const savedCandidates = JSON.parse(sessionStorage.getItem('savedCandidates') || '[]');
    
    // Clear previous checkboxes
    candidateCheckboxes.innerHTML = '';
    
    if (savedCandidates.length < 2) {
        noCandidatesWarning.classList.remove('d-none');
        generateBtn.disabled = true;
        return;
    }
    
    noCandidatesWarning.classList.add('d-none');
    generateBtn.disabled = false;
    
    // Create checkboxes for each candidate
    savedCandidates.forEach((candidate, index) => {
        const checkboxDiv = document.createElement('div');
        checkboxDiv.className = 'form-check mb-2';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'form-check-input';
        checkbox.id = `candidate_${index}`;
        checkbox.value = index;
        checkbox.checked = index < 2;  // Check first two by default
        
        const label = document.createElement('label');
        label.className = 'form-check-label';
        label.htmlFor = `candidate_${index}`;
        label.textContent = `${candidate.name} (${candidate.position})`;
        
        checkboxDiv.appendChild(checkbox);
        checkboxDiv.appendChild(label);
        candidateCheckboxes.appendChild(checkboxDiv);
    });
}

function generateComparisonReport() {
    // Get selected candidates
    const selectedIndices = [];
    document.querySelectorAll('#candidateCheckboxes input[type="checkbox"]:checked').forEach(cb => {
        selectedIndices.push(parseInt(cb.value));
    });
    
    if (selectedIndices.length < 2) {
        alert('Please select at least two candidates to compare');
        return;
    }
    
    // Get saved candidates from session storage
    const savedCandidates = JSON.parse(sessionStorage.getItem('savedCandidates') || '[]');
    const selectedCandidates = selectedIndices.map(index => savedCandidates[index]);
    
    // Get selected metrics
    const metrics = [];
    document.querySelectorAll('#metricsContainer input[type="checkbox"]:checked').forEach(cb => {
        metrics.push(cb.value);
    });
    
    if (metrics.length === 0) {
        alert('Please select at least one metric for comparison');
        return;
    }
    
    // Show loading, hide setup and results
    document.getElementById('compareSetup').style.display = 'none';
    document.getElementById('comparisonLoading').classList.remove('d-none');
    document.getElementById('comparisonResults').classList.add('d-none');
    
    // Call API
    fetch('/generate-comparison-report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            candidates: selectedCandidates,
            metrics: metrics
        })
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading
        document.getElementById('comparisonLoading').classList.add('d-none');
        
        // Display results
        displayComparisonReport(data, selectedCandidates);
        
        // Enable print button
        document.getElementById('printComparisonBtn').disabled = false;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('comparisonLoading').classList.add('d-none');
        document.getElementById('compareSetup').style.display = 'block';
        alert('Failed to generate comparison report. Please try again.');
    });
}

function displayComparisonReport(data, candidates) {
    const metricsComparisonContainer = document.getElementById('metricsComparisonContainer');
    const differentiatorsList = document.getElementById('differentiatorsList');
    const recommendationsList = document.getElementById('recommendationsList');
    const comparisonSummary = document.getElementById('comparisonSummary');
    
    // Clear previous results
    metricsComparisonContainer.innerHTML = '';
    differentiatorsList.innerHTML = '';
    recommendationsList.innerHTML = '';
    
    // 1. Display metrics comparison
    if (data.metrics_comparison && data.metrics_comparison.length > 0) {
        data.metrics_comparison.forEach(metric => {
            const metricCard = document.createElement('div');
            metricCard.className = 'card mb-3';
            
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header';
            cardHeader.innerHTML = `<strong>${metric.metric}</strong>`;
            
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body p-2';
            
            // Create table for rankings
            const table = document.createElement('table');
            table.className = 'table table-sm table-bordered mb-0';
            
            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">Candidate</th>
                    <th scope="col">Score</th>
                    <th scope="col">Notes</th>
                </tr>
            `;
            
            const tbody = document.createElement('tbody');
            
            if (metric.rankings && metric.rankings.length > 0) {
                metric.rankings.forEach(ranking => {
                    const tr = document.createElement('tr');
                    
                    // Add class based on rank
                    if (ranking.rank === 1) {
                        tr.className = 'table-success';
                    } else if (ranking.rank === 2) {
                        tr.className = 'table-info';
                    }
                    
                    tr.innerHTML = `
                        <td>${ranking.rank}</td>
                        <td>${ranking.candidate}</td>
                        <td>${ranking.score || 'N/A'}</td>
                        <td>${ranking.notes || ''}</td>
                    `;
                    
                    tbody.appendChild(tr);
                });
            }
            
            table.appendChild(thead);
            table.appendChild(tbody);
            cardBody.appendChild(table);
            
            metricCard.appendChild(cardHeader);
            metricCard.appendChild(cardBody);
            metricsComparisonContainer.appendChild(metricCard);
        });
    }
    
    // 2. Display key differentiators
    if (data.key_differentiators && data.key_differentiators.length > 0) {
        data.key_differentiators.forEach(diff => {
            const diffCard = document.createElement('div');
            diffCard.className = 'card mb-2';
            
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header py-2';
            cardHeader.innerHTML = `<strong>${diff.candidate}</strong>`;
            
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body py-2';
            
            if (diff.differentiators && diff.differentiators.length > 0) {
                const ul = document.createElement('ul');
                ul.className = 'mb-0 ps-3';
                
                diff.differentiators.forEach(point => {
                    const li = document.createElement('li');
                    li.textContent = point;
                    ul.appendChild(li);
                });
                
                cardBody.appendChild(ul);
            }
            
            diffCard.appendChild(cardHeader);
            diffCard.appendChild(cardBody);
            differentiatorsList.appendChild(diffCard);
        });
    }
    
    // 3. Display recommendations
    if (data.recommendations && data.recommendations.length > 0) {
        data.recommendations.forEach(rec => {
            const recDiv = document.createElement('div');
            recDiv.className = 'mb-3';
            
            // Add badge for rank
            let badgeClass = 'bg-secondary';
            if (rec.rank === 1) badgeClass = 'bg-success';
            else if (rec.rank === 2) badgeClass = 'bg-primary';
            else if (rec.rank === 3) badgeClass = 'bg-info';
            
            recDiv.innerHTML = `
                <div class="d-flex align-items-center mb-1">
                    <span class="badge ${badgeClass} me-2">#${rec.rank}</span>
                    <strong>${rec.candidate}</strong>
                </div>
                <p class="small ms-4 mb-0">${rec.rationale}</p>
            `;
            
            recommendationsList.appendChild(recDiv);
        });
    }
    
    // 4. Display overall summary
    if (data.summary) {
        comparisonSummary.textContent = data.summary;
    }
    
    // Show results
    document.getElementById('comparisonResults').classList.remove('d-none');
}

// Update the interviewer assistant navbar to add feedback options
function addFeedbackToNavbar() {
    const navbar = document.querySelector('.interviewer-assistant-navbar div');
    
    if (navbar) {
        // Add feedback buttons
        const feedbackButtons = document.createElement('div');
        feedbackButtons.className = 'ms-3';
        feedbackButtons.innerHTML = `
            <button class="btn btn-outline-success mx-1" data-bs-toggle="modal" data-bs-target="#interviewerFeedbackModal">
                <i class="bi bi-clipboard-check"></i> Submit Feedback
            </button>
            <button class="btn btn-outline-info mx-1" data-bs-toggle="modal" data-bs-target="#candidateFeedbackModal">
                <i class="bi bi-person-lines-fill"></i> Candidate Survey
            </button>
            <button class="btn btn-outline-secondary mx-1" data-bs-toggle="modal" data-bs-target="#comparisonReportModal">
                <i class="bi bi-bar-chart-line"></i> Compare Candidates
            </button>
        `;
        
        navbar.appendChild(feedbackButtons);
    }
}
// Handle navigation bar active state changes
function setupNavigation() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    // Set active nav item based on scroll position
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href').substring(1);
            
            if (href === current) {
                link.classList.add('active');
            }
        });
    });
    
    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });
}
// Setup Interviewer Feedback Form
function setupInterviewerFeedback() {
    console.log('Setting up interviewer feedback form');
    
    // Check if form exists
    const feedbackForm = document.getElementById('interviewerFeedbackForm');
    console.log('Feedback form found:', !!feedbackForm);
    
    // Check if all required elements exist
    const requiredElements = [
        'candidateName', 
        'positionApplied', 
        'interviewDate', 
        'interviewerName',
        'technicalSkills',
        'communicationSkills',
        'problemSolving',
        'culturalFit',
        'experience',
        'keyStrengths',
        'areasForImprovement',
        'overallAssessment',
        'submitFeedbackBtn'
    ];
    
    console.log('Checking required elements:');
    requiredElements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`- ${id}: ${!!element}`);
    });
    
    // Check radio buttons
    const recommendMaybe = document.getElementById('recommendMaybe');
    console.log('Default radio button found:', !!recommendMaybe);
    
    // Setup event listeners for rating sliders
    document.querySelectorAll('.rating-slider').forEach(slider => {
        console.log('Setting up slider:', slider.id);
        const displayId = slider.id + 'Display';
        slider.addEventListener('input', function() {
            const display = document.getElementById(displayId);
            if (display) {
                display.textContent = this.value;
            } else {
                console.warn(`Display element ${displayId} not found`);
            }
        });
    });
    
    // Setup form submission
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
        console.log('Form submission handler attached');
    } else {
        console.error('Feedback form not found! Cannot attach submit handler');
    }
    
    // Initialize date field with today's date
    const dateField = document.getElementById('interviewDate');
    if (dateField) {
        const today = new Date().toISOString().split('T')[0];
        dateField.value = today;
        console.log('Date field initialized with today\'s date');
    } else {
        console.warn('Date field not found');
    }
    
    // Set job role if available
    const jobRoleInput = document.getElementById('job_role');
    const positionField = document.getElementById('positionApplied');
    if (jobRoleInput && positionField && jobRoleInput.value) {
        positionField.value = jobRoleInput.value;
        console.log('Position field initialized with job role:', jobRoleInput.value);
    } else {
        console.log('Could not initialize position field with job role');
    }
}

// Handle feedback form submission
function handleFeedbackSubmit(e) {
    e.preventDefault();
    console.log('Feedback form submitted');
    
    // Get the submit button
    const submitBtn = document.getElementById('submitFeedbackBtn');
    if (submitBtn) {
        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
    }
    
    // Helper function to safely get element value
    function getElementValue(id, defaultValue = '') {
        const element = document.getElementById(id);
        return element ? element.value : defaultValue;
    }
    
    // Helper function to safely get element input value as integer
    function getElementValueAsInt(id, defaultValue = 3) {
        const element = document.getElementById(id);
        return element ? parseInt(element.value) : defaultValue;
    }
    
    // Helper function to safely get radio value
    function getRadioValue(name, defaultValue = 'Maybe') {
        const selectedRadio = document.querySelector(`input[name="${name}"]:checked`);
        return selectedRadio ? selectedRadio.value : defaultValue;
    }
    
    // Collect form data with error handling
    const feedbackData = {
        candidate_name: getElementValue('candidateName'),
        position_applied: getElementValue('positionApplied'),
        interview_date: getElementValue('interviewDate'),
        interviewer_name: getElementValue('interviewerName'),
        ratings: {
            technical_skills: getElementValueAsInt('technicalSkills'),
            communication_skills: getElementValueAsInt('communicationSkills'),
            problem_solving: getElementValueAsInt('problemSolving'),
            cultural_fit: getElementValueAsInt('culturalFit'),
            experience: getElementValueAsInt('experience')
        },
        key_strengths: getElementValue('keyStrengths'),
        areas_for_improvement: getElementValue('areasForImprovement'),
        overall_assessment: getElementValue('overallAssessment'),
        hiring_recommendation: getRadioValue('hiringRecommendation')
    };
    
    console.log('Feedback data:', feedbackData);
    
    // Check if we have at least the basic data
    if (!feedbackData.candidate_name || !feedbackData.position_applied) {
        alert('Please fill in at least the candidate name and position.');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Submit Feedback';
        }
        return;
    }
    
    // Mock successful submission (for demo purposes)
    // In a real app, you would send this to your server
    setTimeout(() => {
        // Get references to elements we need
        const formElement = document.getElementById('interviewerFeedbackForm');
        const successElement = document.getElementById('feedbackSuccess');
        
        // Show success message if elements exist
        if (formElement) formElement.style.display = 'none';
        if (successElement) successElement.classList.remove('d-none');
        
        // Store in session storage for demo purposes
        let savedCandidates = JSON.parse(sessionStorage.getItem('savedCandidates') || '[]');
        savedCandidates.push({
            id: 'feedback_' + Date.now(),
            name: feedbackData.candidate_name,
            position: feedbackData.position_applied,
            feedback: feedbackData.overall_assessment,
            scores: [
                {criterion: 'Technical Skills', score: feedbackData.ratings.technical_skills},
                {criterion: 'Communication Skills', score: feedbackData.ratings.communication_skills},
                {criterion: 'Problem Solving', score: feedbackData.ratings.problem_solving},
                {criterion: 'Cultural Fit', score: feedbackData.ratings.cultural_fit},
                {criterion: 'Experience', score: feedbackData.ratings.experience}
            ],
            strengths: feedbackData.key_strengths.split(',').filter(s => s.trim()),
            weaknesses: feedbackData.areas_for_improvement.split(',').filter(s => s.trim()),
            recommendation: feedbackData.hiring_recommendation
        });
        sessionStorage.setItem('savedCandidates', JSON.stringify(savedCandidates));
        
        // If we have an updateFeedbackCounters function, call it
        if (typeof updateFeedbackCounters === 'function') {
            try {
                updateFeedbackCounters();
            } catch (error) {
                console.error('Error updating feedback counters:', error);
            }
        }
        
        // Reset form after 2 seconds
        setTimeout(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Submit Feedback';
            }
            
            if (formElement) {
                formElement.reset();
                formElement.style.display = 'block';
            }
            
            if (successElement) {
                successElement.classList.add('d-none');
            }
            
            // Reset date to today
            const dateField = document.getElementById('interviewDate');
            if (dateField) {
                const today = new Date().toISOString().split('T')[0];
                dateField.value = today;
            }
            
            // Reset rating displays
            document.querySelectorAll('.rating-slider').forEach(slider => {
                slider.value = 3;
                const displayId = slider.id + 'Display';
                const display = document.getElementById(displayId);
                if (display) {
                    display.textContent = '3';
                }
            });
            
            // Close the modal
            const modal = document.getElementById('interviewerFeedbackModal');
            if (modal && typeof bootstrap !== 'undefined') {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                } else {
                    // Manual cleanup
                    document.body.classList.remove('modal-open');
                    const backdrop = document.querySelector('.modal-backdrop');
                    if (backdrop) backdrop.remove();
                }
            }
        }, 2000);
    }, 1500); // Simulate network delay
}
   

// Call this function when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // The previously added initialization code
    
    // Setup navigation
    setupNavigation();
});
// Initialize all feedback components
document.addEventListener('DOMContentLoaded', function() {
    // The previous code for setting up other components should remain
    
    // Setup feedback components
    setupInterviewerFeedback();
    setupCandidateFeedbackModal();
    setupComparisonReportModal();
    
    // Update navbar to include feedback options
    addFeedbackToNavbar();
});
// Update feedback counters
function updateFeedbackCounters() {
    // Get counts from session storage
    let savedCandidates = JSON.parse(sessionStorage.getItem('savedCandidates') || '[]');
    let candidateSurveys = JSON.parse(sessionStorage.getItem('candidateSurveys') || '[]');
    let comparisonReports = JSON.parse(sessionStorage.getItem('comparisonReports') || '[]');
    
    // Update the counters
    document.getElementById('interviewerFeedbackCount').textContent = savedCandidates.length;
    document.getElementById('candidateFeedbackCount').textContent = candidateSurveys.length;
    document.getElementById('comparisonReportCount').textContent = comparisonReports.length;
}

// Submit Interviewer Feedback
function submitInterviewerFeedback(e) {
    e.preventDefault();
    
    // Collect form data
    const feedbackData = {
        candidate_name: document.getElementById('candidateName').value,
        position_applied: document.getElementById('positionApplied').value,
        interview_date: document.getElementById('interviewDate').value,
        interviewer_name: document.getElementById('interviewerName').value,
        ratings: {
            technical_skills: parseInt(document.getElementById('technicalSkills').value),
            communication_skills: parseInt(document.getElementById('communicationSkills').value),
            problem_solving: parseInt(document.getElementById('problemSolving').value),
            cultural_fit: parseInt(document.getElementById('culturalFit').value),
            experience: parseInt(document.getElementById('experience').value)
        },
        key_strengths: document.getElementById('keyStrengths').value,
        areas_for_improvement: document.getElementById('areasForImprovement').value,
        overall_assessment: document.getElementById('overallAssessment').value,
        hiring_recommendation: document.querySelector('input[name="hiringRecommendation"]:checked').value
    };
    
    // Send data to server
    fetch('/save-interviewer-feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            document.getElementById('interviewerFeedbackForm').style.display = 'none';
            document.getElementById('feedbackSuccess').classList.remove('d-none');
            
            // Store in session storage for comparison report
            let savedCandidates = JSON.parse(sessionStorage.getItem('savedCandidates') || '[]');
            savedCandidates.push({
                id: data.feedback_id,
                name: feedbackData.candidate_name,
                position: feedbackData.position_applied,
                feedback: feedbackData.overall_assessment,
                scores: [
                    {criterion: 'Technical Skills', score: feedbackData.ratings.technical_skills},
                    {criterion: 'Communication Skills', score: feedbackData.ratings.communication_skills},
                    {criterion: 'Problem Solving', score: feedbackData.ratings.problem_solving},
                    {criterion: 'Cultural Fit', score: feedbackData.ratings.cultural_fit},
                    {criterion: 'Experience', score: feedbackData.ratings.experience}
                ],
                strengths: feedbackData.key_strengths.split(',').map(s => s.trim()),
                weaknesses: feedbackData.areas_for_improvement.split(',').map(s => s.trim()),
                recommendation: feedbackData.hiring_recommendation
            });
            sessionStorage.setItem('savedCandidates', JSON.stringify(savedCandidates));
            
            // Update counters
            if (typeof updateFeedbackCounters === 'function') {
                updateFeedbackCounters();
            }
            
            // Reset form after 2 seconds and properly close the modal
            setTimeout(() => {
                document.getElementById('interviewerFeedbackForm').reset();
                document.getElementById('interviewerFeedbackForm').style.display = 'block';
                document.getElementById('feedbackSuccess').classList.add('d-none');
                
                // Reset rating displays
                document.querySelectorAll('.rating-slider').forEach(slider => {
                    slider.value = 3;
                    const displayId = slider.id + 'Display';
                    if (document.getElementById(displayId)) {
                        document.getElementById(displayId).textContent = '3';
                    }
                });
                
                // Properly close the modal using Bootstrap's API
                const modal = bootstrap.Modal.getInstance(document.getElementById('interviewerFeedbackModal'));
                if (modal) {
                    modal.hide();
                } else {
                    // Fallback: manually remove backdrop and allow scrolling
                    document.querySelector('.modal-backdrop').remove();
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }
            }, 2000);
        } else {
            alert('Error: ' + (data.message || 'Failed to submit feedback'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit feedback. Please try again.');
    });
}

function submitCandidateFeedback(e) {
    e.preventDefault();
    
    // Collect form data
    const feedbackData = {
        candidate_name: document.getElementById('candidateFeedbackName').value,
        position: document.getElementById('interviewPosition').value,
        interviewers: document.getElementById('interviewerNames').value,
        ratings: {
            overall_experience: parseInt(document.getElementById('overallExperience').value),
            job_clarity: parseInt(document.getElementById('jobClarityRating').value),
            interview_fairness: parseInt(document.getElementById('interviewFairness').value)
        },
        positives: document.getElementById('interviewPositives').value,
        improvements: document.getElementById('interviewImprovements').value,
        additional_feedback: document.getElementById('additionalFeedback').value
    };
    
    // Send data to server
    fetch('/save-candidate-feedback', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            document.getElementById('candidateFeedbackForm').style.display = 'none';
            document.getElementById('candidateFeedbackSuccess').classList.remove('d-none');
            
            // Store in session storage for tracking
            let candidateSurveys = JSON.parse(sessionStorage.getItem('candidateSurveys') || '[]');
            candidateSurveys.push({
                id: data.feedback_id,
                name: feedbackData.candidate_name,
                position: feedbackData.position,
                overall_rating: feedbackData.ratings.overall_experience
            });
            sessionStorage.setItem('candidateSurveys', JSON.stringify(candidateSurveys));
            
            // Update counters
            if (typeof updateFeedbackCounters === 'function') {
                updateFeedbackCounters();
            }
            
            // Reset form after 2 seconds and properly close the modal
            setTimeout(() => {
                document.getElementById('candidateFeedbackForm').reset();
                document.getElementById('candidateFeedbackForm').style.display = 'block';
                document.getElementById('candidateFeedbackSuccess').classList.add('d-none');
                
                // Reset rating displays
                document.querySelectorAll('#candidateFeedbackModal .form-range').forEach(slider => {
                    slider.value = 3;
                    const displayId = slider.id + 'Display';
                    if (document.getElementById(displayId)) {
                        document.getElementById(displayId).textContent = '3';
                    }
                });
                
                // Properly close the modal using Bootstrap's API
                const modal = bootstrap.Modal.getInstance(document.getElementById('candidateFeedbackModal'));
                if (modal) {
                    modal.hide();
                } else {
                    // Fallback: manually remove backdrop and allow scrolling
                    document.querySelector('.modal-backdrop').remove();
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }
            }, 2000);
        } else {
            alert('Error: ' + (data.message || 'Failed to submit feedback'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit feedback. Please try again.');
    });
}
// Utility function to fix modals that don't close properly
function fixStuckModals() {
    // Remove any lingering modal backdrops
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.remove();
    });
    
    // Reset body classes and styles
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

// Listen for the escape key to manually fix stuck modals
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        setTimeout(fixStuckModals, 300); // Small delay to let Bootstrap's own handlers run first
    }
});

// Also provide a button that can fix stuck modals
document.addEventListener('DOMContentLoaded', function() {
    // Create and append a hidden "emergency" fix button that appears if a modal gets stuck
    const fixButton = document.createElement('button');
    fixButton.id = 'fixModalButton';
    fixButton.className = 'btn btn-warning position-fixed';
    fixButton.style.bottom = '10px';
    fixButton.style.left = '10px';
    fixButton.style.zIndex = '9999';
    fixButton.style.display = 'none';
    fixButton.innerHTML = '<i class="bi bi-tools"></i> Fix Page';
    fixButton.addEventListener('click', fixStuckModals);
    
    document.body.appendChild(fixButton);
    
    // Show the fix button if a modal backdrop exists without a visible modal
    setInterval(() => {
        const hasBackdrop = document.querySelector('.modal-backdrop');
        const hasVisibleModal = document.querySelector('.modal.show');
        
        if (hasBackdrop && !hasVisibleModal) {
            document.getElementById('fixModalButton').style.display = 'block';
        } else {
            document.getElementById('fixModalButton').style.display = 'none';
        }
    }, 2000);
});

// Generate Comparison Report
function generateComparisonReport(selectedCandidates) {
    fetch('/generate_comparison_report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidates: selectedCandidates })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            let comparisonReports = JSON.parse(sessionStorage.getItem('comparisonReports') || '[]');
            comparisonReports.push({
                id: Date.now(),
                candidates: selectedCandidates.map(c => c.name),
                date: new Date().toLocaleDateString()
            });
            sessionStorage.setItem('comparisonReports', JSON.stringify(comparisonReports));

            updateFeedbackCounters();
        }
    });
}

// Update Counters
function updateFeedbackCounters() {
    // Get counts from session storage
    const savedCandidates = JSON.parse(sessionStorage.getItem('savedCandidates') || '[]').length;
    const candidateSurveys = JSON.parse(sessionStorage.getItem('candidateSurveys') || '[]').length;
    const comparisonReports = JSON.parse(sessionStorage.getItem('comparisonReports') || '[]').length;

    // Update counters if they exist
    const interviewerEl = document.getElementById('interviewerCount');
    const candidateEl = document.getElementById('candidateCount'); 
    const comparisonEl = document.getElementById('comparisonCount');
    
    if (interviewerEl) interviewerEl.textContent = savedCandidates;
    if (candidateEl) candidateEl.textContent = candidateSurveys;
    if (comparisonEl) comparisonEl.textContent = comparisonReports;
}
// Setup modal buttons
function setupModalButtons() {
    document.querySelectorAll('[data-bs-toggle="modal"]').forEach(button => {
        button.addEventListener('click', function () {
            const targetModalId = this.getAttribute('data-bs-target');
            const targetModal = new bootstrap.Modal(document.querySelector(targetModalId));
            targetModal.show();
        });
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function () {
    setupModalButtons();
    updateFeedbackCounters();
});
