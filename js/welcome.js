// Welcome Page Logic
document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const scannerScreen = document.getElementById('scanner-screen');
    const enterBtn = document.getElementById('enter-btn');
    const scannerPercentage = document.getElementById('scanner-percentage');
    const welcomeParticles = document.getElementById('welcome-particles');
    const scannerParticles = document.getElementById('scanner-particles');

    // Create welcome particles
    function createWelcomeParticles() {
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            particle.style.animationDelay = Math.random() * 5 + 's';
            welcomeParticles.appendChild(particle);
        }
    }

    // Create scanner particles
    function createScannerParticles() {
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'scanner-particle';
            const angle = (i / 12) * 360;
            particle.style.transform = `rotate(${angle}deg) translateX(150px) rotate(-${angle}deg)`;
            particle.style.animationDelay = (i * 0.2) + 's';
            scannerParticles.appendChild(particle);
        }
    }

    // Animate scanner percentage
    function animateScanner() {
        let percentage = 0;
        const interval = setInterval(() => {
            percentage += Math.random() * 15;
            if (percentage >= 100) {
                percentage = 100;
                clearInterval(interval);
                setTimeout(() => {
                    // Transition to student login
                    window.location.href = 'student-login.html';
                }, 500);
            }
            scannerPercentage.textContent = Math.floor(percentage) + '%';
        }, 200);
    }

    // Handle enter button click
    enterBtn.addEventListener('click', () => {
        // Hide welcome screen
        welcomeScreen.style.opacity = '0';
        welcomeScreen.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            welcomeScreen.classList.add('hidden');
            
            // Show scanner screen
            scannerScreen.classList.remove('hidden');
            createScannerParticles();
            
            // Start scanner animation
            const rings = document.querySelectorAll('.scanner-ring');
            rings[0].style.animation = 'ringRotate 4s linear infinite';
            rings[1].style.animation = 'ringRotate 6s linear infinite reverse';
            rings[2].style.animation = 'ringRotate 8s linear infinite';
            
            const core = document.querySelector('.scanner-core');
            core.style.animation = 'corePulse 2s ease-in-out infinite';
            
            animateScanner();
        }, 500);
    });

    // Initialize particles
    createWelcomeParticles();

    // Animate logo
    const logoIcon = document.querySelector('.logo-icon');
    logoIcon.style.animation = 'logoFloat 3s ease-in-out infinite';

    // Animate text
    const welcomeTitle = document.querySelector('.welcome-title');
    const welcomeSubtitle = document.querySelector('.welcome-subtitle');
    const welcomeDescription = document.querySelector('.welcome-description');
    const enterButton = document.querySelector('.enter-button');

    welcomeTitle.style.animation = 'fadeInUp 1s ease forwards';
    welcomeSubtitle.style.animation = 'fadeInUp 1s ease 0.3s forwards';
    welcomeSubtitle.style.opacity = '0';
    
    if (welcomeDescription) {
        welcomeDescription.style.animation = 'fadeInUp 1s ease 0.5s forwards';
        welcomeDescription.style.opacity = '0';
    }
    
    enterButton.style.animation = 'fadeInUp 1s ease 0.7s forwards';
    enterButton.style.opacity = '0';
});
