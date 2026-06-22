// Exam Taking Logic
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'student') {
        window.location.href = 'student-login.html';
        return;
    }

    // Get exam ID from localStorage
    const examId = parseInt(localStorage.getItem('currentExamId'));
    if (!examId) {
        window.location.href = 'student-dashboard.html';
        return;
    }

    // Check if student has already taken this exam
    const hasTaken = await db.hasStudentTakenExam(currentUser.username, examId);
    if (hasTaken) {
        alert('You have already taken this exam');
        window.location.href = 'student-dashboard.html';
        return;
    }

    // Load exam data
    let exam;
    let currentQuestionIndex = 0;
    let answers = {};
    let timerInterval;
    let timeRemaining;

    try {
        exam = await db.getExam(examId);
        if (!exam) {
            alert('Exam not found');
            window.location.href = 'student-dashboard.html';
            return;
        }

        // Initialize exam UI
        initializeExam();
    } catch (error) {
        console.error('Error loading exam:', error);
        alert('Error loading exam');
        window.location.href = 'student-dashboard.html';
    }

    function initializeExam() {
        // Set exam info
        document.getElementById('current-exam-title').textContent = exam.name;
        document.getElementById('current-exam-subject').textContent = exam.subject;

        // Initialize timer
        timeRemaining = exam.duration * 60; // Convert to seconds
        updateTimerDisplay();
        startTimer();

        // Build question palette
        buildQuestionPalette();

        // Load first question
        loadQuestion(0);

        // Setup navigation
        setupNavigation();
    }

    function loadQuestion(index) {
        currentQuestionIndex = index;
        const question = exam.questions[index];

        // Update question info
        document.getElementById('current-question-number').textContent = `Question ${index + 1}`;
        document.getElementById('question-progress').textContent = `${index + 1}/${exam.questions.length}`;
        document.getElementById('question-text').textContent = question.question;

        // Build options
        const optionsContainer = document.getElementById('options-container');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, optionIndex) => {
            const optionItem = document.createElement('div');
            optionItem.className = 'option-item';
            if (answers[index] === optionIndex) {
                optionItem.classList.add('selected');
            }

            optionItem.innerHTML = `
                <input type="radio" name="answer" value="${optionIndex}" ${answers[index] === optionIndex ? 'checked' : ''}>
                <span class="option-label">${option}</span>
            `;

            optionItem.addEventListener('click', () => selectAnswer(index, optionIndex));
            optionsContainer.appendChild(optionItem);
        });

        // Update palette
        updateQuestionPalette();
    }

    function selectAnswer(questionIndex, answerIndex) {
        answers[questionIndex] = answerIndex;
        
        // Update UI
        const optionItems = document.querySelectorAll('.option-item');
        optionItems.forEach((item, index) => {
            if (index === answerIndex) {
                item.classList.add('selected');
                item.querySelector('input').checked = true;
            } else {
                item.classList.remove('selected');
                item.querySelector('input').checked = false;
            }
        });

        // Update palette
        updateQuestionPalette();
    }

    function buildQuestionPalette() {
        const palette = document.getElementById('question-palette');
        palette.innerHTML = '';

        for (let i = 0; i < exam.questions.length; i++) {
            const paletteItem = document.createElement('div');
            paletteItem.className = 'palette-item';
            paletteItem.textContent = i + 1;
            paletteItem.addEventListener('click', () => loadQuestion(i));
            palette.appendChild(paletteItem);
        }
    }

    function updateQuestionPalette() {
        const paletteItems = document.querySelectorAll('.palette-item');
        paletteItems.forEach((item, index) => {
            item.classList.remove('current');
            if (index === currentQuestionIndex) {
                item.classList.add('current');
            }
            if (answers[index] !== undefined) {
                item.classList.add('answered');
            } else {
                item.classList.remove('answered');
            }
        });
    }

    function setupNavigation() {
        const prevButton = document.getElementById('prev-question');
        const nextButton = document.getElementById('next-question');

        prevButton.addEventListener('click', () => {
            if (currentQuestionIndex > 0) {
                loadQuestion(currentQuestionIndex - 1);
            }
        });

        nextButton.addEventListener('click', () => {
            if (currentQuestionIndex < exam.questions.length - 1) {
                loadQuestion(currentQuestionIndex + 1);
            }
        });

        // Update button states
        updateNavigationButtons();

        document.getElementById('submit-exam-btn').addEventListener('click', showSubmitConfirmation);
    }

    function updateNavigationButtons() {
        const prevButton = document.getElementById('prev-question');
        const nextButton = document.getElementById('next-question');

        prevButton.disabled = currentQuestionIndex === 0;
        nextButton.disabled = currentQuestionIndex === exam.questions.length - 1;
    }

    function startTimer() {
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                alert('Time is up! Submitting your exam...');
                submitExam();
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        const hours = Math.floor(timeRemaining / 3600);
        const minutes = Math.floor((timeRemaining % 3600) / 60);
        const seconds = timeRemaining % 60;

        const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('exam-timer').textContent = display;

        // Change color when time is running low
        if (timeRemaining < 300) { // Less than 5 minutes
            document.getElementById('exam-timer').style.color = 'var(--error)';
        }
    }

    function showSubmitConfirmation() {
        const answeredCount = Object.keys(answers).length;
        const totalQuestions = exam.questions.length;
        const unansweredCount = totalQuestions - answeredCount;

        let message = `You have answered ${answeredCount} out of ${totalQuestions} questions.`;
        if (unansweredCount > 0) {
            message += ` ${unansweredCount} questions are unanswered. Are you sure you want to submit?`;
        } else {
            message += ' Are you sure you want to submit?';
        }

        if (confirm(message)) {
            submitExam();
        }
    }

    async function submitExam() {
        clearInterval(timerInterval);

        // Calculate score
        let correctAnswers = 0;
        exam.questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                correctAnswers++;
            }
        });

        const score = Math.round((correctAnswers / exam.questions.length) * 100);

        // Save result
        try {
            await db.createExamResult(currentUser.username, examId, score, answers, 'completed');
            
            // Show success message
            const modalContainer = document.getElementById('modal-container');
            const modalContent = document.getElementById('modal-content');
            
            modalContent.innerHTML = `
                <div style="text-align: center;">
                    <h2 style="margin-bottom: 20px;">Exam Submitted Successfully!</h2>
                    <p style="font-size: 18px; margin-bottom: 10px;">Your Score: <strong>${score}%</strong></p>
                    <p style="margin-bottom: 20px;">${score >= 50 ? 'Congratulations! You passed.' : 'You did not pass. Keep practicing!'}</p>
                    <button class="primary-button" onclick="goToDashboard()">Return to Dashboard</button>
                </div>
            `;
            
            modalContainer.classList.remove('hidden');
        } catch (error) {
            console.error('Error submitting exam:', error);
            alert('Error submitting exam');
        }
    }

    window.goToDashboard = function() {
        localStorage.removeItem('currentExamId');
        window.location.href = 'student-dashboard.html';
    };

    // Handle page unload
    window.addEventListener('beforeunload', (e) => {
        if (timeRemaining > 0) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
});
