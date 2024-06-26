class _Image {
    constructor(url, body, pos, size, border = false) {
        this.img = document.createElement("img");

        this.img.src = url;
        this.img.alt = "Not loaded...";
        this.img.classList.add("figure");
        //this.img.style.zIndex = 2;
        this.width = size.x;
        this.name = url.slice(-6, -4);
        this.figure = {};
        this.ignore = false;

        if (size.y < 1) {
            this.height = size.x;
        } else {
            this.height = size.y;
        }
        if (pos != undefined) {
            this.posx = pos.x;
            this.posy = pos.y;
            //this.img.style.transform = `translate(${this.posx}px, ${this.posy}px)`;

            if (border) {
            }

            body.ImageAttach(this);
        } else {
            console.log("position is out of range");
        }
    }
}

export function Image(...args) {
    return new _Image(...args);
}
