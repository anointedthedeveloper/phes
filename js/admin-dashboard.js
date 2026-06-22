// Admin Dashboard Logic
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication and session
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const sessionId = localStorage.getItem('sessionId');
    
    if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = 'admin-login.html';
        return;
    }

    // Validate session
    if (sessionId) {
        const session = await db.getSession(sessionId);
        if (!session || session.userId !== currentUser.username) {
            // Invalid session, redirect to login
            localStorage.removeItem('currentUser');
            localStorage.removeItem('sessionId');
            window.location.href = 'admin-login.html';
            return;
        }
        // Update session activity
        await db.updateSessionActivity(sessionId);
    } else {
        // No session, redirect to login
        localStorage.removeItem('currentUser');
        window.location.href = 'admin-login.html';
        return;
    }

    // Logout handler
    document.getElementById('admin-logout').addEventListener('click', async () => {
        await db.deleteSession(sessionId);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionId');
        window.location.href = 'index.html';
    });

    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');
    const pageTitle = document.getElementById('admin-page-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            
            // Update active nav
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update content
            contentSections.forEach(content => content.classList.remove('active'));
            document.getElementById(`admin-${section}-section`).classList.add('active');
            
            // Update page title
            pageTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1);
            
            // Load section data
            loadSectionData(section);
        });
    });

    // Load section data
    async function loadSectionData(section) {
        switch(section) {
            case 'overview':
                await loadOverviewStats();
                break;
            case 'users':
                await loadUsers();
                break;
            case 'teachers':
                await loadTeachers();
                break;
            case 'settings':
                // Settings are static
                break;
            case 'backup':
                // Backup info is static
                break;
        }
    }

    // Load overview stats
    async function loadOverviewStats() {
        try {
            const users = await db.getAll('users');
            const teachers = users.filter(u => u.role === 'teacher');
            const students = await db.getAllStudents();
            const exams = await db.getAllExams();

            animateCounter('total-users', users.length);
            animateCounter('total-teachers', teachers.length);
            animateCounter('total-students-admin', students.length);
            animateCounter('total-exams-admin', exams.length);
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

    // Load users
    async function loadUsers() {
        try {
            const users = await db.getAll('users');
            const tbody = document.getElementById('users-table-body');
            tbody.innerHTML = '';

            for (const [index, user] of users.entries()) {
                const row = document.createElement('tr');
                row.style.animation = `fadeIn 0.3s ease ${index * 0.1}s forwards`;
                row.style.opacity = '0';
                
                const statusClass = user.status === 'active' ? 'pass' : 'fail';
                
                row.innerHTML = `
                    <td>${user.username}</td>
                    <td>${user.role}</td>
                    <td><span class="status ${statusClass}">${user.status}</span></td>
                    <td>
                        <button class="action-button" onclick="toggleUserStatus(${user.id})">🔄</button>
                        <button class="action-button" onclick="deleteUser(${user.id})">🗑️</button>
                    </td>
                `;
                tbody.appendChild(row);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    // Load teachers
    async function loadTeachers() {
        try {
            const users = await db.getAll('users');
            const teachers = users.filter(u => u.role === 'teacher');
            const tbody = document.getElementById('teachers-table-body');
            tbody.innerHTML = '';

            for (const [index, teacher] of teachers.entries()) {
                const row = document.createElement('tr');
                row.style.animation = `fadeIn 0.3s ease ${index * 0.1}s forwards`;
                row.style.opacity = '0';
                
                row.innerHTML = `
                    <td>${teacher.username}</td>
                    <td>${teacher.email || 'N/A'}</td>
                    <td>${new Date(teacher.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="action-button" onclick="deleteTeacher(${teacher.id})">🗑️</button>
                    </td>
                `;
                tbody.appendChild(row);
            }
        } catch (error) {
            console.error('Error loading teachers:', error);
        }
    }

    // Global functions for actions
    window.toggleUserStatus = async function(id) {
        try {
            const user = await db.get('users', id);
            user.status = user.status === 'active' ? 'inactive' : 'active';
            await db.update('users', user);
            loadUsers();
        } catch (error) {
            console.error('Error toggling user status:', error);
        }
    };

    window.deleteUser = async function(id) {
        if (confirm('Are you sure you want to delete this user?')) {
            await db.delete('users', id);
            loadUsers();
        }
    };

    window.deleteTeacher = async function(id) {
        if (confirm('Are you sure you want to delete this teacher?')) {
            await db.delete('users', id);
            loadTeachers();
        }
    };

    // Add teacher button
    document.getElementById('add-teacher-btn').addEventListener('click', () => {
        const username = prompt('Enter teacher username:');
        if (username) {
            const password = prompt('Enter password:');
            const email = prompt('Enter email (optional):');
            
            if (password) {
                db.createUser(username, password, 'teacher', email || null).then(() => {
                    loadTeachers();
                    alert('Teacher created successfully');
                }).catch(error => {
                    alert('Error creating teacher: ' + error.message);
                });
            }
        }
    });

    // Backup button
    document.getElementById('backup-btn').addEventListener('click', async () => {
        try {
            const backup = {
                users: await db.getAll('users'),
                students: await db.getAllStudents(),
                exams: await db.getAllExams(),
                examResults: await db.getAllExamResults(),
                timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `school-portal-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            alert('Backup created successfully');
        } catch (error) {
            console.error('Error creating backup:', error);
            alert('Error creating backup');
        }
    });

    // Restore button
    document.getElementById('restore-btn').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const backup = JSON.parse(event.target.result);
                    
                    // Restore data
                    for (const user of backup.users) {
                        await db.update('users', user);
                    }
                    for (const student of backup.students) {
                        await db.update('students', student);
                    }
                    for (const exam of backup.exams) {
                        await db.update('exams', exam);
                    }
                    for (const result of backup.examResults) {
                        await db.update('examResults', result);
                    }
                    
                    alert('Backup restored successfully');
                    loadOverviewStats();
                } catch (error) {
                    console.error('Error restoring backup:', error);
                    alert('Error restoring backup');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    });

    // Initialize dashboard
    loadOverviewStats();
});
