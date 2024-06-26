class _vec2 {
    constructor(x, y) {
        if (x == undefined) {
            this.x = 0;
            this.y = 0;
        } else if (y == undefined) {
            if (typeof x == "object") {
                if (x.length == 2) {
                    this.x = x[0];
                    this.y = x[1];
                } else {
                    this.x = x[0];
                    this.y = x[0];
                }
            } else {
                this.x = x;
                this.y = 0;
            }
        } else {
            this.x = x;
            this.y = y;
        }
    }
}

export function vec2(...args) {
    return new _vec2(...args);
}
