// Student Login Logic
document.addEventListener('DOMContentLoaded', async () => {
    const loginForm = document.getElementById('login-form');
    const loginButton = document.querySelector('.login-button');
    const loginParticles = document.getElementById('login-particles');

    // Wait for database to be initialized
    if (!db.db) {
        try {
            await db.init();
            console.log('[DATABASE] Database initialized successfully');
        } catch (error) {
            console.error('[DATABASE ERROR] Failed to initialize database:', error);
            loginButton.querySelector('.button-text').textContent = 'Database error - please refresh';
            return;
        }
    }

    // Create login particles
    function createLoginParticles() {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'login-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (20 + Math.random() * 10) + 's';
            particle.style.animationDelay = Math.random() * 10 + 's';
            loginParticles.appendChild(particle);
        }
    }

    // Toggle password visibility
    window.togglePassword = function(fieldId) {
        const field = document.getElementById(fieldId);
        const btn = event.target.closest('.show-password-btn');
        
        if (field.type === 'password') {
            field.type = 'text';
            btn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
            `;
        } else {
            field.type = 'password';
            btn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                </svg>
            `;
        }
    };

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Log login attempt
        console.log(`[LOGIN ATTEMPT] Student login attempt - Username: ${username}, Time: ${new Date().toISOString()}`);

        // Show loading state
        loginButton.classList.add('loading');
        loginButton.disabled = true;

        try {
            // Check if user is already logged in
            const isLoggedIn = await db.isUserLoggedIn(username);
            if (isLoggedIn) {
                // Revoke existing sessions
                await db.revokeUserSessions(username);
                console.log(`[SESSION] Revoked existing sessions for user: ${username}`);
            }

            // Authenticate user
            const user = await db.authenticateUser(username, password, 'student');
            
            if (user) {
                // Log successful login
                console.log(`[LOGIN SUCCESS] Student logged in successfully - Username: ${username}, Time: ${new Date().toISOString()}`);
                
                // Create session
                const sessionId = `session-${username}-${Date.now()}`;
                await db.createSession(username, sessionId);
                
                // Store user session
                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.setItem('sessionId', sessionId);
                
                // Show success animation
                loginButton.classList.remove('loading');
                loginButton.querySelector('.button-text').textContent = 'Success!';
                loginButton.style.background = 'var(--success)';
                
                setTimeout(() => {
                    // Redirect to student dashboard
                    window.location.href = 'student-dashboard.html';
                }, 1000);
            } else {
                // Log failed login
                console.error(`[LOGIN FAILED] Invalid credentials - Username: ${username}, Time: ${new Date().toISOString()}`);
                
                // Show error
                loginButton.classList.remove('loading');
                loginButton.disabled = false;
                loginButton.style.background = 'var(--error)';
                loginButton.querySelector('.button-text').textContent = 'Invalid username or password';
                
                setTimeout(() => {
                    loginButton.style.background = 'var(--primary-blue)';
                    loginButton.querySelector('.button-text').textContent = 'Sign In';
                }, 2000);
            }
        } catch (error) {
            // Log error
            console.error(`[LOGIN ERROR] Student login error - Username: ${username}, Error: ${error.message}, Time: ${new Date().toISOString()}`);
            
            loginButton.classList.remove('loading');
            loginButton.disabled = false;
            loginButton.style.background = 'var(--error)';
            
            // Show specific error message
            if (error.message.includes('object stores')) {
                loginButton.querySelector('.button-text').textContent = 'Database error - please refresh';
            } else {
                loginButton.querySelector('.button-text').textContent = 'Login error - please try again';
            }
            
            setTimeout(() => {
                loginButton.style.background = 'var(--primary-blue)';
                loginButton.querySelector('.button-text').textContent = 'Sign In';
            }, 2000);
        }
    });

    // Initialize particles
    createLoginParticles();

    // Animate login card
    const loginCard = document.querySelector('.login-card');
    loginCard.style.animation = 'scaleIn 0.5s ease forwards';
});
