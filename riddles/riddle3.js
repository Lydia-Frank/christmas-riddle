"use strict";


/* =================================
   MAZE SETTINGS
================================= */

/*
Increase MAZE_SIZE to make the maze
larger and more difficult.

Recommended values:

15 = medium
21 = difficult
25 = very difficult
31 = extremely difficult

Keep it as an odd number.
*/

const MAZE_SIZE = 25;


/*
Direction data:

rowChange and colChange determine
movement on the grid.

opposite is used when removing walls
between neighbouring cells.
*/

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

    maze:
        "mazeRiddle3Layout",

    player:
        "mazeRiddle3Player",

    moves:
        "mazeRiddle3Moves",

    solved:
        "mazeRiddle3Solved"

};


/* =================================
   GAME STATE
================================= */

let maze = [];

let player = {
    row: 0,
    col: 0
};

let santa = {
    row: MAZE_SIZE - 1,
    col: MAZE_SIZE - 1
};

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
   CREATE CELL
================================= */

function createCell(row, col) {

    return {

        row: row,

        col: col,

        visited: false,

        walls: {
            top: true,
            right: true,
            bottom: true,
            left: true
        }

    };
}


/* =================================
   CREATE EMPTY GRID
================================= */

function createEmptyMaze() {

    const newMaze = [];

    for (
        let row = 0;
        row < MAZE_SIZE;
        row++
    ) {

        const mazeRow = [];

        for (
            let col = 0;
            col < MAZE_SIZE;
            col++
        ) {

            mazeRow.push(
                createCell(row, col)
            );
        }

        newMaze.push(mazeRow);
    }

    return newMaze;
}


/* =================================
   GENERATE MAZE

   Uses recursive backtracking.

   Every cell becomes reachable, but
   there is only one route between
   each pair of cells.
================================= */

function generateMaze() {

    maze = createEmptyMaze();

    const stack = [];

    let currentCell =
        maze[0][0];

    currentCell.visited = true;

    let visitedCells = 1;

    const totalCells =
        MAZE_SIZE * MAZE_SIZE;


    while (
        visitedCells < totalCells
    ) {

        const neighbours =
            getUnvisitedNeighbours(
                currentCell
            );


        if (neighbours.length > 0) {

            const randomIndex =
                Math.floor(
                    Math.random() *
                    neighbours.length
                );


            const next =
                neighbours[randomIndex];


            removeWalls(
                currentCell,
                next.cell,
                next.direction
            );


            stack.push(
                currentCell
            );


            currentCell =
                next.cell;


            currentCell.visited =
                true;


            visitedCells++;

        } else {

            currentCell =
                stack.pop();

        }

    }


    /*
    The visited property is only
    required while generating.
    */

    maze.forEach(row => {

        row.forEach(cell => {

            delete cell.visited;

        });

    });


    localStorage.setItem(
        STORAGE_KEYS.maze,
        JSON.stringify(maze)
    );

}


/* =================================
   FIND UNVISITED NEIGHBOURS
================================= */

function getUnvisitedNeighbours(
    cell
) {

    const neighbours = [];


    Object.entries(
        DIRECTIONS
    )
    .forEach(
        ([name, direction]) => {

            const newRow =
                cell.row +
                direction.rowChange;


            const newCol =
                cell.col +
                direction.colChange;


            if (
                isInsideMaze(
                    newRow,
                    newCol
                ) &&
                !maze[newRow][newCol]
                    .visited
            ) {

                neighbours.push({

                    direction: name,

                    cell:
                        maze[newRow][newCol]

                });

            }

        }
    );


    /*
    Shuffle choices so the generated
    maze is less predictable.
    */

    shuffleArray(neighbours);


    return neighbours;
}


/* =================================
   REMOVE WALLS
================================= */

function removeWalls(
    currentCell,
    nextCell,
    directionName
) {

    const direction =
        DIRECTIONS[directionName];


    currentCell.walls[
        direction.wall
    ] = false;


    nextCell.walls[
        direction.opposite
    ] = false;

}


/* =================================
   SHUFFLE
================================= */

function shuffleArray(array) {

    for (
        let index =
            array.length - 1;

        index > 0;

        index--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() *
                (index + 1)
            );


        [
            array[index],
            array[randomIndex]
        ] = [
            array[randomIndex],
            array[index]
        ];

    }

}


/* =================================
   LOAD OR GENERATE
================================= */

function loadOrGenerateMaze() {

    const storedMaze =
        localStorage.getItem(
            STORAGE_KEYS.maze
        );


    if (storedMaze) {

        try {

            const parsedMaze =
                JSON.parse(
                    storedMaze
                );


            if (
                Array.isArray(
                    parsedMaze
                ) &&
                parsedMaze.length ===
                    MAZE_SIZE
            ) {

                maze =
                    parsedMaze;

                return;

            }

        } catch (error) {

            console.error(
                "Could not restore maze:",
                error
            );

        }

    }


    generateMaze();

}


/* =================================
   LOAD PLAYER STATE
================================= */

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

}


/* =================================
   DRAW MAZE
================================= */

function drawMaze() {

    const displaySize =
        Math.min(
            canvas.parentElement
                .clientWidth,
            700
        );


    /*
    Scale for sharpness on high-density
    phone screens.
    */

    const pixelRatio =
        window.devicePixelRatio || 1;


    canvas.width =
        displaySize *
        pixelRatio;


    canvas.height =
        displaySize *
        pixelRatio;


    canvas.style.width =
        displaySize + "px";


    canvas.style.height =
        displaySize + "px";


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
        displaySize,
        displaySize
    );


    const cellSize =
        displaySize /
        MAZE_SIZE;


    drawBackground(
        displaySize
    );


    drawStartAndFinish(
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

function drawBackground(size) {

    const gradient =
        context.createLinearGradient(
            0,
            0,
            size,
            size
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
        size,
        size
    );

}


/* =================================
   START AND FINISH CELLS
================================= */

function drawStartAndFinish(
    cellSize
) {

    /*
    Starting square
    */

    context.fillStyle =
        "#dcefdc";


    context.fillRect(
        1,
        1,
        cellSize - 2,
        cellSize - 2
    );


    /*
    Santa square
    */

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
   DRAW WALLS
================================= */

function drawWalls(cellSize) {

    context.strokeStyle =
        "#173c31";


    /*
    Thin enough to preserve the maze
    detail on a phone screen.
    */

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
        "🎅",
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


    /*
    No movement if a wall blocks
    this direction.
    */

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


    /*
    Used by homepage progress bar.
    */

    localStorage.setItem(
        "riddle3",
        "solved"
    );


    showMessage(
        "🎄 Santa found!"
    );


    resultTextElement
        .textContent =
        `The nisse reached Santa in ${moves} moves.`;


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
        `The nisse reached Santa in ${moves} moves.`;


    resultElement.hidden =
        false;


    document
        .querySelector(
            ".maze-controls"
        )
        .hidden =
        true;


    showMessage(
        "✓ Riddle 3 completed"
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
        row < MAZE_SIZE &&
        col >= 0 &&
        col < MAZE_SIZE
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
        "Help 🧝 reach 🎅";

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
            STORAGE_KEYS.maze
        );

        localStorage.removeItem(
            STORAGE_KEYS.player
        );

        localStorage.removeItem(
            STORAGE_KEYS.moves
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

    loadOrGenerateMaze();

    loadPlayerState();

    drawMaze();

    restoreSolvedState();

}


initialiseMaze();