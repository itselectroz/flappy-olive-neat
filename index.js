// Lets think about network design

/* 
Inputs:
    - Height to center of next pipe
    - current velocity

Outputs:
    - jump

*/


let canvas, ctx;
let selectedOlive, prevBestOlive;

let frame = 0;

const olives = [];
const pipes = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx = canvas.getContext('2d');
}

function events() {
    window.addEventListener('resize', resizeCanvas);
    // window.addEventListener('keypress', () => {
    //     for(const olive of olives) {
    //         olive.velocity = new Vector2(0, 0);
    //         olive.applyForce(new Vector2(0, -400));
    //     }
    // })
}

function setupPipes() {
    for(let i = 0; i < numPipes; i++) {
        pipes[i] = new Pipe(new Vector2(((window.innerWidth / numPipes) * i) + 2 * window.innerWidth / 3, (window.innerHeight / 2) + (Math.random() * pipeVariation * 2) - pipeVariation));
    }
}

function setupOlives() {
    for(let i = 0; i < populationSize; i++) {
        const variation = (Math.random() * 200) - 100
        let olive = new Olive(new Vector2(window.innerWidth / 3, (window.innerHeight / 2) + variation));
        olives[i] = olive;
    }
}

function nextGeneration() {
    // perform selection, crossover, mutation

    let highestScore = 0;
    let bestOlive = null;
    for(const olive of olives) {
        if(olive.score > highestScore) {
            highestScore = olive.score;
            bestOlive = olive;
        }
    }

    prevBestOlive = bestOlive;

    // selection
    const selectionPool = [];
    for(const olive of olives) {
        const count = olive.score * 100 + 1;
        for(let i = 0; i < count; i++) {
            selectionPool.push(olive.brain);
        }
    }

    for(let i = 0; i < populationSize; i++) {
        const father = selectionPool[Math.floor(Math.random() * selectionPool.length)];
        const mother = selectionPool[Math.floor(Math.random() * selectionPool.length)];

        // Crossover
        const newBrain = Network.cross(father, mother);

        // mutation
        newBrain.mutate();

        newBrain.buildNetwork();

        const variation = (Math.random() * 200) - 100
        olives[i] = new Olive(new Vector2(window.innerWidth / 3, (window.innerHeight / 2) + variation), newBrain);
    }

    setupPipes();

    selectedOlive = null;
}

function update() {
    const oliveX = window.innerWidth / 3;
    let closestX = Infinity
    let closestY = Infinity
    for(const pipe of pipes) {
        const dist = pipe.pos.x - oliveX;
        if(dist > 0 && dist < closestX) {
            closestX = dist;
            closestY = pipe.pos.y;
        }
    }

    let alive = false;
    for(const olive of olives) {
        olive.update(frame, closestY);
        if(!olive.crashed) {
            alive = true;
        }
    }

    if(!alive) {
        nextGeneration();
        return;
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
                for(const olive of olives) {
                    olive.score++;
                    if(olive.score >= 20) {
                        nextGeneration();
                    }
                }
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

function getCurrentHighestFitness() {
    let highestScore = 0;
    for(const olive of olives) {
        if(olive.score > highestScore) {
            highestScore = olive.score;
        }
    }
    return highestScore;
}

function drawNetwork(ctx, network) {
    const locations = {};

    let drawX = window.innerWidth - 500 + 25;

    let maxLevel = 0;

    // Draw all but output nodes
    const nodesToDraw = [];
    for(const node of network.nodes) {
        if(node.type == 3) {
            continue;
        }

        // If input node
        if(node.type <= 1) {
            if(!nodesToDraw[0]) {
                nodesToDraw[0] = [];
            }

            nodesToDraw[0].push(node);
        }
        else {
            const level = network.connections.filter(conn => conn.out.id == node.id).length;
            if(!nodesToDraw[level]) {
                nodesToDraw[level] = [];
            }

            nodesToDraw[level].push(node);

            if(level > maxLevel) {
                maxLevel = level;
            }
        }
    }


    for(let level = 0; level < nodesToDraw.length; level++) {
        const nodes = nodesToDraw[level];
        if(!nodes) {
            continue;
        }
        for(let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if(node.type == 0 || node.type == 1) {
                ctx.fillStyle = "green";
            }
            else if(node.type == 2) {
                ctx.fillStyle = "white";
            }
    
            ctx.beginPath();
            ctx.arc(drawX + 50 * level + 20 * i, 150 + 45 * i, 15, 0, 2 * Math.PI);
            ctx.fill();

            locations[node.id] = {
                x: drawX + 50 * level + 20*i,
                y: 150 + 45 * i
            };
        }
    }

    // draw output nodes
    let count = 2;
    ctx.fillStyle = "red";
    for(let i = 0; i < network.nodes.length; i++) {
        const node = network.nodes[i];
        if(node.type == 3) {
            ctx.beginPath();
            ctx.arc(drawX + (50 * (maxLevel + 1)) + 20*count, 150 + 45 * count, 15, 0, 2 * Math.PI);
            ctx.fill();

            locations[node.id] = {
                x: drawX + (50 * (maxLevel + 1)) + 20*count,
                y: 150 + 45 * count
            };

            count++;
        }
    }

    // Draw connections

    for(const conn of network.connections) {
        const colourStyle = conn.enabled ? "white" : "gray";

        ctx.beginPath();
        ctx.lineWidth = 5;
        ctx.fillStyle = colourStyle;
        ctx.strokeStyle = colourStyle;

        const pointA = locations[conn.in.id];
        const pointB = locations[conn.out.id];

        ctx.moveTo(pointA.x, pointA.y);
        ctx.lineTo(pointB.x, pointB.y);
        ctx.stroke();
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

    // Black square in top right
    ctx.fillStyle = "black";
    ctx.fillRect(rect.width - 500, 0, 500, 300);

    if(!selectedOlive || selectedOlive.crashed) {
        const selectionPool = olives.filter(v => !v.crashed);
        selectedOlive = selectionPool[Math.floor(Math.random() * selectionPool.length)];
    }

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(`Previous Best Score: ${!!prevBestOlive ? prevBestOlive.score : '0'}`, rect.width - 500, 40);

    const highestFitness = getCurrentHighestFitness();
    ctx.fillText(`Current highest score: ${highestFitness}`, rect.width - 500, 75);

    drawNetwork(ctx, selectedOlive.brain);
}

function setup() {
    canvas = document.getElementById('canvas');

    setupPipes();
    setupOlives();    

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