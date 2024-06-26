import { setTimeout } from "node:timers";
import { Board, Image, vec2 } from "./lib.js";

let socket = new WebSocket("ws://192.168.30.32:3333");

console.log("loaded");
const can = document.getElementById("board");
const body = document.getElementById("body");

// npx rollup -c --watch

let Boar,
    IsFigureGot = false,
    IsTravell = false,
    oldPos = vec2(),
    BoardPo = vec2(-1, -1),
    IsLocked = vec2(-1, -1),
    IsTouchMode = false,
    BoardPoOld = vec2(-2, -2),
    BoarPoOldOld = vec2(-3, -3),
    mess = {};

function addListenerMulti(element, eventNames, listener) {
    let events = eventNames.split(" ");
    for (let i = 0, iLen = events.length; i < iLen; i++) {
        element.addEventListener(events[i], listener, false);
    }
}

function main() {
    Boar = Board(can, 8, -1);

    // Pawns

    for (let i = 0; i < Boar.nx; i++) {
        Image("./Figures/wP.png", Boar, vec2(i, 1), vec2(Boar.cellSizeW));
    }

    for (let i = 0; i < Boar.nx; i++) {
        Image("./Figures/bP.png", Boar, vec2(i, Boar.ny - 1 - 1), vec2(Boar.cellSizeW));
    }

    // Knights
    Image("./Figures/bN.png", Boar, vec2(1, Boar.ny - 1), vec2(Boar.cellSizeW));
    Image("./Figures/bN.png", Boar, vec2(Boar.nx - 2, Boar.ny - 1), vec2(Boar.cellSizeW));
    Image("./Figures/wN.png", Boar, vec2(1, 0), vec2(Boar.cellSizeW));
    Image("./Figures/wN.png", Boar, vec2(Boar.nx - 2, 0), vec2(Boar.cellSizeW));

    // Rooks
    Image("./Figures/bR.png", Boar, vec2(0, Boar.ny - 1), vec2(Boar.cellSizeW));
    Image("./Figures/bR.png", Boar, vec2(Boar.nx - 1, Boar.ny - 1), vec2(Boar.cellSizeW));
    Image("./Figures/wR.png", Boar, vec2(0, 0), vec2(Boar.cellSizeW));
    Image("./Figures/wR.png", Boar, vec2(Boar.nx - 1, 0), vec2(Boar.cellSizeW));

    // Bishops
    Image("./Figures/bB.png", Boar, vec2(2, Boar.ny - 1), vec2(Boar.cellSizeW));
    Image("./Figures/bB.png", Boar, vec2(Boar.nx - 3, Boar.ny - 1), vec2(Boar.cellSizeW));
    Image("./Figures/wB.png", Boar, vec2(2, 0), vec2(Boar.cellSizeW));
    Image("./Figures/wB.png", Boar, vec2(Boar.nx - 3, 0), vec2(Boar.cellSizeW));

    // Queens
    Image("./Figures/wQ.png", Boar, vec2(3, 0), vec2(Boar.cellSizeW));
    Image("./Figures/bQ.png", Boar, vec2(3, Boar.ny - 1), vec2(Boar.cellSizeW));

    // Kings
    Image("./Figures/wK.png", Boar, vec2(4, 0), vec2(Boar.cellSizeW));
    Image("./Figures/bK.png", Boar, vec2(4, Boar.ny - 1), vec2(Boar.cellSizeW));

    addListenerMulti(can, "mousedown", moveFunction);
    addListenerMulti(body, "mousemove mouseup", moveFunction);
    addListenerMulti(body, "resize", resizeFunction);

    Boar.setFigures();
    const draw = () => {
        Boar.DrawBoard();
        if (IsTouchMode) {
            Boar.DrawPosMoves(IsLocked, BoardPo, "#a22ac9", "#f4b473", "#8f8d8f");
        } else if (!IsFigureGot) {
            Boar.DrawPosMoves(BoardPo);
        } else {
            Boar.DrawPosMoves(BoardPoOld, BoardPo);
        }
        Boar.DrawCheck("#f7e87dce", "#797979ce");
        Boar.DrawFigures();
        Boar.DrawBorder();
        window.requestAnimationFrame(draw);
    };
    draw();
}

function moveFunction(e) {
    if (e.type == "mousedown") {
        if (e.pageX >= Boar.offsetL && e.pageX <= Boar.offsetL + Boar.w && e.pageY >= Boar.offsetT && e.pageY <= Boar.offsetT + Boar.h) {
            if (!(IsTouchMode && !(BoardPoOld.x == BoardPo.x && BoardPoOld.y == BoardPo.y))) {
                if (Boar.board[BoardPo.y][BoardPo.x][0].length > 1) {
                    IsFigureGot = true;
                    IsTravell = false;
                    BoardPoOld = vec2(BoardPo.x, BoardPo.y);
                    oldPos = vec2(e.clientY, e.clientX);
                    Boar.board[BoardPo.y][BoardPo.x][1].posx +=
                        (e.clientX - (Boar.board[BoardPo.y][BoardPo.x][1].posx + 1) * Boar.cellSizeW - Boar.offsetL + Boar.cellSizeW / 2) / Boar.cellSizeW;

                    Boar.board[BoardPo.y][BoardPo.x][1].posy +=
                        (e.clientY - (Boar.board[BoardPo.y][BoardPo.x][1].posy + 1) * Boar.cellSizeH - Boar.offsetT + Boar.cellSizeH / 2) / Boar.cellSizeH;
                    Boar.board[BoardPo.y][BoardPo.x][1].posy = Boar.ny - Boar.board[BoardPo.y][BoardPo.x][1].posy - 1;
                }
            } else {
                if (Boar.canMove(IsLocked.x, IsLocked.y, BoardPo.x, BoardPo.y)) {
                    changeFields(IsLocked, BoardPo);
                    IsTouchMode = false;
                } else if (Boar.board[BoardPo.y][BoardPo.x][1] != undefined && Boar.board[BoardPo.y][BoardPo.x][1].name[0] == Boar.color) {
                    IsLocked = BoardPo;
                    IsTouchMode = true;
                } else {
                    IsTouchMode = false;
                }
            }
        }
    } else if (e.type == "mousemove") {
        if (e.target.id.toString() == "board") {
            let MousePo = vec2(e.clientY, e.clientX);
            BoardPo = Boar.GetPosBoard(MousePo);
            try {
                if (IsFigureGot) {
                    if (!(BoardPo.x == BoardPoOld.x && BoardPo.y == BoardPoOld.y)) {
                        IsTravell = true;
                    }
                }
            } catch (err) {}
        } else {
            if (!IsFigureGot) {
                BoardPo = vec2(-1, -1);
                IsTravell = true;
            }
        }
        if (IsFigureGot) {
            Boar.board[BoardPoOld.y][BoardPoOld.x][1].posx += (e.clientX - oldPos.y) / Boar.cellSizeW;
            Boar.board[BoardPoOld.y][BoardPoOld.x][1].posy += (oldPos.x - e.clientY) / Boar.cellSizeH;
            oldPos = vec2(e.clientY, e.clientX);
        }
    } else if (e.type == "mouseup") {
        if (IsFigureGot) {
            IsFigureGot = false;
            if (e.target.id.toString() != "board") {
                Boar.board[BoardPoOld.y][BoardPoOld.x][1].posx = BoardPoOld.x;
                Boar.board[BoardPoOld.y][BoardPoOld.x][1].posy = Boar.ny - BoardPoOld.y - 1;
                IsLocked = vec2(-1, -1);
                IsTouchMode = false;
            } else {
                let tmpx = Math.floor(Boar.board[BoardPoOld.y][BoardPoOld.x][1].posx + 1 / 2),
                    tmpy = Boar.ny - Math.floor(Boar.board[BoardPoOld.y][BoardPoOld.x][1].posy + 1 / 2) - 1;
                // Math.floor(Boar.board[BoardPoOld.y][BoardPoOld.x][1].posy + 1 / 2)
                // console.log(BoardPoOld.x, BoardPoOld.y, tmpx, tmpy);
                if (!(tmpy == BoardPoOld.y && tmpx == BoardPoOld.x) && Boar.canMove(BoardPoOld.x, BoardPoOld.y, tmpx, tmpy)) {
                    changeFields(BoardPoOld, vec2(tmpx, tmpy));
                    IsTouchMode = false;
                    IsLocked = vec2(-1, -1);
                } else {
                    Boar.board[BoardPoOld.y][BoardPoOld.x][1].posx = BoardPoOld.x;
                    Boar.board[BoardPoOld.y][BoardPoOld.x][1].posy = Boar.ny - BoardPoOld.y - 1;
                    if (!IsTravell && !IsTouchMode) {
                        IsLocked = vec2(BoardPoOld.x, BoardPoOld.y);
                        IsTouchMode = true;
                    } else {
                        IsLocked = vec2(-1, -1);
                        IsTouchMode = false;
                    }
                }
            }
        }
    }
    // console.log(e.type, e.pageX, e.pageY);
}

function changeFields(OldPos, NewPos) {
    Boar.board[NewPos.y][NewPos.x][1] = Boar.board[OldPos.y][OldPos.x][1];
    Boar.board[OldPos.y][OldPos.x][1] = undefined;
    let name = Boar.board[OldPos.y][OldPos.x][0].slice(1);
    Boar.board[OldPos.y][OldPos.x][0] = Boar.board[OldPos.y][OldPos.x][0].slice(0, 1);
    Boar.board[NewPos.y][NewPos.x][0] = Boar.board[NewPos.y][NewPos.x][0].slice(0, 1);
    Boar.board[NewPos.y][NewPos.x][0] += name;
    Boar.board[NewPos.y][NewPos.x][1].posx = NewPos.x;
    Boar.board[NewPos.y][NewPos.x][1].posy = Boar.ny - NewPos.y - 1;

    mess.event = "new board";
    mess.board = Boar.board;

    socket.send(JSON.stringify(mess));
}

function resizeFunction(e) {
    Boar.UpdateInfo(can, vec2(e.currentTarget.innerWidth, e.currentTarget.innerHeight));
    // console.log(e.currentTarget.innerHeight, e.currentTarget.innerWidth);
}

window.onresize = resizeFunction;

function initializeCommunication() {
    socket.onmessage = async (mess) => {
        unParse(JSON.parse(mess.data));
        // Boar.NewBoard(JSON.parse(text.data));
    };
}

initializeCommunication();

async function unParse(mess) {
    switch (mess.event) {
        case "new board":
            console.log(mess);
            console.log(mess.board);
            Boar.NewBoard(mess.board);
            break;
        default:
            console.log(`Unknown event: ${mess.event}`);
            break;
    }
}

window.addEventListener("load", () => {
    main();
});
