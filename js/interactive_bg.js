/**
 * HAU Interactive Particle System & Shooting Stars
 * Reusable utility for both Survey and Login pages.
 */

class InteractiveBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.shootingStars = [];
        this.mouse = { x: null, y: null, radius: 150 };

        this.initEventListeners();
        this.resize();
        this.animate();
    }

    initEventListeners() {
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initParticles();
    }

    initParticles() {
        this.particles = [];
        const quantity = (this.canvas.width * this.canvas.height) / 3000;
        for (let i = 0; i < quantity; i++) {
            this.particles.push(new Particle(this.canvas));
        }
        this.shootingStars = [new ShootingStar(this.canvas)];
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let p of this.particles) {
            p.update(this.mouse);
            p.draw(this.ctx);
        }

        for (let s of this.shootingStars) {
            s.update(this.canvas);
            s.draw(this.ctx, this.canvas);
        }

        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(canvas) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        const colors = ['#800000', '#FFD700', '#ffffff', '#FFEC8B'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update(mouse) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;
            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                this.x -= (this.x - this.baseX) / 15;
            }
            if (this.y !== this.baseY) {
                this.y -= (this.y - this.baseY) / 15;
            }
        }
    }
}

class ShootingStar {
    constructor(canvas) {
        this.reset(canvas);
    }

    reset(canvas) {
        this.x = Math.random() * canvas.width;
        this.y = 0;
        this.len = (Math.random() * 80) + 50;
        this.speed = (Math.random() * 10) + 5;
        this.size = (Math.random() * 1) + 0.1;

        // Rare Blue Star Logic (10% chance)
        const isBlue = Math.random() > 0.9;
        this.color = isBlue ? '#00fbff' : '#FFD700';

        // Make blue stars wait longer to appear
        const baseWait = isBlue ? 8000 : 3000;
        this.waitTime = new Date().getTime() + (Math.random() * baseWait) + 1000;
        this.active = false;
    }

    update(canvas) {
        if (this.active) {
            this.x -= this.speed;
            this.y += this.speed;
            if (this.x < 0 || this.y > canvas.height) this.reset(canvas);
        } else if (new Date().getTime() > this.waitTime) {
            this.active = true;
        }
    }

    draw(ctx, canvas) {
        if (!this.active) return;
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.len, this.y - this.len);
        ctx.stroke();
        ctx.restore();
    }
}

// Auto-initialize if canvas exists
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('bg-canvas')) {
        new InteractiveBackground('bg-canvas');
    }
});
