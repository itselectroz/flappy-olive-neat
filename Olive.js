class Olive {
    constructor(pos) {
        this.pos = !!pos ? pos : new Vector2(0, 0);
        this.velocity = new Vector2(0, 0);
        this.acceleration = new Vector2(0, 0);
        
        this.image = new Image();
        this.image.src = 'data/olive.png';

        this.crashed = false;
        this.score = 0;
    }

    applyForce(force) {
        if(!force || !(force instanceof Vector2)) { 
            return false;
        }
        this.acceleration = this.acceleration.add(force);
        return true;
    }

    update(frame) {
        this.velocity = this.velocity.add(this.acceleration).limit(maxVelocity);
        this.pos = this.pos.add(this.velocity.div(100));
        this.acceleration = new Vector2(0, 0);

        if(this.pos.y < 0) {
            this.pos.y = 0;
        }
        if(this.pos.y > window.innerHeight) {
            this.pos.y = window.innerHeight;
        }
    }

    draw(ctx) {
        if(this.crashed)
            return;
        ctx.drawImage(this.image, this.pos.x - 25, this.pos.y - 25, 50, 50);
    }

    crash() {
        this.crashed = true;
    }
}