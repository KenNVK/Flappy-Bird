// select canvas
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

// vars and constants
let frames = 0;
const DEGREE = Math.PI / 180;

// Load image
const image = new Image();
image.src = "images/sprite.png";
const image1 = new Image();
image1.src = "images/gameover.png";
const image2 = new Image();
image2.src = "images/startbutton.png";

// Load sound
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

// State
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
}

// start button
const startBtn = {
    x: 325,
    y: 264,
    w: 83,
    h: 29
}

// control game
canvas.addEventListener("click", function (event) {
    switch (state.current) {
        case state.getReady:
            state.current = state.game;
            SWOOSHING.play();
            break;
        case state.game:
            if (bird.y - bird.radius <= 0) return;
            bird.flap();
            FLAP.play();
            break;
        case state.over:
            let rect = canvas.getBoundingClientRect();
            let clickX = event.clientX - rect.left;
            let clickY = event.clientY - rect.top;

            // check click start button
            if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
            }
            break;
    }
});

document.addEventListener('keydown', function (event) {
    if (event.keyCode == 32) {
        switch (state.current) {
            case state.getReady:
                state.current = state.game;
                SWOOSHING.play();
                break;
            case state.game:
                if (bird.y - bird.radius <= 0) return;
                bird.flap();
                FLAP.play();
                break;
            case state.over:
                let rect = canvas.getBoundingClientRect();
                let clickX = event.clientX - rect.left;
                let clickY = event.clientY - rect.top;

                // check click start button
                if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
                    pipes.reset();
                    bird.speedReset();
                    score.reset();
                    state.current = state.getReady;
                }
                break;
        }
    }
});


// Create backbround
const bg = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    x: 0,
    y: canvas.height - 226,

    draw: function () {
        context.drawImage(image, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        context.drawImage(image, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
        context.drawImage(image, this.sX, this.sY, this.w, this.h, this.x + this.w + this.w, this.y, this.w, this.h);
    }

}

// Create base
const fg = {
    sX: 276,
    sY: 0,
    w: 224,
    h: 112,
    x: 0,
    y: canvas.height - 112,

    dx: 4,

    draw: function () {
        context.drawImage(image, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        context.drawImage(image, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
        context.drawImage(image, this.sX, this.sY, this.w, this.h, this.x + this.w + this.w, this.y, this.w, this.h);
        context.drawImage(image, this.sX, this.sY, this.w, this.h, this.x + this.w + this.w + this.w, this.y, this.w, this.h);
        context.drawImage(image, this.sX, this.sY, this.w, this.h, this.x + this.w + this.w + this.w + this.w, this.y, this.w, this.h);
    },

    update: function () {
        if (state.current == state.game) {
            this.x = (this.x - this.dx) % (this.w / 2);
        }
    }
}

// Create bird
const bird = {
    animation: [
        { sX: 276, sY: 112 },
        { sX: 276, sY: 139 },
        { sX: 276, sY: 164 },
        { sX: 276, sY: 139 }
    ],
    x: 100,
    y: 100,
    w: 34,
    h: 26,

    radius: 12,

    frame: 0,

    gravity: 0.25,
    jump: 4.6,
    speed: 0,
    rotation: 0,

    draw: function () {
        let bird = this.animation[this.frame];

        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.rotation);
        context.drawImage(image, bird.sX, bird.sY, this.w, this.h, - this.w / 2, - this.h / 2, this.w, this.h);

        context.restore();
    },

    flap: function () {
        this.speed = - this.jump;
    },

    update: function () {
        // If game is getready, bird flap 
        this.period = state.current == state.getReady ? 10 : 5;
        // Increment frame 1
        this.frame += frames % this.period == 0 ? 1 : 0;
        // frame from 0 to 4, after return 0
        this.frame = this.frame % this.animation.length;

        if (state.current == state.getReady) {
            this.y = 150;
            this.rotation = 0 * DEGREE;
        } else {
            this.speed += this.gravity;
            this.y += this.speed;

            if (this.y + this.h / 2 >= canvas.height - fg.h) {
                this.y = canvas.height - fg.h - this.h / 2;
                if (state.current == state.game) {
                    state.current = state.over;
                    DIE.play();
                }
            }
            if (this.speed >= this.jump) {
                this.rotation = 90 * DEGREE;
                this.frame = 1;
            } else {
                this.rotation = -25 * DEGREE;
            }
        }

    },
    speedReset: function () {
        this.speed = 0;
    }
}

// GetReady
const getReady = {
    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: canvas.width / 2 - 173 / 2,
    y: 80,

    draw: function () {
        if (state.current == state.getReady) {
            context.drawImage(image, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }

}

// GameOver
const gameOver = {
    x: 270,
    y: 50,
    draw: function () {
        if (state.current == state.over) {
            context.drawImage(image1, this.x, this.y);
            context.drawImage(image2, 320, 264)
        }
    }
}

// Create Pipes
const pipes = {
    position: [],

    top: {
        sX: 553,
        sY: 0
    },
    bottom: {
        sX: 502,
        sY: 0
    },

    w: 53,
    h: 400,
    gap: 100,
    maxYPos: -150,
    dx: 4,

    draw: function () {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            context.drawImage(image, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);
            context.drawImage(image, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
        }
    },

    update: function () {
        if (state.current !== state.game) return;

        if (frames % 50 == 0) {
            this.position.push({
                x: canvas.width,
                y: this.maxYPos * (Math.random() + 1)
            });
        }
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let bottomPipeYPos = p.y + this.h + this.gap;

            // Collision detection
            // Top
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
                state.current = state.over;
                HIT.play();
            }
            // Bottom
            if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h) {
                state.current = state.over;
                HIT.play();
            }

            // Move pipe
            p.x -= this.dx;

            // if the pipes go beyond canvas,  delete ...
            if (p.x + this.w  <= 0  ){
                this.position.shift();
                score.value ++;
                SCORE_S.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
        }
    },

    reset: function () {
        this.position = [];
    }

}

// Score
const score = {
    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,

    draw: function () {
        context.fillStyle = "#FFF";
        context.strokeStyle = "#000";

        if (state.current == state.game) {
            context.lineWidth = 2;
            context.font = "35px Teko";
            context.fillText(this.value, canvas.width / 2, 50);
            context.strokeText(this.value, canvas.width / 2, 50);

        } else if (state.current == state.over) {
            context.font = "35px Teko";
            context.fillText("Score: " + this.value, 305, 184);
            context.fillText("Best: " + this.best, 305, 226);
        }
    },

    reset: function () {
        this.value = 0;
    }
}

// Draw
function draw() {
    context.fillStyle = "#70c5ce";
    context.fillRect(0, 0, canvas.width, canvas.height);

    bg.draw();
    pipes.draw();
    fg.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

// Update
function update() {
    bird.update();
    fg.update();
    pipes.update();
}

// Loop
function loop() {
    update();
    draw();
    frames++;

    requestAnimationFrame(loop);
}
loop();
