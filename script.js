document.addEventListener("DOMContentLoaded", () => {
    // DARK AND LIGHT MODE
    const root = document.documentElement;
    const themeToggle = document.getElementById("themeToggle");

    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);

        if (themeToggle) {
            themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
            themeToggle.setAttribute(
                "aria-label",
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            );
        }

        try {
            localStorage.setItem("portfolio-theme", theme);
        } catch (error) {
            // The theme still works without local storage.
        }
    }

    let savedTheme = "dark";

    try {
        savedTheme = localStorage.getItem("portfolio-theme") || "dark";
    } catch (error) {
        // Dark mode is the default.
    }

    applyTheme(savedTheme);

    themeToggle?.addEventListener("click", () => {
        const currentTheme = root.getAttribute("data-theme");
        applyTheme(currentTheme === "dark" ? "light" : "dark");
    });

    // MOBILE NAVIGATION
    const menuToggle = document.getElementById("menuToggle");
    const navbar = document.getElementById("navbar");
    const navLinks = document.querySelectorAll(".nav-link");

    function closeMenu() {
        navbar?.classList.remove("open");
        menuToggle?.setAttribute("aria-expanded", "false");
    }

    menuToggle?.addEventListener("click", () => {
        const isOpen = navbar.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    // ACTIVE NAVIGATION
    const sections = document.querySelectorAll("main section[id]");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    navLinks.forEach((link) => {
                        link.classList.toggle(
                            "active",
                            link.getAttribute("href") === `#${entry.target.id}`
                        );
                    });
                });
            },
            {
                rootMargin: "-30% 0px -55% 0px",
                threshold: 0
            }
        );

        sections.forEach((section) => observer.observe(section));
    }

    // CHANGING GREETING
    const changingGreeting = document.getElementById("changingGreeting");

    if (changingGreeting) {
        window.setTimeout(() => {
            changingGreeting.textContent = "Kon'nichiwa! こんにちは!";
        }, 5000);
    }

    // PORTRAIT SLIDESHOW
    const slides = Array.from(document.querySelectorAll(".slide"));
    const dotsContainer = document.getElementById("slideDots");
    const previousButton = document.getElementById("previousSlide");
    const nextButton = document.getElementById("nextSlide");

    let currentSlide = 0;
    let slideshowTimer = null;

    function showSlide(index) {
        if (slides.length === 0) return;

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            const isActive = i === currentSlide;
            slide.classList.toggle("active", isActive);
            slide.setAttribute("aria-hidden", String(!isActive));
        });

        const dots = dotsContainer?.querySelectorAll(".slide-dot") || [];

        dots.forEach((dot, i) => {
            const isActive = i === currentSlide;
            dot.classList.toggle("active", isActive);

            if (isActive) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function previousSlide() {
        showSlide(currentSlide - 1);
    }

    function startSlideshow() {
        window.clearInterval(slideshowTimer);

        if (slides.length > 1) {
            slideshowTimer = window.setInterval(nextSlide, 3500);
        }
    }

    function restartSlideshow() {
        startSlideshow();
    }

    if (slides.length > 0 && dotsContainer) {
        slides.forEach((slide, index) => {
            const dot = document.createElement("button");

            dot.type = "button";
            dot.className = "slide-dot";
            dot.setAttribute("aria-label", `Show photo ${index + 1}`);

            dot.addEventListener("click", () => {
                showSlide(index);
                restartSlideshow();
            });

            dotsContainer.appendChild(dot);
        });

        showSlide(0);
        startSlideshow();

        nextButton?.addEventListener("click", () => {
            nextSlide();
            restartSlideshow();
        });

        previousButton?.addEventListener("click", () => {
            previousSlide();
            restartSlideshow();
        });

        const slideshow = document.getElementById("aboutSlideshow");

        slideshow?.addEventListener("mouseenter", () => {
            window.clearInterval(slideshowTimer);
        });

        slideshow?.addEventListener("mouseleave", startSlideshow);
    }

    // VIRUS-STYLE MOUSE CURSOR
    const cursorCore = document.querySelector(".cursor-core");
    const canUseCustomCursor =
        window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (cursorCore && canUseCustomCursor) {
        document.body.classList.add("custom-cursor");

        let lastParticleTime = 0;

        document.addEventListener("mousemove", (event) => {
            const x = event.clientX;
            const y = event.clientY;

            cursorCore.style.left = `${x}px`;
            cursorCore.style.top = `${y}px`;
            cursorCore.style.opacity = "1";

            const now = performance.now();

            if (now - lastParticleTime > 35) {
                createVirusParticle(x, y);
                lastParticleTime = now;
            }
        });

        document.addEventListener("mouseleave", () => {
            cursorCore.style.opacity = "0";
            document.body.classList.remove("cursor-hover");
        });

        document.addEventListener("mouseenter", () => {
            cursorCore.style.opacity = "1";
        });

        document.querySelectorAll("a, button, input, textarea").forEach((item) => {
            item.addEventListener("mouseenter", () => {
                document.body.classList.add("cursor-hover");
            });

            item.addEventListener("mouseleave", () => {
                document.body.classList.remove("cursor-hover");
            });
        });
    }

    function createVirusParticle(x, y) {
        const particle = document.createElement("span");

        particle.className = "virus-particle";
        particle.setAttribute("aria-hidden", "true");
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        document.body.appendChild(particle);

        particle.addEventListener("animationend", () => {
            particle.remove();
        }, { once: true });
    }

    // CONTACT FORM & SIDE POP-UP NOTIFICATION
    const contactForm = document.getElementById("contactForm");
    const formStatus = document.getElementById("formStatus");
    const recipientEmail = "jeremyjohnlintag@gmail.com";

    contactForm?.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!contactForm.reportValidity()) return;

        const formData = new FormData(contactForm);
        const name = formData.get("name").toString().trim();
        const email = formData.get("email").toString().trim();
        const message = formData.get("message").toString().trim();

        const subject = encodeURIComponent(`Portfolio message from ${name}`);
        const body = encodeURIComponent(
            `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
        );

        // Show Side Pop-Up Toast
        showSideToast(name, email, message);

        if (formStatus) {
            formStatus.textContent = "Opening email app... Check your side notification preview!";
        }

        // Open mail client
        setTimeout(() => {
            window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
        }, 800);
    });

    // AUTOMATIC COPYRIGHT YEAR
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
});

// SIDE TOAST POP-UP LOGIC
function showSideToast(name, email, message) {
    const toast = document.getElementById("sideToast");
    document.getElementById("toastName").textContent = name;
    document.getElementById("toastEmail").textContent = email;
    document.getElementById("toastMsg").textContent = message;

    toast.classList.add("show");

    // Automatically hide after 7 seconds
    setTimeout(() => {
        closeToast();
    }, 7000);
}

function closeToast() {
    const toast = document.getElementById("sideToast");
    toast?.classList.remove("show");
}

// ARCADE MODAL & MULTI-GAME CONTROLLER
let activeGame = 'raptor';

function openArcadeModal(gameName) {
    document.getElementById('gameModal').classList.add('active');
    switchGameTab(gameName);
}

function closeGameModal() {
    document.getElementById('gameModal').classList.remove('active');
    stopAllGames();
}

function stopAllGames() {
    spaceGameRunning = false;
    slitherRunning = false;
    if (spaceAnimationFrameId) cancelAnimationFrame(spaceAnimationFrameId);
    if (slitherAnimFrameId) cancelAnimationFrame(slitherAnimFrameId);
}

function switchGameTab(gameName) {
    activeGame = gameName;
    stopAllGames();

    document.querySelectorAll('.arcade-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.arcade-tab-btn').forEach(b => b.classList.remove('active'));

    if (gameName === 'raptor') {
        document.getElementById('view-raptor').classList.add('active');
        document.getElementById('tab-raptor').classList.add('active');
        initSpaceGame();
    } else if (gameName === 'ttt') {
        document.getElementById('view-ttt').classList.add('active');
        document.getElementById('tab-ttt').classList.add('active');
        initTicTacToe();
    } else if (gameName === 'slither') {
        document.getElementById('view-slither').classList.add('active');
        document.getElementById('tab-slither').classList.add('active');
        initSlitherGame();
    }
}

// 1. SPACE RAPTOR DINO GAME
let spaceGameRunning = false;
let spaceCanvas, spaceCtx;
let raptor, meteors = [], stars = [], spaceScore = 0, spaceHighScore = 0, spaceGameSpeed = 6;
let spaceAnimationFrameId = null;

function initSpaceGame() {
    spaceCanvas = document.getElementById('spaceCanvas');
    if (!spaceCanvas) return;
    spaceCtx = spaceCanvas.getContext('2d');
    
    spaceCanvas.width = 760;
    spaceCanvas.height = 370;

    stars = [];
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * spaceCanvas.width,
            y: Math.random() * (spaceCanvas.height - 50),
            size: Math.random() * 2 + 1,
            speed: Math.random() * 1.5 + 0.5
        });
    }

    raptor = {
        x: 60,
        y: 255,
        width: 55,
        height: 55,
        vy: 0,
        gravity: 0.85,
        jumpPower: -13.5,
        isJumping: false
    };

    meteors = [];
    spaceScore = 0;
    spaceGameSpeed = 6;
    spaceGameRunning = true;

    window.addEventListener('keydown', handleSpaceInput);
    spaceCanvas.addEventListener('click', handleSpaceClick);

    if (spaceAnimationFrameId) cancelAnimationFrame(spaceAnimationFrameId);
    spaceLoop();
}

function handleSpaceInput(e) {
    if (!spaceGameRunning || activeGame !== 'raptor') return;
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jumpRaptor();
    }
}

function handleSpaceClick() {
    if (!spaceGameRunning || activeGame !== 'raptor') return;
    jumpRaptor();
}

function jumpRaptor() {
    if (!raptor.isJumping) {
        raptor.vy = raptor.jumpPower;
        raptor.isJumping = true;
    }
}

function updateSpaceGame() {
    raptor.vy += raptor.gravity;
    raptor.y += raptor.vy;

    if (raptor.y > 255) {
        raptor.y = 255;
        raptor.vy = 0;
        raptor.isJumping = false;
    }

    stars.forEach(star => {
        star.x -= star.speed;
        if (star.x < 0) star.x = spaceCanvas.width;
    });

    if (Math.random() < 0.024 && (meteors.length === 0 || meteors[meteors.length - 1].x < spaceCanvas.width - 260)) {
        meteors.push({
            x: spaceCanvas.width,
            y: 275 + Math.random() * 20,
            radius: 18 + Math.random() * 12
        });
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
        meteors[i].x -= spaceGameSpeed;

        let distX = Math.abs(meteors[i].x - (raptor.x + raptor.width / 2));
        let distY = Math.abs(meteors[i].y - (raptor.y + raptor.height / 2));

        if (distX < (raptor.width / 2 + meteors[i].radius * 0.7) && distY < (raptor.height / 2 + meteors[i].radius * 0.7)) {
            spaceGameRunning = false;
            if (spaceScore > spaceHighScore) spaceHighScore = spaceScore;
        }

        if (meteors[i].x + meteors[i].radius < 0) {
            meteors.splice(i, 1);
            spaceScore += 10;
            if (spaceScore % 100 === 0) spaceGameSpeed += 0.5;
        }
    }
}

function renderSpaceGame() {
    spaceCtx.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);

    let bgGrad = spaceCtx.createLinearGradient(0, 0, 0, spaceCanvas.height);
    bgGrad.addColorStop(0, '#03050c');
    bgGrad.addColorStop(1, '#0d162d');
    spaceCtx.fillStyle = bgGrad;
    spaceCtx.fillRect(0, 0, spaceCanvas.width, spaceCanvas.height);

    spaceCtx.fillStyle = '#ffffff';
    stars.forEach(star => {
        spaceCtx.fillRect(star.x, star.y, star.size, star.size);
    });

    spaceCtx.strokeStyle = '#00eaff';
    spaceCtx.shadowColor = '#00eaff';
    spaceCtx.shadowBlur = 10;
    spaceCtx.lineWidth = 3;
    spaceCtx.beginPath();
    spaceCtx.moveTo(0, 315);
    spaceCtx.lineTo(spaceCanvas.width, 315);
    spaceCtx.stroke();
    spaceCtx.shadowBlur = 0;

    // Raptor
    spaceCtx.save();
    spaceCtx.translate(raptor.x, raptor.y);
    spaceCtx.fillStyle = '#8B5A2B';
    spaceCtx.beginPath();
    spaceCtx.moveTo(10, 25);
    spaceCtx.lineTo(-28, 16);
    spaceCtx.lineTo(5, 32);
    spaceCtx.fill();

    spaceCtx.fillStyle = '#A0522D';
    spaceCtx.beginPath();
    spaceCtx.ellipse(22, 26, 18, 12, -0.2, 0, Math.PI * 2);
    spaceCtx.fill();

    spaceCtx.beginPath();
    spaceCtx.moveTo(30, 20);
    spaceCtx.bezierCurveTo(36, 5, 42, 2, 48, -4);
    spaceCtx.lineTo(42, -10);
    spaceCtx.bezierCurveTo(38, -2, 32, 6, 24, 16);
    spaceCtx.fill();

    spaceCtx.beginPath();
    spaceCtx.roundRect(40, -12, 22, 12, [4, 8, 4, 4]);
    spaceCtx.fill();

    spaceCtx.fillStyle = '#facc15';
    spaceCtx.beginPath();
    spaceCtx.arc(52, -7, 2.5, 0, Math.PI * 2);
    spaceCtx.fill();

    spaceCtx.fillStyle = '#8B5A2B';
    spaceCtx.fillRect(32, 20, 3, 12);
    spaceCtx.fillRect(36, 22, 3, 12);
    spaceCtx.fillRect(16, 34, 5, 14);
    spaceCtx.fillRect(26, 34, 5, 14);
    spaceCtx.restore();

    // Meteors
    meteors.forEach(m => {
        spaceCtx.save();
        spaceCtx.translate(m.x, m.y);
        spaceCtx.fillStyle = '#4a3525';
        spaceCtx.strokeStyle = '#291b11';
        spaceCtx.lineWidth = 2;
        spaceCtx.beginPath();
        spaceCtx.moveTo(0, -m.radius);
        spaceCtx.lineTo(m.radius * 0.7, -m.radius * 0.6);
        spaceCtx.lineTo(m.radius, m.radius * 0.2);
        spaceCtx.lineTo(m.radius * 0.5, m.radius);
        spaceCtx.lineTo(-m.radius * 0.6, m.radius * 0.8);
        spaceCtx.lineTo(-m.radius, -m.radius * 0.3);
        spaceCtx.closePath();
        spaceCtx.fill();
        spaceCtx.stroke();
        spaceCtx.restore();
    });

    spaceCtx.fillStyle = '#eaf7ff';
    spaceCtx.font = '15px monospace';
    spaceCtx.fillText(`HI: ${String(spaceHighScore).padStart(5, '0')}  ${String(spaceScore).padStart(5, '0')}`, spaceCanvas.width - 220, 30);

    if (!spaceGameRunning) {
        spaceCtx.fillStyle = 'rgba(7, 11, 22, 0.85)';
        spaceCtx.fillRect(0, 0, spaceCanvas.width, spaceCanvas.height);
        spaceCtx.fillStyle = '#00eaff';
        spaceCtx.font = 'bold 24px sans-serif';
        spaceCtx.textAlign = 'center';
        spaceCtx.fillText('MISSION FAILED', spaceCanvas.width / 2, spaceCanvas.height / 2 - 15);
        spaceCtx.fillStyle = '#eaf7ff';
        spaceCtx.font = '14px sans-serif';
        spaceCtx.fillText('Click or press Space / Up to Restart', spaceCanvas.width / 2, spaceCanvas.height / 2 + 20);
        spaceCtx.textAlign = 'left';
    }
}

function spaceLoop() {
    if (spaceGameRunning) updateSpaceGame();
    renderSpaceGame();
    if (activeGame === 'raptor' && document.getElementById('gameModal').classList.contains('active')) {
        spaceAnimationFrameId = requestAnimationFrame(spaceLoop);
    }
}

// 2. TIC-TAC-TOE (XOX) LOGIC
let tttBoard = ['', '', '', '', '', '', '', '', ''];
let tttTurn = 'X';
let tttActive = true;

function initTicTacToe() {
    tttBoard = ['', '', '', '', '', '', '', '', ''];
    tttTurn = 'X';
    tttActive = true;
    renderTicTacToe();
}

function handleTttClick(index) {
    if (!tttActive || tttBoard[index] !== '') return;
    tttBoard[index] = tttTurn;
    
    if (checkTttWin(tttTurn)) {
        document.getElementById('tttStatus').textContent = `Player ${tttTurn} Wins! 🎉`;
        tttActive = false;
        renderTicTacToe();
        return;
    }

    if (!tttBoard.includes('')) {
        document.getElementById('tttStatus').textContent = "It's a Draw! 🤝";
        tttActive = false;
        renderTicTacToe();
        return;
    }

    tttTurn = tttTurn === 'X' ? 'O' : 'X';
    document.getElementById('tttStatus').textContent = `Player ${tttTurn}'s Turn`;
    renderTicTacToe();
}

function checkTttWin(player) {
    const wins = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    return wins.some(combo => combo.every(i => tttBoard[i] === player));
}

function renderTicTacToe() {
    const gridEl = document.getElementById('tttGrid');
    if (!gridEl) return;
    gridEl.innerHTML = '';
    tttBoard.forEach((val, index) => {
        const cell = document.createElement('button');
        cell.className = 'ttt-cell';
        cell.textContent = val;
        cell.style.color = val === 'X' ? '#00eaff' : '#ffaa00';
        cell.addEventListener('click', () => handleTttClick(index));
        gridEl.appendChild(cell);
    });
}

// 3. SLITHER.IO ARENA GAME LOGIC
let slitherRunning = false;
let sCanvas, sCtx;
let snake = [], food = [], slitherScore = 0, slitherAnimFrameId = null;
let sDir = { x: 1, y: 0 };

function initSlitherGame() {
    sCanvas = document.getElementById('slitherCanvas');
    if (!sCanvas) return;
    sCtx = sCanvas.getContext('2d');
    sCanvas.width = 760;
    sCanvas.height = 370;

    snake = [
        { x: 200, y: 200 },
        { x: 185, y: 200 },
        { x: 170, y: 200 }
    ];
    sDir = { x: 2, y: 0 };
    slitherScore = 0;
    food = [];
    spawnFood();
    slitherRunning = true;

    window.addEventListener('keydown', handleSlitherKey);
    if (slitherAnimFrameId) cancelAnimationFrame(slitherAnimFrameId);
    slitherLoop();
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * (sCanvas.width - 40)) + 20,
        y: Math.floor(Math.random() * (sCanvas.height - 40)) + 20,
        color: ['#00eaff', '#ffaa00', '#22c55e', '#ec4899'][Math.floor(Math.random() * 4)]
    };
}

function handleSlitherKey(e) {
    if (!slitherRunning || activeGame !== 'slither') return;
    if ((e.code === 'ArrowUp' || e.code === 'KeyW') && sDir.y === 0) { sDir = { x: 0, y: -2 }; }
    if ((e.code === 'ArrowDown' || e.code === 'KeyS') && sDir.y === 0) { sDir = { x: 0, y: 2 }; }
    if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && sDir.x === 0) { sDir = { x: -2, y: 0 }; }
    if ((e.code === 'ArrowRight' || e.code === 'KeyD') && sDir.x === 0) { sDir = { x: 2, y: 0 }; }
}

function updateSlitherGame() {
    const head = { x: snake[0].x + sDir.x, y: snake[0].y + sDir.y };

    if (head.x < 0 || head.x > sCanvas.width || head.y < 0 || head.y > sCanvas.height) {
        slitherRunning = false;
        return;
    }

    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            slitherRunning = false;
            return;
        }
    }

    snake.unshift(head);

    let dist = Math.hypot(head.x - food.x, head.y - food.y);
    if (dist < 18) {
        slitherScore += 15;
        spawnFood();
    } else {
        snake.pop();
    }
}

function renderSlitherGame() {
    sCtx.fillStyle = '#050811';
    sCtx.fillRect(0, 0, sCanvas.width, sCanvas.height);

    sCtx.fillStyle = food.color;
    sCtx.beginPath();
    sCtx.arc(food.x, food.y, 7, 0, Math.PI * 2);
    sCtx.fill();

    snake.forEach((seg, index) => {
        sCtx.fillStyle = index === 0 ? '#00eaff' : '#0077ff';
        sCtx.beginPath();
        sCtx.arc(seg.x, seg.y, index === 0 ? 9 : 7, 0, Math.PI * 2);
        sCtx.fill();
    });

    sCtx.fillStyle = '#fff';
    sCtx.font = '15px monospace';
    sCtx.fillText(`SCORE: ${slitherScore}`, 20, 30);

    if (!slitherRunning) {
        sCtx.fillStyle = 'rgba(5, 8, 17, 0.85)';
        sCtx.fillRect(0, 0, sCanvas.width, sCanvas.height);
        sCtx.fillStyle = '#ffaa00';
        sCtx.font = 'bold 24px sans-serif';
        sCtx.textAlign = 'center';
        sCtx.fillText('GAME OVER', sCanvas.width / 2, sCanvas.height / 2 - 10);
        sCtx.fillStyle = '#fff';
        sCtx.font = '14px sans-serif';
        sCtx.fillText('Switch tabs or reopen game to restart', sCanvas.width / 2, sCanvas.height / 2 + 25);
        sCtx.textAlign = 'left';
    }
}

function slitherLoop() {
    if (slitherRunning) updateSlitherGame();
    renderSlitherGame();
    if (activeGame === 'slither' && document.getElementById('gameModal').classList.contains('active')) {
        slitherAnimFrameId = requestAnimationFrame(slitherLoop);
    }
}