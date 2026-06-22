// Student Dashboard Logic
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication and session
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const sessionId = localStorage.getItem('sessionId');
    
    if (!currentUser || currentUser.role !== 'student') {
        window.location.href = 'student-login.html';
        return;
    }

    // Validate session
    if (sessionId) {
        const session = await db.getSession(sessionId);
        if (!session || session.userId !== currentUser.username) {
            // Invalid session, redirect to login
            localStorage.removeItem('currentUser');
            localStorage.removeItem('sessionId');
            window.location.href = 'student-login.html';
            return;
        }
        // Update session activity
        await db.updateSessionActivity(sessionId);
    } else {
        // No session, redirect to login
        localStorage.removeItem('currentUser');
        window.location.href = 'student-login.html';
        return;
    }

    // Update user info
    document.getElementById('student-name').textContent = currentUser.username;

    // Logout handler
    document.getElementById('student-logout').addEventListener('click', async () => {
        await db.deleteSession(sessionId);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionId');
        window.location.href = 'index.html';
    });

    // Load available exams
    async function loadAvailableExams() {
        try {
            const exams = await db.getAllExams();
            const activeExams = exams.filter(exam => exam.status === 'active');
            const examsList = document.getElementById('student-exams-list');

            if (activeExams.length === 0) {
                examsList.innerHTML = '<div class="no-exams"><p>No available exams at the moment</p></div>';
                return;
            }

            examsList.innerHTML = '';
            for (const [index, exam] of activeExams.entries()) {
                const hasTaken = await db.hasStudentTakenExam(currentUser.username, exam.id);
                
                const examCard = document.createElement('div');
                examCard.className = 'exam-card';
                examCard.style.animation = `slideInUp 0.5s ease ${index * 0.1}s forwards`;
                examCard.style.opacity = '0';
                
                examCard.innerHTML = `
                    <h4>${exam.name}</h4>
                    <p>Subject: ${exam.subject} | Duration: ${exam.duration} minutes | Questions: ${exam.questions.length}</p>
                    <div class="exam-actions">
                        ${hasTaken 
                            ? '<button class="start-exam-btn" disabled>Exam Already Submitted</button>'
                            : `<button class="start-exam-btn" onclick="startExam(${exam.id})">Start Exam</button>`
                        }
                    </div>
                `;
                
                examsList.appendChild(examCard);
            }
        } catch (error) {
            console.error('Error loading exams:', error);
        }
    }

    // Load recent results
    async function loadRecentResults() {
        try {
            const results = await db.getExamResultsByStudent(currentUser.username);
            const resultsList = document.getElementById('student-results-list');

            if (results.length === 0) {
                resultsList.innerHTML = '<div class="no-results"><p>No results yet</p></div>';
                return;
            }

            resultsList.innerHTML = '';
            const recentResults = results.slice(-5).reverse();
            for (const [index, result] of recentResults.entries()) {
                const exam = await db.getExam(result.examId);
                const passed = result.score >= 50;
                
                const resultCard = document.createElement('div');
                resultCard.className = 'result-card';
                resultCard.style.animation = `slideInUp 0.5s ease ${index * 0.1}s forwards`;
                resultCard.style.opacity = '0';
                
                resultCard.innerHTML = `
                    <h4>${exam ? exam.name : 'Unknown Exam'}</h4>
                    <div class="score">${result.score}%</div>
                    <span class="status ${passed ? 'pass' : 'fail'}">${passed ? 'Passed' : 'Failed'}</span>
                `;
                
                resultsList.appendChild(resultCard);
            }
        } catch (error) {
            console.error('Error loading results:', error);
        }
    }

    // Start exam function (global scope)
    window.startExam = function(examId) {
        localStorage.setItem('currentExamId', examId);
        window.location.href = 'exam.html';
    };

    // Initialize dashboard
    loadAvailableExams();
    loadRecentResults();
});
