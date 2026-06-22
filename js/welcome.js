// Welcome Page Logic
document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const scannerScreen = document.getElementById('scanner-screen');
    const enterBtn = document.getElementById('enter-btn');
    const scannerPercentage = document.getElementById('scanner-percentage');
    const welcomeParticles = document.getElementById('welcome-particles');
    const scannerParticles = document.getElementById('scanner-particles');

    // Mouse tracking for glow effect
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Create enhanced welcome particles with multiple types
    function createWelcomeParticles() {
        // Small floating particles
        for (let i = 0; i < 80; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.width = (2 + Math.random() * 4) + 'px';
            particle.style.height = particle.style.width;
            particle.style.animationDuration = (10 + Math.random() * 20) + 's';
            particle.style.animationDelay = Math.random() * 10 + 's';
            particle.style.opacity = (0.3 + Math.random() * 0.7);
            welcomeParticles.appendChild(particle);
        }

        // Large glowing orbs
        for (let i = 0; i < 5; i++) {
            const orb = document.createElement('div');
            orb.className = 'glow-orb';
            orb.style.left = Math.random() * 100 + '%';
            orb.style.top = Math.random() * 100 + '%';
            orb.style.width = (100 + Math.random() * 150) + 'px';
            orb.style.height = orb.style.width;
            orb.style.animationDuration = (20 + Math.random() * 30) + 's';
            orb.style.animationDelay = Math.random() * 5 + 's';
            welcomeParticles.appendChild(orb);
        }

        // Connecting lines (constellation effect)
        createConstellationEffect();
    }

    // Constellation effect - particles that connect when close
    function createConstellationEffect() {
        const canvas = document.createElement('canvas');
        canvas.className = 'constellation-canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        welcomeParticles.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let constellationPoints = [];

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function initConstellationPoints() {
            constellationPoints = [];
            for (let i = 0; i < 50; i++) {
                constellationPoints.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: 2 + Math.random() * 2
                });
            }
        }

        function animateConstellation() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Update and draw points
            constellationPoints.forEach(point => {
                point.x += point.vx;
                point.y += point.vy;

                // Bounce off edges
                if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
                if (point.y < 0 || point.y > canvas.height) point.vy *= -1;

                // Draw point
                ctx.beginPath();
                ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(100, 180, 255, 0.6)';
                ctx.fill();
            });

            // Draw connections
            for (let i = 0; i < constellationPoints.length; i++) {
                for (let j = i + 1; j < constellationPoints.length; j++) {
                    const dx = constellationPoints[i].x - constellationPoints[j].x;
                    const dy = constellationPoints[i].y - constellationPoints[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        ctx.beginPath();
                        ctx.moveTo(constellationPoints[i].x, constellationPoints[i].y);
                        ctx.lineTo(constellationPoints[j].x, constellationPoints[j].y);
                        ctx.strokeStyle = `rgba(100, 180, 255, ${0.3 * (1 - distance / 150)})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }

            // Connect to mouse
            constellationPoints.forEach(point => {
                const dx = point.x - mouseX;
                const dy = point.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 200) {
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(mouseX, mouseY);
                    ctx.strokeStyle = `rgba(150, 200, 255, ${0.4 * (1 - distance / 200)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });

            requestAnimationFrame(animateConstellation);
        }

        resizeCanvas();
        initConstellationPoints();
        animateConstellation();

        window.addEventListener('resize', () => {
            resizeCanvas();
            initConstellationPoints();
        });
    }

    // Create scanner particles with enhanced effects
    function createScannerParticles() {
        // Orbiting particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'scanner-particle';
            const angle = (i / 20) * 360;
            const radius = 100 + Math.random() * 80;
            particle.style.transform = `rotate(${angle}deg) translateX(${radius}px) rotate(-${angle}deg)`;
            particle.style.animationDelay = (i * 0.15) + 's';
            particle.style.width = (3 + Math.random() * 3) + 'px';
            particle.style.height = particle.style.width;
            scannerParticles.appendChild(particle);
        }

        // Data stream effect
        createDataStream();
    }

    // Data stream effect - falling binary-like characters
    function createDataStream() {
        const streamContainer = document.createElement('div');
        streamContainer.className = 'data-stream';
        streamContainer.style.position = 'absolute';
        streamContainer.style.top = '0';
        streamContainer.style.left = '0';
        streamContainer.style.width = '100%';
        streamContainer.style.height = '100%';
        streamContainer.style.overflow = 'hidden';
        streamContainer.style.pointerEvents = 'none';
        scannerScreen.appendChild(streamContainer);

        for (let i = 0; i < 15; i++) {
            const stream = document.createElement('div');
            stream.className = 'data-column';
            stream.style.left = (i * 7) + '%';
            stream.style.animationDuration = (2 + Math.random() * 3) + 's';
            stream.style.animationDelay = Math.random() * 2 + 's';
            streamContainer.appendChild(stream);
        }
    }

    // Enhanced scanner animation with sound wave effect
    function animateScanner() {
        let percentage = 0;
        const interval = setInterval(() => {
            percentage += Math.random() * 12;
            if (percentage >= 100) {
                percentage = 100;
                clearInterval(interval);
                
                // Add completion effect
                scannerPercentage.style.color = '#00FF00';
                scannerPercentage.style.textShadow = '0 0 30px #00FF00';
                
                setTimeout(() => {
                    // Transition to student login
                    window.location.href = 'student-login.html';
                }, 800);
            }
            scannerPercentage.textContent = Math.floor(percentage) + '%';
            
            // Add glitch effect at certain percentages
            if (percentage > 25 && percentage < 27 || 
                percentage > 50 && percentage < 52 || 
                percentage > 75 && percentage < 77) {
                scannerPercentage.style.animation = 'shake 0.1s ease';
                setTimeout(() => {
                    scannerPercentage.style.animation = '';
                }, 100);
            }
        }, 150);
    }

    // Handle enter button click with enhanced transition
    enterBtn.addEventListener('click', () => {
        // Add button press effect
        enterBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            enterBtn.style.transform = 'scale(1)';
        }, 100);

        // Hide welcome screen with dissolve effect
        welcomeScreen.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        welcomeScreen.style.opacity = '0';
        welcomeScreen.style.transform = 'scale(1.1)';
        welcomeScreen.style.filter = 'blur(10px)';
        
        setTimeout(() => {
            welcomeScreen.classList.add('hidden');
            
            // Show scanner screen with fade in
            scannerScreen.classList.remove('hidden');
            scannerScreen.style.opacity = '0';
            scannerScreen.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                scannerScreen.style.transition = 'all 0.5s ease';
                scannerScreen.style.opacity = '1';
                scannerScreen.style.transform = 'scale(1)';
            }, 50);
            
            createScannerParticles();
            
            // Start scanner animation with staggered delays
            const rings = document.querySelectorAll('.scanner-ring');
            rings[0].style.animation = 'ringRotate 3s linear infinite';
            rings[1].style.animation = 'ringRotate 5s linear infinite reverse';
            rings[2].style.animation = 'ringRotate 7s linear infinite';
            
            const core = document.querySelector('.scanner-core');
            core.style.animation = 'corePulse 1.5s ease-in-out infinite';
            
            // Add glow pulse to rings
            rings.forEach((ring, index) => {
                ring.style.boxShadow = `0 0 ${20 + index * 10}px rgba(0, 102, 255, 0.5)`;
            });
            
            animateScanner();
        }, 800);
    });

    // Initialize particles
    createWelcomeParticles();

    // Enhanced logo animation with 3D effect
    const logoIcon = document.querySelector('.logo-icon');
    logoIcon.style.animation = 'logoFloat 4s ease-in-out infinite';
    logoIcon.style.transformStyle = 'preserve-3d';
    
    // Add mouse parallax effect to logo
    document.addEventListener('mousemove', (e) => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const rotateX = (e.clientY - centerY) / 50;
        const rotateY = (e.clientX - centerX) / 50;
        
        logoIcon.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`;
    });

    // Glitch effect on text
    function addGlitchEffect(element) {
        const originalText = element.textContent;
        const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        let iterations = 0;
        const glitchInterval = setInterval(() => {
            element.textContent = originalText
                .split('')
                .map((char, index) => {
                    if (index < iterations) {
                        return originalText[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');
            
            if (iterations >= originalText.length) {
                clearInterval(glitchInterval);
            }
            
            iterations += 1 / 3;
        }, 30);
    }

    // Animate text with glitch effect
    const welcomeTitle = document.querySelector('.welcome-title');
    const welcomeSubtitle = document.querySelector('.welcome-subtitle');
    const welcomeDescription = document.querySelector('.welcome-description');
    const enterButton = document.querySelector('.enter-button');

    welcomeTitle.style.opacity = '0';
    welcomeSubtitle.style.opacity = '0';
    
    setTimeout(() => {
        welcomeTitle.style.animation = 'fadeInUp 1s ease forwards';
        addGlitchEffect(welcomeTitle);
    }, 200);
    
    setTimeout(() => {
        welcomeSubtitle.style.animation = 'fadeInUp 1s ease forwards';
        addGlitchEffect(welcomeSubtitle);
    }, 600);
    
    if (welcomeDescription) {
        welcomeDescription.style.opacity = '0';
        setTimeout(() => {
            welcomeDescription.style.animation = 'fadeInUp 1s ease forwards';
        }, 1000);
    }
    
    setTimeout(() => {
        enterButton.style.animation = 'fadeInUp 1s ease forwards';
        enterButton.style.opacity = '0';
    }, 1400);

    // Add dynamic background gradient animation (blue themed - smoother)
    let hue = 0;
    function animateBackground() {
        hue = (hue + 0.15) % 360; // Full color cycle for smooth transitions
        // Use blue range (180-260) with smooth transitions
        const blueHue = 180 + Math.sin(hue * Math.PI / 180) * 40; // Oscillate between 140 and 220
        const blueHue2 = 200 + Math.cos(hue * Math.PI / 180) * 30; // Oscillate between 170 and 230
        const lightness = 40 + Math.sin(hue * Math.PI / 180) * 10; // Oscillate lightness
        
        welcomeScreen.style.background = `linear-gradient(135deg, 
            hsl(${blueHue}, 80%, ${lightness}%) 0%, 
            hsl(${blueHue2}, 85%, ${lightness - 5}%) 50%,
            hsl(${blueHue + 20}, 90%, ${lightness - 10}%) 100%)`;
        requestAnimationFrame(animateBackground);
    }
    animateBackground();
});
