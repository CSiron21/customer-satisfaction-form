/**
 * Admin Login - Interactive Particle System (AntiGravity Landing Style)
 * Featuring thousands of tiny Maroon and Gold particles reacting to mouse movements.
 * Easter Egg: Rare Shooting Stars! 🌠
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Interactive Particle System ---
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let shootingStars = [];
    let mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            // HAU theme colors: Maroon, Gold, White
            const colors = ['#800000', '#FFD700', '#ffffff', '#FFEC8B'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        update() {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            if (distance < mouse.radius) {
                this.x -= directionX;
                this.y -= directionY;
            } else {
                if (this.x !== this.baseX) {
                    let dx = this.x - this.baseX;
                    this.x -= dx / 15;
                }
                if (this.y !== this.baseY) {
                    let dy = this.y - this.baseY;
                    this.y -= dy / 15;
                }
            }
        }
    }

    // --- 🌟 Easter Egg: Shooting Star Class ---
    class ShootingStar {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = 0;
            this.len = (Math.random() * 80) + 50;
            this.speed = (Math.random() * 10) + 5;
            this.size = (Math.random() * 1) + 0.1;
            this.waitTime = new Date().getTime() + (Math.random() * 3000) + 500;
            this.active = false;
        }

        update() {
            if (this.active) {
                this.x -= this.speed;
                this.y += this.speed;
                if (this.x < 0 || this.y > canvas.height) {
                    this.reset();
                }
            } else {
                if (new Date().getTime() > this.waitTime) {
                    this.active = true;
                }
            }
        }

        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.strokeStyle = '#FFD700'; // HAU Gold
            ctx.lineWidth = this.size;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.len, this.y - this.len);
            ctx.stroke();
            ctx.restore();
        }
    }

    function init() {
        particles = [];
        const quantity = (canvas.width * canvas.height) / 3000;
        for (let i = 0; i < quantity; i++) {
            particles.push(new Particle());
        }

        // Initialize one shooting star at a time
        shootingStars = [new ShootingStar()];
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and Draw Particles
        for (let i = 0; i < particles.length; i++) {
            particles[i].draw();
            particles[i].update();
        }

        // Update and Draw Shooting Stars (Easter Egg)
        for (let star of shootingStars) {
            star.update();
            star.draw();
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();

    // --- 2. Password Toggle Functionality ---
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            if (type === 'text') {
                togglePassword.innerHTML = `
                    <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                `;
            } else {
                togglePassword.innerHTML = `
                    <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                `;
            }
        });
    }
});
