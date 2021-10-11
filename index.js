let canvas, ctx;

let frame = 0;

const olives = [];
const pipes = [];

for(let i = 0; i < numPipes; i++) {
    pipes.push(new Pipe(new Vector2((window.innerWidth / numPipes) * i, (window.innerHeight / 2) + (Math.random() * pipeVariation * 2) - pipeVariation)))
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx = canvas.getContext('2d');
}

function events() {
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('keypress', () => {
        for(const olive of olives) {
            olive.velocity = new Vector2(0, 0);
            olive.applyForce(new Vector2(0, -400));
        }
    })
}

function update() {
    for(const olive of olives) {
        olive.update(frame);
    }

    for(let i = 0; i < pipes.length; i++) {
        const pipe = pipes[i];
        pipe.update(frame);
        if(pipe.pos.x < 0) {
            pipe.pos.x = window.innerWidth;

            const previousPipe = pipes[i == 0 ? pipes.length - 1 : i - 1];

            const offset = (Math.random() * pipeVariation * 2) - pipeVariation;

            let newHeight = previousPipe.pos.y + offset;

            if(previousPipe.pos.y == pipeBorder) {
                newHeight += pipeVariation / 3;
            }
            if(previousPipe.pos.y == window.innerHeight - pipeBorder) {
                newHeight -= pipeVariation / 3;
            }

            newHeight = Math.max(newHeight, pipeBorder);

            newHeight = Math.min(newHeight, window.innerHeight - pipeBorder);

            pipe.pos.y = newHeight;
            pipe.scored = false;
        }
        else {
            if(pipe.pos.x < window.innerWidth / 3 && !pipe.scored) {
                // add score
                pipe.scored = true;
            }

            for(const olive of olives) {
                if(pipe.collides(olive.pos)) {
                    olive.crash()
                }
            }
        }
    }
}

function draw() {
    const rect = canvas.getBoundingClientRect();
    
    // Draw background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, rect.width, rect.height);

    for(const pipe of pipes) {
        pipe.draw(ctx);
    }

    for(const olive of olives) {
        olive.applyForce(new Vector2(0, 20))

        olive.draw(ctx);
    }
}

function setup() {
    canvas = document.getElementById('canvas');

    for(let i = 0; i < populationSize; i++) {
        const variation = (Math.random() * 200) - 100
        let olive = new Olive(new Vector2(window.innerWidth / 3, (window.innerHeight / 2) + variation));
        olives.push(olive);
    }

    resizeCanvas();

    events();

    let interval;
    interval = setInterval(() => {
        frame++;
        update();
        draw();
    }, 1000 / tickSpeed);
}

window.addEventListener('load', setup);