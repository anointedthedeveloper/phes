// Teacher Dashboard Logic
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'teacher') {
        window.location.href = 'teacher-login.html';
        return;
    }

    // Update user info
    document.getElementById('teacher-name').textContent = currentUser.username;

    // Logout handler
    document.getElementById('teacher-logout').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('teacher-page-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            
            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update content
            contentSections.forEach(content => content.classList.remove('active'));
            document.getElementById(`teacher-${section}-section`).classList.add('active');
            
            // Update page title
            pageTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);
            
            // Load section data
            loadSectionData(section);
        });
    });

    // Load section data
    async function loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                await loadDashboardStats();
                break;
            case 'students':
                await loadStudents();
                break;
            case 'exams':
                await loadExams();
                break;
            case 'monitoring':
                await loadMonitoring();
                break;
            case 'results':
                await loadResults();
                break;
        }
    }

    // Load dashboard stats
    async function loadDashboardStats() {
        try {
            const students = await db.getAllStudents();
            const exams = await db.getAllExams();
            const activeExams = exams.filter(e => e.status === 'active');
            const results = await db.getAllExamResults();

            animateCounter('total-students', students.length);
            animateCounter('total-exams', exams.length);
            animateCounter('active-exams', activeExams.length);
            animateCounter('submitted-exams', results.length);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    // Animate counter
    function animateCounter(elementId, target) {
        const element = document.getElementById(elementId);
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 30);
    }

    // Load students
    async function loadStudents() {
        try {
            const students = await db.getAllStudents();
            const tbody = document.getElementById('students-table-body');
            tbody.innerHTML = '';

            for (const [index, student] of students.entries()) {
                const row = document.createElement('tr');
                row.style.animation = `fadeIn 0.3s ease ${index * 0.1}s forwards`;
                row.style.opacity = '0';
                
                row.innerHTML = `
                    <td>${student.studentId}</td>
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${student.className}</td>
                    <td>
                        <button class="action-button" onclick="editStudent(${student.id})">✏️</button>
                        <button class="action-button" onclick="deleteStudent(${student.id})">🗑️</button>
                    </td>
                `;
                tbody.appendChild(row);
            }
        } catch (error) {
            console.error('Error loading students:', error);
        }
    }

    // Load exams
    async function loadExams() {
        try {
            const exams = await db.getAllExams();
            const tbody = document.getElementById('exams-table-body');
            tbody.innerHTML = '';

            for (const [index, exam] of exams.entries()) {
                const row = document.createElement('tr');
                row.style.animation = `fadeIn 0.3s ease ${index * 0.1}s forwards`;
                row.style.opacity = '0';
                
                const statusClass = exam.status === 'active' ? 'pass' : 'fail';
                
                row.innerHTML = `
                    <td>${exam.name}</td>
                    <td>${exam.subject}</td>
                    <td>${exam.duration} min</td>
                    <td>${exam.questions.length}</td>
                    <td><span class="status ${statusClass}">${exam.status}</span></td>
                    <td>
                        <button class="action-button" onclick="editExam(${exam.id})">✏️</button>
                        <button class="action-button" onclick="deleteExam(${exam.id})">🗑️</button>
                    </td>
                `;
                tbody.appendChild(row);
            }
        } catch (error) {
            console.error('Error loading exams:', error);
        }
    }

    // Load monitoring
    async function loadMonitoring() {
        const monitoringGrid = document.getElementById('monitoring-grid');
        monitoringGrid.innerHTML = '<div class="no-active-exams"><p>No active examinations at the moment</p></div>';
    }

    // Load results
    async function loadResults() {
        try {
            const results = await db.getAllExamResults();
            const tbody = document.getElementById('results-table-body');
            tbody.innerHTML = '';

            let passCount = 0;
            let totalScore = 0;

            for (const [index, result] of results.entries()) {
                const exam = await db.getExam(result.examId);
                const student = await db.getStudentByStudentId(result.studentId);
                const passed = result.score >= 50;
                
                if (passed) passCount++;
                totalScore += result.score;

                const row = document.createElement('tr');
                row.style.animation = `fadeIn 0.3s ease ${index * 0.1}s forwards`;
                row.style.opacity = '0';
                
                row.innerHTML = `
                    <td>${student ? student.name : result.studentId}</td>
                    <td>${exam ? exam.name : 'Unknown'}</td>
                    <td>${result.score}%</td>
                    <td><span class="status ${passed ? 'pass' : 'fail'}">${passed ? 'Passed' : 'Failed'}</span></td>
                    <td>${new Date(result.submittedAt).toLocaleDateString()}</td>
                `;
                tbody.appendChild(row);
            }

            // Update summary
            if (results.length > 0) {
                const passRate = (passCount / results.length) * 100;
                const avgScore = totalScore / results.length;
                
                document.getElementById('pass-rate-bar').style.width = passRate + '%';
                document.getElementById('pass-rate-text').textContent = Math.round(passRate) + '%';
                document.getElementById('average-score').textContent = Math.round(avgScore) + '%';
            }
        } catch (error) {
            console.error('Error loading results:', error);
        }
    }

    // Global functions for actions
    window.editStudent = function(id) {
        console.log('Edit student:', id);
        // TODO: Implement edit student modal
    };

    window.deleteStudent = async function(id) {
        if (confirm('Are you sure you want to delete this student?')) {
            await db.deleteStudent(id);
            loadStudents();
        }
    };

    window.editExam = function(id) {
        console.log('Edit exam:', id);
        // TODO: Implement edit exam modal
    };

    window.deleteExam = async function(id) {
        if (confirm('Are you sure you want to delete this exam?')) {
            await db.deleteExam(id);
            loadExams();
        }
    };

    // Add student button
    document.getElementById('add-student-btn').addEventListener('click', () => {
        console.log('Add student clicked');
        // TODO: Implement add student modal
    });

    // Create exam button
    document.getElementById('create-exam-btn').addEventListener('click', () => {
        console.log('Create exam clicked');
        // TODO: Implement create exam modal
    });

    // Export results button
    document.getElementById('export-results-btn').addEventListener('click', () => {
        console.log('Export results clicked');
        // TODO: Implement export functionality
    });

    // Initialize dashboard
    loadDashboardStats();
});
