class Pipe { 
    constructor(pos) {
        this.pos = !!pos ? pos : new Vector2(0, 0);
        this.gap = 160;
        this.width = 40;

        this.scored = false;
    }

    update(frame) {
        this.pos.x -= 5;
    }

    draw(ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.pos.x - (this.width / 2), 0, this.width, this.pos.y - (this.gap / 2));
        ctx.fillRect(this.pos.x - (this.width / 2), this.pos.y + (this.gap / 2), this.width, window.innerHeight);
    }

    collides(pos) {
        if(!pos || !(pos instanceof Vector2)) {
            return false;
        }

        if(pos.x >= this.pos.x - (this.width / 2) && pos.x <= this.pos.x + this.width / 2) {
            // Top pipe
            if(pos.y <= this.pos.y - (this.gap / 2)) {
                return true;
            }

            // Bottom pipe
            if(pos.y >= this.pos.y + (this.gap / 2)) {
                return true;
            }
        }

        return false;
    }
}