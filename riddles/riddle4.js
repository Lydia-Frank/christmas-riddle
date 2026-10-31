"use strict";


/* =================================
   PICTURE PUZZLE (5 × 5)
================================= */

const GRID_SIZE = 5;

const PIECE_COUNT = GRID_SIZE * GRID_SIZE;

const IMAGE_SRC = "../assets/christmas-puzzle.jpg";


const STORAGE_KEYS = {

    board:
        "puzzleRiddle4Board",

    tray:
        "puzzleRiddle4Tray",

    solved:
        "puzzleRiddle4Solved"

};


/* =================================
   STATE
================================= */

/*
boardSlots[i] = piece index in that
slot, or null when empty.
Piece index = correct slot index.
*/

let boardSlots = Array(PIECE_COUNT)
    .fill(null);

/*
trayOrder = piece indexes still in
the tray (scrambled order).
*/

let trayOrder = [];

let selectedPiece = null;

let selectedFrom = null;

let solved =
    localStorage.getItem(
        STORAGE_KEYS.solved
    ) === "true";

let dragPiece = null;

let dragFrom = null;


/* =================================
   PAGE ELEMENTS
================================= */

const boardElement =
    document.getElementById(
        "puzzleBoard"
    );

const trayElement =
    document.getElementById(
        "puzzleTray"
    );

const messageElement =
    document.getElementById(
        "puzzleMessage"
    );

const resultElement =
    document.getElementById(
        "puzzleResult"
    );

const resultTextElement =
    document.getElementById(
        "puzzleResultText"
    );

const resetButton =
    document.getElementById(
        "resetPuzzle"
    );


/* =================================
   HELPERS
================================= */

function pieceBackground(pieceIndex) {

    const row =
        Math.floor(
            pieceIndex / GRID_SIZE
        );

    const col =
        pieceIndex % GRID_SIZE;

    const x =
        (col / (GRID_SIZE - 1)) * 100;

    const y =
        (row / (GRID_SIZE - 1)) * 100;

    return {
        backgroundImage:
            "url(" + IMAGE_SRC + ")",
        backgroundSize:
            (GRID_SIZE * 100) + "%",
        backgroundPosition:
            x + "% " + y + "%"
    };

}


function applyPieceStyle(element, pieceIndex) {

    const style =
        pieceBackground(pieceIndex);

    element.style.backgroundImage =
        style.backgroundImage;

    element.style.backgroundSize =
        style.backgroundSize;

    element.style.backgroundPosition =
        style.backgroundPosition;

}


function shuffle(list) {

    const items = list.slice();

    for (
        let i = items.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        const temp = items[i];
        items[i] = items[j];
        items[j] = temp;

    }

    return items;

}


function clearSelection() {

    selectedPiece = null;
    selectedFrom = null;

    document
        .querySelectorAll(
            ".puzzle-piece.selected"
        )
        .forEach(element => {
            element.classList.remove(
                "selected"
            );
        });

}


function showMessage(message) {

    messageElement.textContent =
        message;

}


/* =================================
   PERSISTENCE
================================= */

function saveState() {

    localStorage.setItem(
        STORAGE_KEYS.board,
        JSON.stringify(boardSlots)
    );

    localStorage.setItem(
        STORAGE_KEYS.tray,
        JSON.stringify(trayOrder)
    );

}


function loadState() {

    const storedBoard =
        localStorage.getItem(
            STORAGE_KEYS.board
        );

    const storedTray =
        localStorage.getItem(
            STORAGE_KEYS.tray
        );

    if (!storedBoard || !storedTray) {
        return false;
    }

    try {

        const board =
            JSON.parse(storedBoard);

        const tray =
            JSON.parse(storedTray);

        if (
            !Array.isArray(board) ||
            !Array.isArray(tray) ||
            board.length !== PIECE_COUNT
        ) {
            return false;
        }

        const seen = new Set();

        for (let i = 0; i < board.length; i++) {

            const value = board[i];

            if (
                value !== null &&
                (
                    !Number.isInteger(value) ||
                    value < 0 ||
                    value >= PIECE_COUNT ||
                    seen.has(value)
                )
            ) {
                return false;
            }

            if (value !== null) {
                seen.add(value);
            }

        }

        for (let i = 0; i < tray.length; i++) {

            const value = tray[i];

            if (
                !Number.isInteger(value) ||
                value < 0 ||
                value >= PIECE_COUNT ||
                seen.has(value)
            ) {
                return false;
            }

            seen.add(value);

        }

        if (seen.size !== PIECE_COUNT) {
            return false;
        }

        boardSlots = board;
        trayOrder = tray;

        return true;

    } catch (error) {

        console.error(
            "Could not restore puzzle:",
            error
        );

        return false;

    }

}


function createFreshPuzzle() {

    boardSlots = Array(PIECE_COUNT)
        .fill(null);

    trayOrder = shuffle(
        Array.from(
            {
                length: PIECE_COUNT
            },
            (_, index) => index
        )
    );

    /*
    Avoid an already-solved shuffle
    (extremely unlikely with empty board).
    */

    saveState();

}


/* =================================
   RENDER
================================= */

function createPieceElement(pieceIndex, origin, slotIndex) {

    const piece =
        document.createElement("button");

    piece.type = "button";
    piece.className = "puzzle-piece";
    piece.dataset.piece = String(pieceIndex);
    piece.dataset.origin = origin;

    if (typeof slotIndex === "number") {
        piece.dataset.slot =
            String(slotIndex);
    }

    piece.setAttribute(
        "aria-label",
        "Puzzle piece " + (pieceIndex + 1)
    );

    applyPieceStyle(piece, pieceIndex);

    if (!solved) {

        piece.draggable = true;

        piece.addEventListener(
            "click",
            onPieceClick
        );

        piece.addEventListener(
            "dragstart",
            onDragStart
        );

        piece.addEventListener(
            "dragend",
            onDragEnd
        );

    }

    return piece;

}


function renderBoard() {

    boardElement.innerHTML = "";

    for (
        let slot = 0;
        slot < PIECE_COUNT;
        slot++
    ) {

        const cell =
            document.createElement("div");

        cell.className = "puzzle-slot";
        cell.dataset.slot = String(slot);

        const pieceIndex =
            boardSlots[slot];

        if (pieceIndex === null) {

            cell.classList.add("empty");

            if (!solved) {

                cell.addEventListener(
                    "click",
                    onEmptySlotClick
                );

                cell.addEventListener(
                    "dragover",
                    onDragOver
                );

                cell.addEventListener(
                    "drop",
                    onDropOnSlot
                );

            }

        } else {

            if (
                pieceIndex === slot
            ) {
                cell.classList.add(
                    "correct"
                );
            }

            cell.appendChild(
                createPieceElement(
                    pieceIndex,
                    "board",
                    slot
                )
            );

            if (!solved) {

                cell.addEventListener(
                    "dragover",
                    onDragOver
                );

                cell.addEventListener(
                    "drop",
                    onDropOnSlot
                );

            }

        }

        boardElement.appendChild(cell);

    }

}


function renderTray() {

    trayElement.innerHTML = "";

    if (trayOrder.length === 0) {

        trayElement.classList.add(
            "is-empty"
        );

        return;

    }

    trayElement.classList.remove(
        "is-empty"
    );

    trayOrder.forEach(pieceIndex => {

        trayElement.appendChild(
            createPieceElement(
                pieceIndex,
                "tray"
            )
        );

    });

}


function renderAll() {

    renderBoard();
    renderTray();

}


/* =================================
   PLACEMENT LOGIC
================================= */

function removePieceFromOrigin(pieceIndex, origin, slotIndex) {

    if (origin === "tray") {

        trayOrder = trayOrder.filter(
            value => value !== pieceIndex
        );

        return;

    }

    if (
        origin === "board" &&
        typeof slotIndex === "number" &&
        boardSlots[slotIndex] === pieceIndex
    ) {

        boardSlots[slotIndex] = null;

    }

}


function placePieceOnBoard(pieceIndex, targetSlot, fromOrigin, fromSlot) {

    if (solved) {
        return;
    }

    if (
        targetSlot < 0 ||
        targetSlot >= PIECE_COUNT
    ) {
        return;
    }

    const occupying =
        boardSlots[targetSlot];

    /*
    Same piece already there — no-op.
    */

    if (occupying === pieceIndex) {
        clearSelection();
        return;
    }

    removePieceFromOrigin(
        pieceIndex,
        fromOrigin,
        fromSlot
    );

    if (occupying !== null) {

        /*
        Swap: displaced piece goes to
        the source slot, or tray if the
        piece came from the tray.
        */

        if (
            fromOrigin === "board" &&
            typeof fromSlot === "number"
        ) {

            boardSlots[fromSlot] =
                occupying;

        } else {

            trayOrder.push(occupying);

        }

    }

    boardSlots[targetSlot] = pieceIndex;

    clearSelection();
    saveState();
    renderAll();
    checkForWin();

}


function returnPieceToTray(pieceIndex, fromSlot) {

    if (solved) {
        return;
    }

    if (
        boardSlots[fromSlot] !==
        pieceIndex
    ) {
        return;
    }

    boardSlots[fromSlot] = null;
    trayOrder.push(pieceIndex);

    clearSelection();
    saveState();
    renderAll();

    showMessage(
        "Piece returned to the tray."
    );

}


/* =================================
   CLICK / TAP
================================= */

function onPieceClick(event) {

    event.stopPropagation();

    if (solved) {
        return;
    }

    const piece = event.currentTarget;
    const pieceIndex =
        Number(piece.dataset.piece);
    const origin = piece.dataset.origin;
    const slotIndex =
        piece.dataset.slot === undefined
            ? null
            : Number(piece.dataset.slot);

    /*
    Second tap on a selected board piece
    returns it to the tray.
    */

    if (
        selectedPiece === pieceIndex &&
        origin === "board" &&
        typeof slotIndex === "number"
    ) {

        returnPieceToTray(
            pieceIndex,
            slotIndex
        );

        return;

    }

    /*
    If a piece is already selected and
    this board piece is tapped, swap.
    */

    if (
        selectedPiece !== null &&
        origin === "board" &&
        typeof slotIndex === "number"
    ) {

        placePieceOnBoard(
            selectedPiece,
            slotIndex,
            selectedFrom.origin,
            selectedFrom.slot
        );

        return;

    }

    clearSelection();

    selectedPiece = pieceIndex;
    selectedFrom = {
        origin: origin,
        slot: slotIndex
    };

    piece.classList.add("selected");

    showMessage(
        origin === "tray"
            ? "Now tap an empty square on the board."
            : "Tap another square to move, or tap again to return to the tray."
    );

}


function onEmptySlotClick(event) {

    if (solved) {
        return;
    }

    if (selectedPiece === null) {

        showMessage(
            "Select a piece first."
        );

        return;

    }

    const slot =
        Number(
            event.currentTarget
                .dataset.slot
        );

    placePieceOnBoard(
        selectedPiece,
        slot,
        selectedFrom.origin,
        selectedFrom.slot
    );

}


/* =================================
   DRAG AND DROP
================================= */

function onDragStart(event) {

    if (solved) {
        event.preventDefault();
        return;
    }

    const piece = event.currentTarget;

    dragPiece =
        Number(piece.dataset.piece);

    dragFrom = {
        origin: piece.dataset.origin,
        slot:
            piece.dataset.slot === undefined
                ? null
                : Number(piece.dataset.slot)
    };

    piece.classList.add("dragging");

    event.dataTransfer.effectAllowed =
        "move";

    event.dataTransfer.setData(
        "text/plain",
        String(dragPiece)
    );

    clearSelection();

}


function onDragEnd(event) {

    event.currentTarget.classList.remove(
        "dragging"
    );

    dragPiece = null;
    dragFrom = null;

}


function onDragOver(event) {

    if (solved || dragPiece === null) {
        return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

}


function onDropOnSlot(event) {

    event.preventDefault();

    if (
        solved ||
        dragPiece === null ||
        !dragFrom
    ) {
        return;
    }

    const slot =
        Number(
            event.currentTarget
                .dataset.slot
        );

    placePieceOnBoard(
        dragPiece,
        slot,
        dragFrom.origin,
        dragFrom.slot
    );

    dragPiece = null;
    dragFrom = null;

}


/*
Allow dropping back onto the tray.
*/

trayElement.addEventListener(
    "dragover",
    event => {

        if (solved || dragPiece === null) {
            return;
        }

        if (dragFrom.origin !== "board") {
            return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect =
            "move";

    }
);


trayElement.addEventListener(
    "drop",
    event => {

        event.preventDefault();

        if (
            solved ||
            dragPiece === null ||
            !dragFrom ||
            dragFrom.origin !== "board"
        ) {
            return;
        }

        returnPieceToTray(
            dragPiece,
            dragFrom.slot
        );

        dragPiece = null;
        dragFrom = null;

    }
);


/* =================================
   WIN
================================= */

function isBoardComplete() {

    for (
        let i = 0;
        i < PIECE_COUNT;
        i++
    ) {

        if (boardSlots[i] !== i) {
            return false;
        }

    }

    return true;

}


function checkForWin() {

    if (!isBoardComplete()) {

        const placed =
            boardSlots.filter(
                value => value !== null
            ).length;

        showMessage(
            placed +
            " / " +
            PIECE_COUNT +
            " pieces placed."
        );

        return;

    }

    completePuzzle();

}


function completePuzzle() {

    solved = true;

    localStorage.setItem(
        STORAGE_KEYS.solved,
        "true"
    );

    localStorage.setItem(
        "riddle4",
        "solved"
    );

    clearSelection();
    renderAll();
    showSolvedUi(
        "🎄 Picture complete!"
    );

}


function showSolvedUi(message) {

    resultTextElement.textContent =
        "You put the Christmas scene back together.";

    resultElement.hidden = false;

    showMessage(message);

}


function restoreSolvedState() {

    if (!solved) {
        return;
    }

    boardSlots = Array.from(
        {
            length: PIECE_COUNT
        },
        (_, index) => index
    );

    trayOrder = [];

    renderAll();

    showSolvedUi(
        "✓ Riddle 4 completed"
    );

}


/* =================================
   RESET
================================= */

resetButton.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            STORAGE_KEYS.board
        );

        localStorage.removeItem(
            STORAGE_KEYS.tray
        );

        localStorage.removeItem(
            STORAGE_KEYS.solved
        );

        localStorage.removeItem(
            "riddle4"
        );

        window.location.reload();

    }
);


/* =================================
   INITIALISE
================================= */

function initialisePuzzle() {

    if (solved) {
        restoreSolvedState();
        return;
    }

    if (!loadState()) {
        createFreshPuzzle();
    }

    renderAll();

    showMessage(
        "Rebuild the snowy scene."
    );

}


initialisePuzzle();
