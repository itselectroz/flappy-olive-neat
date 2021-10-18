function makeNetwork(nodes, cons) {
    let network = new Network();

    for (let i = 0; i < cons.length; i++) {
        let conn = cons[i];
        conn.in = nodes[conn.in];
        conn.out = nodes[conn.out];
        network.addConnection(conn);
    }

    return network;
}

class Olive {
    constructor(pos, brain) {
        this.pos = !!pos ? pos : new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
        this.acceleration = new Vector2(0, 0);

        this.image = new Image();
        this.image.src = 'data/olive.png';

        this.crashed = false;
        this.score = 0;

        if(!brain ) {
            this.brain = makeNetwork([
                new Node(1, 0), // pipe height
                new Node(2, 3) // output
            ], [
                new ConnectionGene(0, 1, Math.random(), true, 1),
            ]);
    
            // Randomise brain
            const nodeNum = Math.floor(Math.random() * 5);
            for (let i = 0; i < nodeNum; i++) {
                this.brain.addRandomNode();
            }
    
            const connectionNum = Math.floor(Math.random() * 5);
            for (let i = 0; i < connectionNum; i++) {
                this.brain.addRandomConnection();
            }
    
            // const mutationNum = Math.floor(Math.random() * 5);
            // for (let i = 0; i < mutationNum; i++) {
            //     this.brain.mutate(true);
            // }
    
            this.brain.buildNetwork();
        }
        else {
            this.brain = brain;
        }        
    }

    applyForce(force) {
        if (!force || !(force instanceof Vector2)) {
            return false;
        }
        this.acceleration = this.acceleration.add(force);
        return true;
    }

    update(frame, closestPipeY) {
        if (this.crashed)
            return;

        const dist = (this.pos.y - closestPipeY)

        if (frame % 10 == 0) {

            const output = this.brain.feedForward([
                dist
            ]);

            if (output >= 0.75) {
                this.velocity = new Vector2(0, 0);
                this.applyForce(new Vector2(0, -400));
            }
        }

        this.velocity = this.velocity.add(this.acceleration).limit(maxVelocity);
        this.pos = this.pos.add(this.velocity.div(100));
        this.acceleration = new Vector2(0, 0);

        if (this.pos.y < 0) {
            this.pos.y = 0;
        }
        if (this.pos.y > window.innerHeight) {
            this.pos.y = window.innerHeight;
        }
    }

    draw(ctx) {
        if (this.crashed)
            return;
        ctx.drawImage(this.image, this.pos.x - 25, this.pos.y - 25, 50, 50);
    }

    crash() {
        this.crashed = true;
    }
}