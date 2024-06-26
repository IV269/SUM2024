import { vec2, Image } from "./lib.js";

class _Board {
    constructor(canvas, nx, blackcolor = "rgb(12,36,98)", whitecolor = "rgb(178 189,231)") {
        this.can = canvas;
        let ny = nx;
        if (nx > 5) {
            this.nx = nx;
        } else {
            this.nx = 8;
        }
        if (ny < 1) {
            this.ny = this.nx;
        } else {
            if (ny > 5) {
                this.ny = ny;
            } else {
                this.ny = this.nx;
            }
        }
        this.blackcolor = blackcolor;
        this.whitecolor = whitecolor;
        this.prevx = 0;
        this.prevy = 0;
        this.prevWidth = this.can.width;
        this.prevHeight = this.can.height;

        this.offsetL = this.can.offsetLeft;

        this.offsetT = this.can.offsetTop + 50;

        this.w = this.can.width;
        this.h = this.can.height;
        this.constW = this.can.width;
        this.constH = this.can.height;
        this.cellSizeW = this.w / this.nx;
        this.cellSizeH = this.h / this.ny;
        this.board = [];
        this.lastMoved = [-1, -1];
        this.isLongP = false;
        this.enPasant = false;
        this.color = "w";
        this.posKings = {};
        this.lastPiece = vec2(-2, -2);
        this.Poses = new Set();
        this.isUnderCheckB = false;
        this.isUnderCheckW = false;
        this.isMate = false;

        for (let y = 0; y < this.ny; y++) {
            this.board[y] = [];
        }
        for (let y = 0; y < this.ny; y++) {
            for (let x = 0; x < this.nx; x++) {
                if ((x + y) % 2 == 1) {
                    this.board[this.ny - y - 1][x] = ["w", undefined];
                } else {
                    this.board[this.ny - y - 1][x] = ["b", undefined];
                }
            }
        }
    }

    UpdateInfo(canvas, size) {
        let width = size.x;
        let height = size.y;
        let kx = 0,
            ky = 0;
        let diff = 0;
        if (width < this.w) {
            kx = Math.ceil((this.w - width) / this.nx);
        }
        if (height < this.h) {
            ky = Math.ceil((this.h - height) / this.ny);
        }
        diff = Math.max(kx * this.nx, ky * this.ny);
        if (diff == 0 && this.prevx >= 0 && this.prevy >= 0) {
            if (this.w < this.constW && width > this.w) {
                kx = Math.ceil((width - this.w) / this.nx);
            }
            if (this.h < this.constH && height > this.h) {
                ky = Math.ceil((height - this.h) / this.ny);
            }
            if (!(this.prevx == -1 || this.prevy == -1)) {
                diff = -Math.min(Math.max(kx * this.nx, ky * this.ny), Math.min(height - this.h, width - this.w));
            }
        }
        canvas.width -= diff;
        canvas.height -= diff;
        if (canvas.width > this.constW || canvas.height > this.constH) {
            canvas.width = this.constW;
            canvas.height = this.constH;
        }
        this.prevx = width - this.prevWidth;
        this.prevy = height - this.prevHeight;
        this.prevWidth = width;
        this.prevHeight = height;
        if (diff == 0) {
            this.prevx = 0;
            this.prevy = 0;
        }
        this.can = canvas;

        this.w = this.can.width;
        this.h = this.can.height;
        this.offsetL = this.can.offsetLeft;

        this.cellSizeW = this.w / this.nx;
        this.cellSizeH = this.h / this.ny;

        this.offsetT = this.can.offsetTop + 50;
        for (let y = 0; y < this.ny; y++) {
            for (let x = 0; x < this.nx; x++) {
                if (this.board[y][x][1] != undefined) {
                    this.board[y][x][1].width = this.w / this.nx;
                    this.board[y][x][1].height = this.h / this.ny;
                    this.ImageAttach(this.board[y][x][1]);
                }
            }
        }
    }

    DrawBoard() {
        let ctx = this.can.getContext("2d");
        ctx.beginPath();
        for (let y = 0; y < this.ny; y++) {
            for (let x = 0; x < this.nx; x++) {
                if (this.board[y][x][0][0] == "b") {
                    ctx.fillStyle = this.blackcolor;
                } else {
                    ctx.fillStyle = this.whitecolor;
                }
                ctx.fillRect((x * this.w) / this.nx, (y * this.h) / this.ny, ((x + 1) * this.w) / this.nx, ((y + 1) * this.h) / this.ny);
            }
        }
        ctx.stroke();
    }

    DrawFigures() {
        let ctx = this.can.getContext("2d");
        ctx.beginPath();

        if (this.isMate) {
            if (this.color == "w") {
                if (this.board[this.posKings.w[0]][this.posKings.w[1]][0].slice(2, 3) == "K") {
                    this.board[this.posKings.w[0]][this.posKings.w[1]][0] = this.board[this.posKings.w[0]][this.posKings.w[1]][0].slice(0, 1);
                    this.board[this.posKings.w[0]][this.posKings.w[1]][1] = undefined;
                    Image("./Figures/wS.png", this, vec2(this.posKings.w[1], this.ny - this.posKings.w[0] - 1), vec2(this.cellSizeW));
                }
            } else {
                if (this.board[this.posKings.b[0]][this.posKings.b[1]][0].slice(2, 3) == "K") {
                    this.board[this.posKings.b[0]][this.posKings.b[1]][0] = this.board[this.posKings.b[0]][this.posKings.b[1]][0].slice(0, 1);
                    this.board[this.posKings.b[0]][this.posKings.b[1]][1] = undefined;
                    Image("./Figures/bS.png", this, vec2(this.posKings.b[1], this.ny - this.posKings.b[0] - 1), vec2(this.cellSizeW));
                }
            }
        } else if (this.isPat) {
            if (this.board[this.posKings.w[0]][this.posKings.w[1]][0].slice(2, 3) == "K" && this.board[this.posKings.w[0]][this.posKings.w[1]][0].slice(1, 2) == "w") {
                this.board[this.posKings.w[0]][this.posKings.w[1]][0] = this.board[this.posKings.w[0]][this.posKings.w[1]][0].slice(0, 1);
                this.board[this.posKings.w[0]][this.posKings.w[1]][1] = undefined;
                Image("./Figures/wS.png", this, vec2(this.posKings.w[1], this.ny - this.posKings.w[0] - 1), vec2(this.cellSizeW));
            } else if (
                this.board[this.posKings.b[0]][this.posKings.b[1]][0].slice(2, 3) == "K" &&
                this.board[this.posKings.b[0]][this.posKings.b[1]][0].slice(1, 2) == "b"
            ) {
                this.board[this.posKings.b[0]][this.posKings.b[1]][0] = this.board[this.posKings.b[0]][this.posKings.b[1]][0].slice(0, 1);
                this.board[this.posKings.b[0]][this.posKings.b[1]][1] = undefined;
                Image("./Figures/bS.png", this, vec2(this.posKings.b[1], this.ny - this.posKings.b[0] - 1), vec2(this.cellSizeW));
            }
        }

        for (let y = 0; y < this.ny; y++) {
            for (let x = 0; x < this.nx; x++) {
                if (this.board[y][x][1] != undefined) {
                    ctx.drawImage(
                        this.board[y][x][1].img,
                        this.board[y][x][1].posx * this.cellSizeW,
                        (this.ny - this.board[y][x][1].posy - 1) * this.cellSizeH,
                        this.board[y][x][1].width,
                        this.board[y][x][1].height
                    );
                }
            }
        }
        ctx.stroke();
    }

    DrawBorder() {
        let ctx = this.can.getContext("2d");
        ctx.beginPath();

        ctx.moveTo(0, 0);
        ctx.lineTo(this.w, 0);
        ctx.stroke();
        ctx.moveTo(0, 0);
        ctx.moveTo(this.w, 0);
        ctx.lineTo(this.w, this.h);
        ctx.stroke();
        ctx.moveTo(this.w, this.h);
        ctx.lineTo(0, this.h);
        ctx.stroke();
        ctx.moveTo(0, this.h);
        ctx.lineTo(0, 0);
        ctx.stroke();
    }

    DrawPosMoves(pos, curpos = undefined, poscolor = "#c22958", eatcolor = "#76e08c", movecolor = "#e07693") {
        if (pos == undefined) {
            return;
        }
        let x1 = pos.x;
        let y1 = pos.y;
        if (x1 == undefined || y1 == undefined || x1 < 0 || y1 < 0 || x1 >= this.nx || y1 >= this.ny) {
            return;
        }
        let ctx = this.can.getContext("2d");
        ctx.beginPath();
        let IsSame = false;
        if (this.lastPiece.x >= 0 && this.lastPiece.y >= 0 && this.lastPiece.x < this.nx && this.lastPiece.y < this.ny) {
            if (x1 == this.lastPiece.x && y1 == this.lastPiece.y) {
                IsSame = true;
            } else {
                this.Poses.clear();
            }
        } else {
            this.Poses.clear();
        }
        this.lastPiece = vec2(pos.x, pos.y);
        if (!IsSame) {
            for (let y = 0; y < this.ny; y++) {
                for (let x = 0; x < this.nx; x++) {
                    if (y == y1 && x == x1) {
                        ctx.fillStyle = poscolor;
                        ctx.fillRect((x1 * this.w) / this.nx, (y1 * this.h) / this.ny, this.w / this.nx, this.h / this.ny);
                        this.Poses.add(["old", vec2(x1, y1)]);
                    } else {
                        if (this.board[y1][x1][1] != undefined && this.canMove(x1, y1, x, y, false)) {
                            let posx, posy, a;
                            if (this.board[y][x][1] == undefined && !this.enPasant) {
                                ctx.fillStyle = poscolor;
                                a = Math.min(this.w / this.nx, this.h / this.ny) / 4;
                                posx = (x * this.w + this.w / 2) / this.nx - a / 2;
                                posy = (y * this.h + this.h / 2) / this.ny - a / 2;
                                ctx.fillRect(posx, posy, a, a);
                                this.Poses.add(["norm", vec2(x, y)]);
                            } else {
                                ctx.fillStyle = eatcolor;
                                a = this.w / this.nx;
                                let b = this.h / this.ny;
                                posx = (x * this.w) / this.nx;
                                posy = (y * this.h) / this.ny;
                                ctx.fillRect(posx, posy, a, b);
                                this.Poses.add(["eat", vec2(x, y)]);
                            }
                        }
                    }
                }
            }
        } else {
            let posx, posy, a, b;
            for (const item of this.Poses) {
                if (item[0] == "norm") {
                    ctx.fillStyle = poscolor;
                    a = Math.min(this.w / this.nx, this.h / this.ny) / 4;
                    posx = (item[1].x * this.w + this.w / 2) / this.nx - a / 2;
                    posy = (item[1].y * this.h + this.h / 2) / this.ny - a / 2;
                    ctx.fillRect(posx, posy, a, a);
                } else if (item[0] == "eat") {
                    ctx.fillStyle = eatcolor;
                    a = this.w / this.nx;
                    b = this.h / this.ny;
                    posx = (item[1].x * this.w) / this.nx;
                    posy = (item[1].y * this.h) / this.ny;
                    ctx.fillRect(posx, posy, a, b);
                } else if (item[0] == "old") {
                    ctx.fillStyle = poscolor;
                    ctx.fillRect((item[1].x * this.w) / this.nx, (item[1].y * this.h) / this.ny, this.w / this.nx, this.h / this.ny);
                }
            }
        }
        if (curpos != undefined) {
            let x2 = curpos.x;
            let y2 = curpos.y;
            if (x2 == undefined || y2 == undefined || x2 < 0 || y2 < 0 || x2 >= this.nx || y2 >= this.ny || (x1 == x2 && y1 == y2)) {
                return;
            }
            ctx.fillStyle = movecolor;
            ctx.fillRect((x2 * this.w) / this.nx, (y2 * this.h) / this.ny, this.w / this.nx, this.h / this.ny);
        }
        ctx.stroke();
    }

    DrawCheck(CheckColor = "#f7e87dce", DeathColor = "#3e3d3cce") {
        if (this.isUnderCheckB || this.isUnderCheckW || this.isPat) {
            let ctx = this.can.getContext("2d");
            ctx.beginPath();
            let pos, x3, y3;
            if (this.isUnderCheckB) {
                pos = this.posKings.b;
            } else {
                pos = this.posKings.w;
            }
            x3 = pos[1];
            y3 = pos[0];
            if (this.isMate) {
                ctx.fillStyle = DeathColor;
            } else {
                ctx.fillStyle = CheckColor;
            }
            if (!this.isPat) {
                ctx.fillRect((x3 * this.w) / this.nx, (y3 * this.h) / this.ny, this.w / this.nx, this.h / this.ny);
            } else if (this.isPat) {
                ctx.fillStyle = DeathColor;
                pos = this.posKings.b;
                x3 = pos[1];
                y3 = pos[0];
                ctx.fillRect((x3 * this.w) / this.nx, (y3 * this.h) / this.ny, this.w / this.nx, this.h / this.ny);

                pos = this.posKings.w;
                x3 = pos[1];
                y3 = pos[0];
                ctx.fillRect((x3 * this.w) / this.nx, (y3 * this.h) / this.ny, this.w / this.nx, this.h / this.ny);
            }
            ctx.stroke();
        }
    }

    GetPosBoard(H, W) {
        if (typeof H != "object") {
            if (W == undefined || H == undefined || W < this.offsetT || W > this.offsetT + this.w || H < this.offsetL || H > this.offsetL + this.h) {
                return undefined;
            }
            return vec2(Math.floor(((H - this.offsetL) / this.h) * this.ny), Math.floor(((W - this.offsetT) / this.w) * this.nx));
        }
        if (H.x == undefined || H.y == undefined || H.x < this.offsetT || H.x > this.offsetT + this.w || H.y < this.offsetL || H.y > this.offsetL + this.h) {
            return undefined;
        }
        return vec2(Math.floor(((H.y - this.offsetL) / this.h) * this.ny), Math.floor(((H.x - this.offsetT) / this.w) * this.nx));
    }

    GetPosReal(Y, X) {
        if (typeof Y != "object") {
            if (X == undefined || Y == undefined || X < 0 || Y < 0 || X >= this.nx || Y >= this.ny) {
                return undefined;
            }
            return vec2(this.h - (Y + 1) * this.cellSizeH + this.offsetT, X * this.cellSizeW + this.offsetL);
        }
        if (Y.x == undefined || Y.y == undefined || Y.x < 0 || Y.y < 0 || Y.x >= this.nx || Y.y >= this.ny) {
            return undefined;
        }
        return vec2(this.h - (Y.y + 1) * this.cellSizeH + this.offsetT, Y.x * this.cellSizeW + this.offsetL);
    }

    GetPosRealBoard(Y, X) {
        if (typeof Y != "object") {
            if (X == undefined || Y == undefined || X < 0 || Y < 0 || X >= this.ny || Y >= this.nx) {
                return undefined;
            }
            return vec2(this.h - (Y + 1) * this.cellSizeH, X * this.cellSizeW);
        }
        if (Y.x == undefined || Y.y == undefined || Y.x < 0 || Y.y < 0 || Y.x >= this.ny || Y.y >= this.nx) {
            return undefined;
        }
        return vec2(this.h - (Y.y + 1) * this.cellSizeH, Y.x * this.cellSizeW);
    }

    toReversed(Pos) {
        return vec2(Pos.x, this.ny - Pos.y - 1);
    }

    ImageAttach(Image) {
        try {
            let posx = Image.posx;
            let posy = this.ny - Image.posy - 1;
            let a = this.GetPosRealBoard(posx, posy);
            if (a != undefined && this.board[posy][posx][0].length == 1) {
                if (Image.name[1] == "K") {
                    if (Image.name[0] == "b") {
                        this.posKings.b = [posy, posx];
                    } else {
                        this.posKings.w = [posy, posx];
                    }
                }
                this.board[posy][posx][1] = Image;
                this.board[posy][posx][0] += Image.name;
            } else {
                if (a == undefined) {
                    console.log("Something wrong in coordinates...");
                }
            }
        } catch (err) {
            console.log(`Function: "ImageAttach": ${err}`);
        }
    }

    NewBoard(newBoard) {
        for (let y = 0; y < this.ny; y++) {
            for (let x = 0; x < this.nx; x++) {
                this.board[y][x] = [];
                this.board[y][x][0] = newBoard[y][x][0];
                this.board[y][x][1] = undefined;
                if (this.board[y][x][0].length > 1) {
                    this.board[y][x][1] = Image(`./Figures/${this.board[y][x][0].slice(1)}.png`, this, vec2(x, this.ny - y - 1), vec2(this.cellSizeW, this.cellSizeH));
                }
            }
        }
    }

    setFigures() {
        for (let y = 0; y < this.ny; y++) {
            for (let x = 0; x < this.nx; x++) {
                if (this.board[y][x][1] != undefined) {
                    this.figure(x, y);
                }
            }
        }
    }

    figure(x, y) {
        this.board[y][x][1].figure.name = this.board[y][x][1].name[1];
        this.board[y][x][1].figure.color = this.board[y][x][1].name[0];
        this.board[y][x][1].figure.ismove = false;
        this.board[y][x][1].figure.isLocked = false;
    }

    checkOnMove(x, y) {
        if (this.board[y][x][1] == undefined) {
            return true;
        }
        return false;
    }

    canMove(x, y, x2, y2, tomove = true, tocheck = false) {
        let fig = this.board[y][x][1].figure;
        let ans = false;
        this.enPasant = false;
        if (fig.color == this.color || tocheck) {
            if (fig.name == "P") {
                if (fig.color == "w") {
                    if (x == x2) {
                        if (y == y2 + 1) {
                            if (this.checkOnMove(x, y2)) {
                                if (tomove) {
                                    fig.ismove = true;
                                    this.lastMoved = [x2, y2];
                                    this.isLongP = false;
                                }
                                this.enPasant = false;
                                ans = true;
                            }
                        } else if (y == y2 + 2) {
                            if (this.checkOnMove(x, y2 + 1) && this.checkOnMove(x, y2) && !fig.ismove) {
                                if (tomove) {
                                    fig.ismove = true;
                                    this.lastMoved = [x2, y2];
                                    this.isLongP = true;
                                }
                                this.enPasant = false;
                                ans = true;
                            }
                        }
                    } else {
                        if (x2 == x - 1 || x2 == x + 1) {
                            if (y == y2 + 1) {
                                if (!this.checkOnMove(x2, y2) && this.board[y2][x2][1].name[0] == "b") {
                                    if (tomove) {
                                        fig.ismove = true;
                                        this.lastMoved = [x2, y2];
                                        this.isLongP = false;
                                    }
                                    this.enPasant = false;
                                    ans = true;
                                } else if (!this.checkOnMove(x2, y) && this.lastMoved[0] == x2 && this.lastMoved[1] == y) {
                                    if (this.board[y][x2][1].name[1] == "P" && this.board[y][x2][1].name[0] == "b" && this.isLongP) {
                                        if (tomove) {
                                            fig.ismove = true;
                                            this.lastMoved = [x2, y2];
                                            this.board[y][x2][0] = this.board[y][x2][0].slice(0, 1);
                                            this.board[y][x2][1] = undefined;
                                            this.isLongP = false;
                                        }
                                        this.enPasant = true;
                                        ans = true;
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (x == x2) {
                        if (y == y2 - 1) {
                            if (this.checkOnMove(x, y2)) {
                                if (tomove) {
                                    fig.ismove = true;
                                    this.lastMoved = [x2, y2];
                                    this.isLongP = false;
                                }
                                this.enPasant = false;
                                ans = true;
                            }
                        } else if (y == y2 - 2) {
                            if (this.checkOnMove(x, y2 - 1) && this.checkOnMove(x, y2) && !fig.ismove) {
                                if (tomove) {
                                    fig.ismove = true;
                                    this.lastMoved = [x2, y2];
                                    this.isLongP = true;
                                }
                                this.enPasant = false;
                                ans = true;
                            }
                        }
                    } else {
                        if (x2 == x - 1 || x2 == x + 1) {
                            if (y == y2 - 1) {
                                if (!this.checkOnMove(x2, y2) && this.board[y2][x2][1].name[0] == "w") {
                                    if (tomove) {
                                        fig.ismove = true;
                                        this.lastMoved = [x2, y2];
                                        this.isLongP = false;
                                    }
                                    this.enPasant = false;
                                    ans = true;
                                } else if (!this.checkOnMove(x2, y) && this.lastMoved[0] == x2 && this.lastMoved[1] == y) {
                                    if (this.board[y][x2][1].name[1] == "P" && this.board[y][x2][1].name[0] == "w" && this.isLongP) {
                                        if (tomove) {
                                            fig.ismove = true;
                                            this.lastMoved = [x2, y2];
                                            this.board[y][x2][0] = this.board[y][x2][0].slice(0, 1);
                                            this.board[y][x2][1] = undefined;
                                            this.isLongP = false;
                                        }
                                        this.enPasant = true;
                                        ans = true;
                                    }
                                }
                            }
                        }
                    }
                }
            } else if (fig.name == "N") {
                let dx = Math.abs(x - x2),
                    dy = Math.abs(y - y2);
                if (((dx == 1 && dy == 2) || (dx == 2 && dy == 1)) && (this.board[y2][x2][1] == undefined || this.board[y2][x2][1].name[0] != this.color)) {
                    ans = true;
                }
            } else if (fig.name == "R") {
                let conlin;
                if (x == x2) {
                    conlin = true;
                    for (let i = Math.min(y, y2) + 1; i < Math.max(y, y2); i++) {
                        if (this.board[i][x][1] != undefined) {
                            conlin = false;
                            break;
                        }
                    }
                } else if (y == y2) {
                    conlin = true;
                    for (let i = Math.min(x, x2) + 1; i < Math.max(x, x2); i++) {
                        if (this.board[y][i][1] != undefined) {
                            conlin = false;
                            break;
                        }
                    }
                }
                if (conlin != undefined && conlin && (this.board[y2][x2][1] == undefined || this.board[y2][x2][1].name[0] != this.color)) {
                    ans = true;
                }
            } else if (fig.name == "B") {
                let dx = x2 - x,
                    dy = y2 - y,
                    condiag;
                if ((dx == dy || dx == -dy) && dx != 0) {
                    condiag = true;
                    for (let i = 1; i < Math.abs(dx); i++) {
                        if (this.board[y + i * Math.sign(dy)][x + i * Math.sign(dx)][1] != undefined) {
                            condiag = false;
                        }
                    }
                }
                if (condiag != undefined && condiag && (this.board[y2][x2][1] == undefined || this.board[y2][x2][1].name[0] != this.color)) {
                    ans = true;
                }
            } else if (fig.name == "Q") {
                let conlin;
                if (x == x2) {
                    conlin = true;
                    for (let i = Math.min(y, y2) + 1; i < Math.max(y, y2); i++) {
                        if (this.board[i][x][1] != undefined) {
                            conlin = false;
                            break;
                        }
                    }
                } else if (y == y2) {
                    conlin = true;
                    for (let i = Math.min(x, x2) + 1; i < Math.max(x, x2); i++) {
                        if (this.board[y][i][1] != undefined) {
                            conlin = false;
                            break;
                        }
                    }
                }
                let dx = x2 - x,
                    dy = y2 - y,
                    condiag;
                if ((dx == dy || dx == -dy) && dx != 0) {
                    condiag = true;
                    for (let i = 1; i < Math.abs(dx); i++) {
                        if (this.board[y + i * Math.sign(dy)][x + i * Math.sign(dx)][1] != undefined) {
                            condiag = false;
                        }
                    }
                }
                // console.log(condiag);
                if (
                    ((conlin != undefined && conlin) || (condiag != undefined && condiag)) &&
                    (this.board[y2][x2][1] == undefined || this.board[y2][x2][1].name[0] != this.color)
                ) {
                    ans = true;
                }
            } else if (fig.name == "K") {
                let dx = x2 - x,
                    dy = y2 - y;
                if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1 && !(dx == 0 && dy == 0)) {
                    if (this.board[y2][x2][1] == undefined || this.board[y2][x2][1].name[0] != this.color) {
                        let f = this.board[y][x][1];
                        this.board[y][x][1] = undefined;
                        if (tocheck || !this.underCheck(x2, y2)) {
                            ans = true;
                        }
                        this.board[y][x][1] = f;
                    }
                }
            }
            // what is down at one line is untouchable!!!
        }

        let concheck = false;
        if (fig.color == this.color && !tocheck) {
            let pos;
            if (this.color == "b") {
                pos = this.posKings.b;
            } else {
                pos = this.posKings.w;
            }
            let y4 = pos[0];
            let x4 = pos[1];
            if (!(x == x4 && y == y4)) {
                let a = this.board[y2][x2][1];
                let b = this.board[y][x][1];
                this.board[y2][x2][1] = this.board[y][x][1];
                this.board[y][x][1] = undefined;
                for (let y3 = 0; y3 < this.ny; y3++) {
                    for (let x3 = 0; x3 < this.nx; x3++) {
                        if (this.board[y3][x3][1] != undefined && this.board[y3][x3][1].name[0] != this.color) {
                            this.changeColor();
                            if (this.canMove(x3, y3, x4, y4, false, true)) {
                                concheck = true;
                                ans = false;
                            }
                            this.changeColor();
                        }
                    }
                }
                this.board[y][x][1] = b;
                this.board[y2][x2][1] = a;
            }
        }
        if (tomove && ans && !concheck) {
            if (fig.name == "K") {
                if (this.color == "w") {
                    this.posKings.w = [y2, x2];
                } else {
                    this.posKings.b = [y2, x2];
                }
            }
            let pos;
            if (this.color == "w") {
                pos = this.posKings.b;
            } else {
                pos = this.posKings.w;
            }
            // checking on check

            let tmp1 = this.board[y][x][1];
            let tmp2 = this.board[y2][x2][1];
            this.board[y2][x2][1] = tmp1;
            this.board[y][x][1] = undefined;
            if (this.canMove(x2, y2, pos[1], pos[0], false, true)) {
                if (this.color == "w") {
                    this.isUnderCheckB = true;
                } else {
                    this.isUnderCheckW = true;
                }
            } else {
                this.isUnderCheckW = false;
                this.isUnderCheckB = false;
            }
            if (!(this.isUnderCheckB || this.isUnderCheckW)) {
                for (let y3 = 0; y3 < this.ny; y3++) {
                    for (let x3 = 0; x3 < this.nx; x3++) {
                        if (this.board[y3][x3][1] != undefined && this.board[y3][x3][1].name[0] == this.color) {
                            if (this.canMove(x3, y3, pos[1], pos[0], false, true)) {
                                if (this.color == "w") {
                                    this.isUnderCheckB = true;
                                } else {
                                    this.isUnderCheckW = true;
                                }
                            } else {
                                this.isUnderCheckB = false;
                                this.isUnderCheckB = false;
                            }
                        }
                    }
                }
            }
            this.board[y2][x2][1] = tmp2;
            this.board[y][x][1] = tmp1;

            // Check on pat
            this.changeColor();
            let Pat = true;

            tmp1 = this.board[y][x][1];
            tmp2 = this.board[y2][x2][1];
            this.board[y2][x2][1] = tmp1;
            this.board[y][x][1] = undefined;
            for (let y3 = 0; y3 < this.ny && Pat; y3++) {
                for (let x3 = 0; x3 < this.nx && Pat; x3++) {
                    if (this.board[y3][x3][1] != undefined && this.board[y3][x3][1].name[0] == this.color) {
                        for (let y4 = 0; y4 < this.ny && Pat; y4++) {
                            for (let x4 = 0; x4 < this.nx && Pat; x4++) {
                                if (this.canMove(x3, y3, x4, y4, false)) {
                                    Pat = false;
                                }
                            }
                        }
                    }
                }
            }
            this.board[y2][x2][1] = tmp2;
            this.board[y][x][1] = tmp1;
            this.changeColor();

            // Check on enough figures for mate
            let Fig = [];
            let Fig2 = [];
            let con1 = false,
                con2 = false;

            tmp1 = this.board[y][x][1];
            tmp2 = this.board[y2][x2][1];
            this.board[y2][x2][1] = tmp1;
            this.board[y][x][1] = undefined;

            for (let y3 = 0; y3 < this.ny; y3++) {
                for (let x3 = 0; x3 < this.nx; x3++) {
                    if (this.board[y3][x3][1] != undefined && this.board[y3][x3][1].name.slice(0, 1) == this.color) {
                        if (this.board[y3][x3][1].name.slice(1, 2) != "K") {
                            Fig.push(this.board[y3][x3][1].name.slice(1, 2));
                        }
                    }
                }
            }

            this.changeColor();
            for (let y3 = 0; y3 < this.ny; y3++) {
                for (let x3 = 0; x3 < this.nx; x3++) {
                    if (this.board[y3][x3][1] != undefined && this.board[y3][x3][1].name.slice(0, 1) == this.color) {
                        if (this.board[y3][x3][1].name.slice(1, 2) != "K") {
                            Fig2.push(this.board[y3][x3][1].name.slice(1, 2));
                        }
                    }
                }
            }
            this.changeColor();

            this.board[y2][x2][1] = tmp2;
            this.board[y][x][1] = tmp1;

            if (Fig.length <= 1) {
                if (Fig.length == 0) {
                    con1 = true;
                } else {
                    if (Fig[0] == "N" || Fig[0] == "B") {
                        con1 = true;
                    }
                }
            }

            if (Fig2.length <= 1) {
                if (Fig2.length == 0) {
                    con2 = true;
                } else {
                    if (Fig2[0] == "N" || Fig2[0] == "B") {
                        con2 = true;
                    }
                }
            }

            if (con1 && con2) {
                this.isPat = true;
                Pat = false;
                console.log("DRAW, NOT ENOUGH FIGURES!!!");
            }
            // Cneck on end of the game

            if (Pat) {
                if (this.isUnderCheckW || this.isUnderCheckB) {
                    this.isMate = true;
                    if (this.color == "w") {
                        console.log("WHITE WON, IT'S MATE!!!");
                    } else {
                        console.log("BLACK WON, IT'S MATE!!!");
                    }
                } else {
                    this.isPat = true;
                    console.log("DRAW, IT'S PAT!!!");
                }
            }

            // Changing color
            this.changeColor();
        }
        return ans;
    }

    underCheck(x2, y2) {
        let r = false;
        if (this.board[y2][x2][1] == undefined) {
            r = true;
            this.board[y2][x2][1] = {};
        }
        let j = this.board[y2][x2][1].name;
        this.board[y2][x2][1].name = this.color + "K";
        for (let y3 = 0; y3 < this.ny; y3++) {
            for (let x3 = 0; x3 < this.nx; x3++) {
                if (!(x3 == x2 && y2 == y3)) {
                    if (this.board[y3][x3][1] != undefined && this.board[y3][x3][1].name[0] != this.color) {
                        if (this.board[y3][x3][1].name[1] == "P") {
                            if (this.canMove(x3, y3, x2, y2, false, true)) {
                                if (!r) {
                                    this.board[y2][x2][1].name = j;
                                } else {
                                    this.board[y2][x2][1] = undefined;
                                }
                                return true;
                            }
                        } else {
                            this.changeColor();
                            if (this.canMove(x3, y3, x2, y2, false, true)) {
                                if (!r) {
                                    this.board[y2][x2][1].name = j;
                                } else {
                                    this.board[y2][x2][1] = undefined;
                                }
                                this.changeColor();
                                return true;
                            }
                            this.changeColor();
                        }
                    }
                }
            }
        }

        if (!r) {
            this.board[y2][x2][1].name = j;
        } else {
            this.board[y2][x2][1] = undefined;
        }
        return false;
    }

    changeColor() {
        if (this.color == "w") {
            this.color = "b";
        } else {
            this.color = "w";
        }
    }
}

export function Board(...args) {
    return new _Board(...args);
}
