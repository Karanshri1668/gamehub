
        // Game elements
        const ball = document.getElementById('ball');
        const platform = document.getElementById('platform');
        const platformGlow = document.getElementById('platformGlow');
        const gameContainer = document.getElementById('gameContainer');
        const timeDisplay = document.getElementById('time');
        const bouncesDisplay = document.getElementById('bounces');
        const finalTimeDisplay = document.getElementById('finalTime');
        const finalBouncesDisplay = document.getElementById('finalBounces');
        const gameOverScreen = document.getElementById('gameOver');
        const startBtn = document.getElementById('startBtn');
        const resetBtn = document.getElementById('resetBtn');
        const saveScoreBtn = document.getElementById('saveScore');
        const playerNameInput = document.getElementById('playerName');
        const leaderboardList = document.getElementById('leaderboardList');
        const easyBtn = document.getElementById('easyBtn');
        const mediumBtn = document.getElementById('mediumBtn');
        const hardBtn = document.getElementById('hardBtn');
        
        // Game variables
        let gameActive = false;
        let startTime;
        let currentTime = 0;
        let bounces = 0;
        let gameInterval;
        let trailInterval;
        let platformPosition = 10;
        let ballPosition = { x: 40, y: 50 };
        let ballVelocity = { x: 0, y: 0 };
        let baseGravity = 0.2;
        let currentGravity = 0.2;
        let friction = 0.99;
        let platformWidth = 100;
        let basePlatformWidth = 100;
        let containerWidth = 1000;
        let containerHeight = 500;
        let difficulty = 'easy';
        let obstacles = [];
        let lastTrailTime = 0;
        
        // Difficulty settings
        const difficultySettings = {
            easy: {
                gravity: 0.2,
                platformShrinkRate: 0,
                obstacleFrequency: 0,
                platformWidth: 80
            },
            medium: {
                gravity: 0.25,
                platformShrinkRate: 0.05,
                obstacleFrequency: 0.003,
                platformWidth: 70
            },
            hard: {
                gravity: 0.3,
                platformShrinkRate: 0.1,
                obstacleFrequency: 0.005,
                platformWidth: 60
            }
        };
        
        // Initialize leaderboard
        let leaderboard = JSON.parse(localStorage.getItem('balanceBallLeaderboard')) || [];
        updateLeaderboard();
        
        // Event listeners
        startBtn.addEventListener('click', startGame);
        resetBtn.addEventListener('click', resetGame);
        saveScoreBtn.addEventListener('click', saveScore);
        
        // Difficulty selection
        easyBtn.addEventListener('click', () => setDifficulty('easy'));
        mediumBtn.addEventListener('click', () => setDifficulty('medium'));
        hardBtn.addEventListener('click', () => setDifficulty('hard'));
        
        // Mouse/touch controls for desktop
        gameContainer.addEventListener('mousemove', (e) => {
            if (!gameActive) return;
            
            const rect = gameContainer.getBoundingClientRect();
            const xPos = e.clientX - rect.left - platformWidth / 2;
            
            platformPosition = Math.max(0, Math.min(containerWidth - platformWidth, xPos));
            platform.style.left = platformPosition + 'px';
        });
        
        // Touch controls for mobile
        gameContainer.addEventListener('touchmove', (e) => {
            if (!gameActive) return;
            e.preventDefault();
            
            const rect = gameContainer.getBoundingClientRect();
            const xPos = e.touches[0].clientX - rect.left - platformWidth / 2;
            
            platformPosition = Math.max(0, Math.min(containerWidth - platformWidth, xPos));
            platform.style.left = platformPosition + 'px';
        });
        
        // Device orientation for mobile
        window.addEventListener('deviceorientation', (e) => {
            if (!gameActive) return;
            
            const tilt = e.beta;
            
            if (tilt) {
                const normalizedTilt = Math.min(45, Math.max(-45, tilt));
                const movement = (normalizedTilt / 45) * (containerWidth - platformWidth) / 2;
                
                platformPosition = (containerWidth - platformWidth) / 2 + movement;
                platformPosition = Math.max(0, Math.min(containerWidth - platformWidth, platformPosition));
                platform.style.left = platformPosition + 'px';
            }
        });
        
        // Keyboard controls for desktop
        document.addEventListener('keydown', (e) => {
            if (!gameActive) return;
            
            const moveAmount = 20;
            
            if (e.key === 'ArrowLeft') {
                platformPosition = Math.max(0, platformPosition - moveAmount);
            } else if (e.key === 'ArrowRight') {
                platformPosition = Math.min(containerWidth - platformWidth, platformPosition + moveAmount);
            }
            
            platform.style.left = platformPosition + 'px';
        });
        
        function setDifficulty(level) {
            difficulty = level;
            easyBtn.classList.remove('active');
            mediumBtn.classList.remove('active');
            hardBtn.classList.remove('active');
            
            if (level === 'easy') {
                easyBtn.classList.add('active');
                baseGravity = difficultySettings.easy.gravity;
                basePlatformWidth = difficultySettings.easy.platformWidth;
            } else if (level === 'medium') {
                mediumBtn.classList.add('active');
                baseGravity = difficultySettings.medium.gravity;
                basePlatformWidth = difficultySettings.medium.platformWidth;
            } else if (level === 'hard') {
                hardBtn.classList.add('active');
                baseGravity = difficultySettings.hard.gravity;
                basePlatformWidth = difficultySettings.hard.platformWidth;
            }
            
            // Reset platform width when changing difficulty
            platformWidth = basePlatformWidth;
            platform.style.width = platformWidth + 'px';
        }
        
        function startGame() {
            gameActive = true;
            startTime = Date.now();
            currentTime = 0;
            bounces = 0;
            ballPosition = { x: 240, y: 50 };
            ballVelocity = { x: 0, y: 0 };
            currentGravity = baseGravity;
            platformWidth = basePlatformWidth;
            platform.style.width = platformWidth + 'px';
            
            // Clear any existing obstacles
            document.querySelectorAll('.obstacle').forEach(obs => obs.remove());
            obstacles = [];
            
            // Start trail effect
            lastTrailTime = 0;
            
            gameOverScreen.style.display = 'none';
            startBtn.textContent = 'Playing...';
            startBtn.disabled = true;
            
            gameInterval = setInterval(updateGame, 16);
            trailInterval = setInterval(createTrail, 30);
        }
        
        function updateGame() {
            // Update time
            currentTime = Math.floor((Date.now() - startTime) / 1000);
            timeDisplay.textContent = currentTime;
            bouncesDisplay.textContent = bounces;
            
            // Increase difficulty over time
            if (difficulty !== 'easy') {
                // Increase gravity
                currentGravity = baseGravity * (1 + (currentTime * 0.01));
                
                // Shrink platform
                const shrinkRate = difficulty === 'medium' ? 
                    difficultySettings.medium.platformShrinkRate : 
                    difficultySettings.hard.platformShrinkRate;
                
                platformWidth = Math.max(30, basePlatformWidth * (1 - (currentTime * shrinkRate)));
                platform.style.width = platformWidth + 'px';
                
                // Add obstacles
                const obstacleFreq = difficulty === 'medium' ? 
                    difficultySettings.medium.obstacleFrequency : 
                    difficultySettings.hard.obstacleFrequency;
                
                if (Math.random() < obstacleFreq) {
                    createObstacle();
                }
            }
            
            // Apply gravity to ball
            ballVelocity.y += currentGravity;
            
            // Apply friction
            ballVelocity.x *= friction;
            
            // Update ball position
            ballPosition.x += ballVelocity.x;
            ballPosition.y += ballVelocity.y;
            
            // Wall collisions
            if (ballPosition.x <= 0 || ballPosition.x >= containerWidth - 20) {
                ballVelocity.x *= -0.8;
                ballPosition.x = Math.max(0, Math.min(containerWidth - 20, ballPosition.x));
                createParticles(ballPosition.x, ballPosition.y);
                if (navigator.vibrate) navigator.vibrate(50);
            }
            
            // Platform collision
            if (
                ballPosition.y + 20 >= containerHeight - 35 &&
                ballPosition.y + 20 <= containerHeight - 20 &&
                ballPosition.x + 10 >= platformPosition &&
                ballPosition.x <= platformPosition + platformWidth
            ) {
                ballVelocity.y = -8 * (1 - (currentTime * 0.002)); // Slightly reduce bounce over time
                
                const hitPosition = (ballPosition.x + 10 - platformPosition) / platformWidth;
                ballVelocity.x = (hitPosition - 0.5) * 10;
                
                // Platform glow effect
                platformGlow.style.opacity = 1;
                setTimeout(() => {
                    platformGlow.style.opacity = 0;
                }, 300);
                
                // Bounce counter
                bounces++;
                bouncesDisplay.textContent = bounces;
                
                createParticles(ballPosition.x, ballPosition.y);
                if (navigator.vibrate) navigator.vibrate(50);
            }
            
            // Obstacle collisions
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                
                if (
                    ballPosition.x + 20 > obs.x &&
                    ballPosition.x < obs.x + obs.width &&
                    ballPosition.y + 20 > obs.y &&
                    ballPosition.y < obs.y + obs.height
                ) {
                    // Bounce off obstacle
                    if (ballPosition.y + 10 < obs.y || ballPosition.y + 10 > obs.y + obs.height) {
                        ballVelocity.y *= -0.7;
                    } else {
                        ballVelocity.x *= -0.7;
                    }
                    
                    // Remove obstacle after hit
                    obs.element.remove();
                    obstacles.splice(i, 1);
                    
                    createParticles(ballPosition.x, ballPosition.y);
                    if (navigator.vibrate) navigator.vibrate(100);
                }
                
                // Remove obstacles that are off screen
                if (obs.y > containerHeight) {
                    obs.element.remove();
                    obstacles.splice(i, 1);
                }
            }
            
            // Check if ball fell off
            if (ballPosition.y > containerHeight) {
                endGame();
                return;
            }
            
            // Update ball position
            ball.style.left = ballPosition.x + 'px';
            ball.style.top = ballPosition.y + 'px';
        }
        
        function createParticles(x, y) {
            for (let i = 0; i < 8; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                
                // Random direction and speed
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 3;
                const lifetime = 500 + Math.random() * 500;
                
                gameContainer.appendChild(particle);
                
                // Animate particle
                const startTime = Date.now();
                const particleInterval = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    const progress = elapsed / lifetime;
                    
                    if (progress >= 1) {
                        clearInterval(particleInterval);
                        particle.remove();
                        return;
                    }
                    
                    particle.style.transform = `translate(${Math.cos(angle) * speed * elapsed * 0.1}px, ${Math.sin(angle) * speed * elapsed * 0.1}px)`;
                    particle.style.opacity = 1 - progress;
                }, 16);
            }
        }
        
        function createTrail() {
            if (!gameActive) return;
            
            const now = Date.now();
            if (now - lastTrailTime < 30) return; // Limit trail frequency
            lastTrailTime = now;
            
            const trail = document.createElement('div');
            trail.className = 'ball-trail';
            trail.style.left = ballPosition.x + 'px';
            trail.style.top = ballPosition.y + 'px';
            
            gameContainer.appendChild(trail);
            
            // Fade out trail
            let opacity = 0.4;
            const fadeInterval = setInterval(() => {
                opacity -= 0.05;
                trail.style.opacity = opacity;
                
                if (opacity <= 0) {
                    clearInterval(fadeInterval);
                    trail.remove();
                }
            }, 50);
        }
        
        function createObstacle() {
            const width = 40 + Math.random() * 60;
            const height = 15 + Math.random() * 30;
            const x = Math.random() * (containerWidth - width);
            const y = -height;
            
            const obstacle = document.createElement('div');
            obstacle.className = 'obstacle';
            obstacle.style.width = width + 'px';
            obstacle.style.height = height + 'px';
            obstacle.style.left = x + 'px';
            obstacle.style.top = y + 'px';
            
            gameContainer.appendChild(obstacle);
            
            obstacles.push({
                element: obstacle,
                x: x,
                y: y,
                width: width,
                height: height,
                speed: 1 + Math.random() * 2
            });
        }
        
        function endGame() {
            gameActive = false;
            clearInterval(gameInterval);
            clearInterval(trailInterval);
            
            finalTimeDisplay.textContent = currentTime;
            finalBouncesDisplay.textContent = bounces;
            gameOverScreen.style.display = 'flex';
            startBtn.textContent = 'Start Game';
            startBtn.disabled = false;
        }
        
        function resetGame() {
            gameActive = false;
            clearInterval(gameInterval);
            clearInterval(trailInterval);
            
            // Clear particles and trails
            document.querySelectorAll('.particle, .ball-trail, .obstacle').forEach(el => el.remove());
            
            ballPosition = { x: 140, y: 50 };
            ballVelocity = { x: 0, y: 0 };
            platformPosition = 110;
            platformWidth = basePlatformWidth;
            platform.style.width = platformWidth + 'px';
            platform.style.left = platformPosition + 'px';
            
            ball.style.left = ballPosition.x + 'px';
            ball.style.top = ballPosition.y + 'px';
            
            timeDisplay.textContent = '0';
            bouncesDisplay.textContent = '0';
            gameOverScreen.style.display = 'none';
            startBtn.textContent = 'Start Game';
            startBtn.disabled = false;
        }
        
        function saveScore() {
            const name = playerNameInput.value.trim() || 'Anonymous';
            const score = currentTime;
            
            leaderboard.push({ 
                name, 
                score,
                difficulty,
                bounces,
                date: new Date().toLocaleDateString()
            });
            
            leaderboard.sort((a, b) => b.score - a.score);
            
            if (leaderboard.length > 10) {
                leaderboard = leaderboard.slice(0, 10);
            }
            
            localStorage.setItem('balanceBallLeaderboard', JSON.stringify(leaderboard));
            
            updateLeaderboard();
            resetGame();
        }
        
        function updateLeaderboard() {
            leaderboardList.innerHTML = '';
            
            leaderboard.forEach((entry, index) => {
                const item = document.createElement('div');
                item.className = 'leaderboard-item';
                item.innerHTML = `
                    <span>${index + 1}. ${entry.name} (${entry.difficulty})</span>
                    <span>${entry.score}s</span>
                `;
                leaderboardList.appendChild(item);
            });
        }
        
        // Initialize with easy difficulty
        setDifficulty('easy');
    