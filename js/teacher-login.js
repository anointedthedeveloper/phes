// Teacher Login Logic
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginButton = document.querySelector('.login-button');
    const loginParticles = document.getElementById('login-particles');

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

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Show loading state
        loginButton.classList.add('loading');
        loginButton.disabled = true;

        try {
            // Authenticate user
            const user = await db.authenticateUser(username, password, 'teacher');
            
            if (user) {
                // Store user session
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Show success animation
                loginButton.classList.remove('loading');
                loginButton.querySelector('.button-text').textContent = 'Success!';
                loginButton.style.background = 'var(--success)';
                
                setTimeout(() => {
                    // Redirect to teacher dashboard
                    window.location.href = 'teacher-dashboard.html';
                }, 1000);
            } else {
                // Show error
                loginButton.classList.remove('loading');
                loginButton.disabled = false;
                loginButton.style.background = 'var(--error)';
                loginButton.querySelector('.button-text').textContent = 'Invalid Credentials';
                
                setTimeout(() => {
                    loginButton.style.background = 'var(--primary-blue)';
                    loginButton.querySelector('.button-text').textContent = 'Sign In';
                }, 2000);
            }
        } catch (error) {
            console.error('Login error:', error);
            loginButton.classList.remove('loading');
            loginButton.disabled = false;
            loginButton.querySelector('.button-text').textContent = 'Error';
        }
    });

    // Initialize particles
    createLoginParticles();

    // Animate login card
    const loginCard = document.querySelector('.login-card');
    loginCard.style.animation = 'scaleIn 0.5s ease forwards';
});
