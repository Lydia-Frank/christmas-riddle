"use strict";


/* =================================
   FIXED MAZE LAYOUT

   Digitized from the provided maze
   image. Each hex digit encodes one
   cell's walls:

   bit 0 = top
   bit 1 = right
   bit 2 = bottom
   bit 3 = left
================================= */

const MAZE_ROWS = 29;

const MAZE_COLS = 35;

const ENTRANCE = {
    row: 1,
    col: 0
};

const EXIT = {
    row: 21,
    col: 34
};

/*
One character per cell, row-major.
Red/pink annotations from the source
image are NOT included — only walls.
*/

const MAZE_WALL_MASKS = [

    "B93D51791795793917D1393D153B9553B93",
    "42839292C3A97AAEC53EC683C3EAE97AC2A",
    "BEAC286E946856A95169392C38147AB83AA",
    "85696C17C17C53C6945686C7C6C13A86AEA",
    "A95697AB96955693ABD541579796E869696",
    "E813A96C43C397AEC2979697AD417EBC3C3",
    "BEAC6A93943C696956C169456916BB816BA",
    "A96BD6AC43C57C56D3D43C3B96C16AE87AA",
    "8694796B969551555013C3C4693C381696A",
    "C3A956D043AD3C557EAE96D556ABC6C3C16",
    "BAAABD56968169555569695513AA9394543",
    "A86C43BBC3AA903D5514383BAAA86C6D3BE",
    "8697942A96AAEAC797A96AEAEAAC3939683",
    "A929696AC3AAD2D3C56C3A96D2A96EAC56A",
    "AAAAB87A96AC3C1455396C453AAC392D53A",
    "AAEAAED443ABC3E93D2C39396847C6C3946",
    "AC3AC5513AA83C56EBA906C6BA939396AD3",
    "C7AC1796C686C55796AEC3BD42AC6C692BA",
    "95296BC39383B955456956C552C39396C2A",
    "C7C6BC102C2E807D553C55557A942C6D16A",
    "955543AEC3C3AC115541155516C7C393816",
    "C3957C69529687EC517AC7D569793AE86C5",
    "96C553D6D2E9695516D293939696C43A953",
    "A9557A955296BA93AD386C2AAD45796EABA",
    "A85552ABD6C3AEAAC3AAD16C07D1383BAAA",
    "AAD516A85516A96ABE8696D3C57EC6A86C6",
    "AC3BE9683BABC43A812BA916955153AA913",
    "83C2D6D6C2AC396AC02C46ED693C3C42EAA",
    "EC56D55556C56C7C56C5557D56C56D5456E"

];


/* =================================
   DIRECTIONS
================================= */

const DIRECTIONS = {

    up: {
        rowChange: -1,
        colChange: 0,
        wall: "top",
        opposite: "bottom"
    },

    right: {
        rowChange: 0,
        colChange: 1,
        wall: "right",
        opposite: "left"
    },

    down: {
        rowChange: 1,
        colChange: 0,
        wall: "bottom",
        opposite: "top"
    },

    left: {
        rowChange: 0,
        colChange: -1,
        wall: "left",
        opposite: "right"
    }

};


/* =================================
   STORAGE
================================= */

const STORAGE_KEYS = {

    player:
        "mazeRiddle3Player",

    moves:
        "mazeRiddle3Moves",

    trail:
        "mazeRiddle3Trail",

    solved:
        "mazeRiddle3Solved"

};


/* =================================
   GAME STATE
================================= */

let maze = [];

let player = {
    row: ENTRANCE.row,
    col: ENTRANCE.col
};

let santa = {
    row: EXIT.row,
    col: EXIT.col
};

/*
Stack of cells visited on the current
route. Backtracking pops the tip so the
red line erases itself.
*/

let trail = [
    {
        row: ENTRANCE.row,
        col: ENTRANCE.col
    }
];

let moves = 0;

let solved =
    localStorage.getItem(
        STORAGE_KEYS.solved
    ) === "true";


/* =================================
   PAGE ELEMENTS
================================= */

const canvas =
    document.getElementById(
        "mazeCanvas"
    );

const context =
    canvas.getContext("2d");

const moveCounter =
    document.getElementById(
        "moveCounter"
    );

const messageElement =
    document.getElementById(
        "mazeMessage"
    );

const resultElement =
    document.getElementById(
        "mazeResult"
    );

const resultTextElement =
    document.getElementById(
        "mazeResultText"
    );

const resetButton =
    document.getElementById(
        "resetMaze"
    );


/* =================================
   BUILD FIXED MAZE
================================= */

function wallsFromMask(mask) {

    return {
        top:
            (mask & 1) !== 0,
        right:
            (mask & 2) !== 0,
        bottom:
            (mask & 4) !== 0,
        left:
            (mask & 8) !== 0
    };

}


function buildFixedMaze() {

    const built = [];

    for (
        let row = 0;
        row < MAZE_ROWS;
        row++
    ) {

        const rowMasks =
            MAZE_WALL_MASKS[row];

        const mazeRow = [];

        for (
            let col = 0;
            col < MAZE_COLS;
            col++
        ) {

            const mask =
                parseInt(
                    rowMasks[col],
                    16
                );

            mazeRow.push({

                row: row,

                col: col,

                walls:
                    wallsFromMask(
                        mask
                    )

            });

        }

        built.push(mazeRow);

    }

    return built;

}


/* =================================
   LOAD PLAYER STATE
================================= */

function sameCell(a, b) {

    return (
        a.row === b.row &&
        a.col === b.col
    );

}


function loadPlayerState() {

    const storedPlayer =
        localStorage.getItem(
            STORAGE_KEYS.player
        );


    if (storedPlayer) {

        try {

            const parsedPlayer =
                JSON.parse(
                    storedPlayer
                );


            if (
                isInsideMaze(
                    parsedPlayer.row,
                    parsedPlayer.col
                )
            ) {

                player =
                    parsedPlayer;

            }

        } catch (error) {

            console.error(
                "Could not restore player:",
                error
            );

        }

    }


    const storedMoves =
        Number(
            localStorage.getItem(
                STORAGE_KEYS.moves
            )
        );


    if (
        Number.isFinite(
            storedMoves
        )
    ) {

        moves =
            storedMoves;

    }


    const storedTrail =
        localStorage.getItem(
            STORAGE_KEYS.trail
        );


    if (storedTrail) {

        try {

            const parsedTrail =
                JSON.parse(
                    storedTrail
                );


            if (
                Array.isArray(
                    parsedTrail
                ) &&
                parsedTrail.length > 0 &&
                parsedTrail.every(
                    cell =>
                        isInsideMaze(
                            cell.row,
                            cell.col
                        )
                )
            ) {

                trail =
                    parsedTrail;

                /*
                Keep player on the tip
                of the restored trail.
                */

                const tip =
                    trail[
                        trail.length -
                        1
                    ];

                player = {
                    row: tip.row,
                    col: tip.col
                };

            }

        } catch (error) {

            console.error(
                "Could not restore trail:",
                error
            );

        }

    }


    if (
        trail.length === 0 ||
        !sameCell(
            trail[trail.length - 1],
            player
        )
    ) {

        trail = [
            {
                row: player.row,
                col: player.col
            }
        ];

    }


    updateMoveCounter();

}


/* =================================
   SAVE PLAYER STATE
================================= */

function savePlayerState() {

    localStorage.setItem(
        STORAGE_KEYS.player,
        JSON.stringify(player)
    );


    localStorage.setItem(
        STORAGE_KEYS.moves,
        String(moves)
    );


    localStorage.setItem(
        STORAGE_KEYS.trail,
        JSON.stringify(trail)
    );

}


/* =================================
   TRAIL (STACK PATH)
================================= */

function updateTrail(newRow, newCol) {

    const next = {
        row: newRow,
        col: newCol
    };


    /*
    Moving back onto the previous cell
    pops the current tip — the red
    segment disappears.
    */

    if (
        trail.length >= 2 &&
        sameCell(
            trail[trail.length - 2],
            next
        )
    ) {

        trail.pop();

        return;

    }


    trail.push(next);

}


/* =================================
   DRAW MAZE
================================= */

function drawMaze() {

    const frame =
        canvas.parentElement;


    const maxWidth =
        Math.min(
            frame.clientWidth,
            700
        );


    const cellSize =
        Math.max(
            8,
            Math.floor(
                maxWidth /
                MAZE_COLS
            )
        );


    const displayWidth =
        cellSize *
        MAZE_COLS;


    const displayHeight =
        cellSize *
        MAZE_ROWS;


    const pixelRatio =
        window.devicePixelRatio || 1;


    canvas.width =
        displayWidth *
        pixelRatio;


    canvas.height =
        displayHeight *
        pixelRatio;


    canvas.style.width =
        displayWidth + "px";


    canvas.style.height =
        displayHeight + "px";


    context.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );


    context.clearRect(
        0,
        0,
        displayWidth,
        displayHeight
    );


    drawBackground(
        displayWidth,
        displayHeight
    );


    drawStartAndFinish(
        cellSize
    );


    drawTrail(
        cellSize
    );


    drawWalls(
        cellSize
    );


    drawSanta(
        cellSize
    );


    drawNisse(
        cellSize
    );

}


/* =================================
   BACKGROUND
================================= */

function drawBackground(
    width,
    height
) {

    const gradient =
        context.createLinearGradient(
            0,
            0,
            width,
            height
        );


    gradient.addColorStop(
        0,
        "#f8f4e9"
    );


    gradient.addColorStop(
        1,
        "#dfe9e3"
    );


    context.fillStyle =
        gradient;


    context.fillRect(
        0,
        0,
        width,
        height
    );

}


/* =================================
   START AND FINISH CELLS
================================= */

function drawStartAndFinish(
    cellSize
) {

    context.fillStyle =
        "#dcefdc";


    context.fillRect(
        ENTRANCE.col *
            cellSize +
            1,

        ENTRANCE.row *
            cellSize +
            1,

        cellSize - 2,
        cellSize - 2
    );


    context.fillStyle =
        "#f8dddd";


    context.fillRect(
        santa.col *
            cellSize +
            1,

        santa.row *
            cellSize +
            1,

        cellSize - 2,
        cellSize - 2
    );

}


/* =================================
   DRAW TRAIL
================================= */

function drawTrail(cellSize) {

    if (trail.length < 2) {
        return;
    }


    context.strokeStyle =
        "#FF0000";


    context.lineWidth =
        Math.max(
            2,
            cellSize * 0.28
        );


    context.lineCap =
        "round";


    context.lineJoin =
        "round";


    context.beginPath();


    trail.forEach((cell, index) => {

        const x =
            cell.col *
                cellSize +
            cellSize / 2;


        const y =
            cell.row *
                cellSize +
            cellSize / 2;


        if (index === 0) {

            context.moveTo(
                x,
                y
            );

        } else {

            context.lineTo(
                x,
                y
            );

        }

    });


    context.stroke();

}


/* =================================
   DRAW WALLS
================================= */

function drawWalls(cellSize) {

    context.strokeStyle =
        "#173c31";


    context.lineWidth =
        Math.max(
            1,
            cellSize * 0.12
        );


    context.lineCap =
        "square";


    maze.forEach(row => {

        row.forEach(cell => {

            const x =
                cell.col *
                cellSize;


            const y =
                cell.row *
                cellSize;


            context.beginPath();


            if (
                cell.walls.top
            ) {

                context.moveTo(
                    x,
                    y
                );

                context.lineTo(
                    x + cellSize,
                    y
                );

            }


            if (
                cell.walls.right
            ) {

                context.moveTo(
                    x + cellSize,
                    y
                );

                context.lineTo(
                    x + cellSize,
                    y + cellSize
                );

            }


            if (
                cell.walls.bottom
            ) {

                context.moveTo(
                    x,
                    y + cellSize
                );

                context.lineTo(
                    x + cellSize,
                    y + cellSize
                );

            }


            if (
                cell.walls.left
            ) {

                context.moveTo(
                    x,
                    y
                );

                context.lineTo(
                    x,
                    y + cellSize
                );

            }


            context.stroke();

        });

    });

}


/* =================================
   DRAW CHARACTERS
================================= */

function drawNisse(cellSize) {

    drawEmoji(
        "🧝",
        player.row,
        player.col,
        cellSize
    );

}


function drawSanta(cellSize) {

    drawEmoji(
        "🏠",
        santa.row,
        santa.col,
        cellSize
    );

}


function drawEmoji(
    emoji,
    row,
    col,
    cellSize
) {

    context.font =
        `${cellSize * 0.72}px
        "Apple Color Emoji",
        "Segoe UI Emoji",
        sans-serif`;


    context.textAlign =
        "center";


    context.textBaseline =
        "middle";


    context.fillText(
        emoji,

        col *
            cellSize +
            cellSize / 2,

        row *
            cellSize +
            cellSize / 2 +
            cellSize * 0.04
    );

}


/* =================================
   MOVEMENT
================================= */

function movePlayer(
    directionName
) {

    if (solved) {
        return;
    }


    const direction =
        DIRECTIONS[
            directionName
        ];


    if (!direction) {
        return;
    }


    const currentCell =
        maze[
            player.row
        ][
            player.col
        ];


    if (
        currentCell.walls[
            direction.wall
        ]
    ) {

        showMessage(
            "🧱 A wall blocks the way."
        );

        flashCanvas();

        return;

    }


    const newRow =
        player.row +
        direction.rowChange;


    const newCol =
        player.col +
        direction.colChange;


    if (
        !isInsideMaze(
            newRow,
            newCol
        )
    ) {

        return;

    }


    updateTrail(
        newRow,
        newCol
    );


    player.row =
        newRow;


    player.col =
        newCol;


    moves++;


    savePlayerState();

    updateMoveCounter();

    clearMessage();

    drawMaze();

    checkForWin();

}


/* =================================
   WIN
================================= */

function checkForWin() {

    if (
        player.row ===
            santa.row &&
        player.col ===
            santa.col
    ) {

        completeMaze();

    }

}


function completeMaze() {

    solved = true;


    localStorage.setItem(
        STORAGE_KEYS.solved,
        "true"
    );


    localStorage.setItem(
        "riddle3",
        "solved"
    );


    showMessage(
        "✅ Hideout located!"
    );


    resultTextElement
        .textContent =
        "You made it through the storm! " +
        "In the distance, you can see a small building " +
        "hidden in the snow. This must be where they're " +
        "keeping Nisseline. But something is wrong... " +
        "We still don't know exactly how to get inside. " +
        `(Reached in ${moves} moves.)`;


    resultElement.hidden =
        false;


    document
        .querySelector(
            ".maze-controls"
        )
        .hidden =
        true;


    drawMaze();

}


/* =================================
   RESTORE COMPLETED GAME
================================= */

function restoreSolvedState() {

    if (!solved) {
        return;
    }


    resultTextElement
        .textContent =
        "You made it through the storm! " +
        "In the distance, you can see a small building " +
        "hidden in the snow. This must be where they're " +
        "keeping Nisseline. But something is wrong... " +
        "We still don't know exactly how to get inside. " +
        `(Reached in ${moves} moves.)`;


    resultElement.hidden =
        false;


    document
        .querySelector(
            ".maze-controls"
        )
        .hidden =
        true;


    showMessage(
        "✓ Hideout located"
    );

}


/* =================================
   BOUNDS
================================= */

function isInsideMaze(
    row,
    col
) {

    return (
        row >= 0 &&
        row < MAZE_ROWS &&
        col >= 0 &&
        col < MAZE_COLS
    );

}


/* =================================
   MOVE COUNTER
================================= */

function updateMoveCounter() {

    moveCounter.textContent =
        moves;

}


/* =================================
   MESSAGE
================================= */

function showMessage(message) {

    messageElement.textContent =
        message;

}


function clearMessage() {

    messageElement.textContent =
        "Help 🧝 reach the hideout 🏠";

}


/* =================================
   WALL FEEDBACK
================================= */

function flashCanvas() {

    canvas.classList.remove(
        "maze-blocked"
    );


    void canvas.offsetWidth;


    canvas.classList.add(
        "maze-blocked"
    );

}


/* =================================
   BUTTON CONTROLS
================================= */

document
    .querySelectorAll(
        ".maze-control"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                movePlayer(
                    button.dataset
                        .direction
                );

            }
        );

    });


/* =================================
   KEYBOARD CONTROLS
================================= */

document.addEventListener(
    "keydown",
    event => {

        const keyboardMap = {

            ArrowUp: "up",

            ArrowRight: "right",

            ArrowDown: "down",

            ArrowLeft: "left",

            w: "up",

            d: "right",

            s: "down",

            a: "left",

            W: "up",

            D: "right",

            S: "down",

            A: "left"

        };


        const direction =
            keyboardMap[
                event.key
            ];


        if (direction) {

            event.preventDefault();

            movePlayer(
                direction
            );

        }

    }
);


/* =================================
   SWIPE CONTROLS
================================= */

let touchStartX = 0;
let touchStartY = 0;


canvas.addEventListener(
    "touchstart",
    event => {

        const touch =
            event.touches[0];


        touchStartX =
            touch.clientX;


        touchStartY =
            touch.clientY;

    },
    {
        passive: true
    }
);


canvas.addEventListener(
    "touchend",
    event => {

        const touch =
            event.changedTouches[0];


        const differenceX =
            touch.clientX -
            touchStartX;


        const differenceY =
            touch.clientY -
            touchStartY;


        const minimumSwipe =
            18;


        if (
            Math.abs(
                differenceX
            ) <
                minimumSwipe &&
            Math.abs(
                differenceY
            ) <
                minimumSwipe
        ) {

            return;

        }


        if (
            Math.abs(
                differenceX
            ) >
            Math.abs(
                differenceY
            )
        ) {

            movePlayer(
                differenceX > 0
                    ? "right"
                    : "left"
            );

        } else {

            movePlayer(
                differenceY > 0
                    ? "down"
                    : "up"
            );

        }

    },
    {
        passive: true
    }
);


/* =================================
   RESIZE
================================= */

window.addEventListener(
    "resize",
    drawMaze
);


/* =================================
   RESET
================================= */

resetButton.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "mazeRiddle3Layout"
        );

        localStorage.removeItem(
            STORAGE_KEYS.player
        );

        localStorage.removeItem(
            STORAGE_KEYS.moves
        );

        localStorage.removeItem(
            STORAGE_KEYS.trail
        );

        localStorage.removeItem(
            STORAGE_KEYS.solved
        );

        localStorage.removeItem(
            "riddle3"
        );


        window.location.reload();

    }
);


/* =================================
   INITIALISE
================================= */

function initialiseMaze() {

    /*
    Drop any previously generated
    random maze from older versions.
    */

    localStorage.removeItem(
        "mazeRiddle3Layout"
    );


    maze = buildFixedMaze();

    loadPlayerState();

    drawMaze();

    restoreSolvedState();

}


initialiseMaze();
