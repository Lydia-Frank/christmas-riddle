"use strict";


/* =================================
   CROSSWORD DATA
=================================

Coordinates start at 0.

row = vertical position
col = horizontal position

id uniquely identifies a word when
across and down share a clue number.
*/

const WORDS = [

    {
        id: "1-down",
        number: 1,
        answer: "CARD",
        clue:
            "Sent with season greetings.",
        row: 0,
        col: 8,
        direction: "down"
    },

    {
        id: "2-across",
        number: 2,
        answer: "SANTACLAUS",
        clue:
            "The man in red who delivers presents.",
        row: 1,
        col: 1,
        direction: "across"
    },

    {
        id: "2-down",
        number: 2,
        answer: "SLEIGH",
        clue:
            "Pulled by reindeer.",
        row: 1,
        col: 1,
        direction: "down"
    },

    {
        id: "3-down",
        number: 3,
        answer: "TREE",
        clue:
            "Often decorated with a star.",
        row: 1,
        col: 4,
        direction: "down"
    },

    {
        id: "4-down",
        number: 4,
        answer: "CAMPAIGN",
        clue:
            "A series of media activities, often accompanied by a promotion.",
        row: 1,
        col: 6,
        direction: "down"
    },

    {
        id: "5-down",
        number: 5,
        answer: "STAR",
        clue:
            "Sits on top of the tree.",
        row: 1,
        col: 10,
        direction: "down"
    },

    {
        id: "6-across",
        number: 6,
        answer: "TV",
        clue:
            "Linear screen channel (abbr.).",
        row: 2,
        col: 10,
        direction: "across"
    },

    {
        id: "7-across",
        number: 7,
        answer: "MEDIA",
        clue:
            "The industry you work in.",
        row: 3,
        col: 6,
        direction: "across"
    },

    {
        id: "8-across",
        number: 8,
        answer: "NISSE",
        clue:
            "A small mythical creature associated with Christmas and fond of rice pudding.",
        row: 4,
        col: 0,
        direction: "across"
    },

    {
        id: "9-down",
        number: 9,
        answer: "ADVERT",
        clue:
            "WPP makes money from this. Only one letter distinguishes it from Sundays in December.",
        row: 5,
        col: 8,
        direction: "down"
    },

    {
        id: "10-down",
        number: 10,
        answer: "BRAND",
        clue:
            "A name and identity customers recognise.",
        row: 5,
        col: 11,
        direction: "down"
    },

    {
        id: "11-across",
        number: 11,
        answer: "REINDEER",
        clue:
            "Santa's team animal.",
        row: 6,
        col: 4,
        direction: "across"
    },

    {
        id: "12-down",
        number: 12,
        answer: "VIDEO",
        clue:
            "Moving-image ad format.",
        row: 7,
        col: 2,
        direction: "down"
    },

    {
        id: "13-across",
        number: 13,
        answer: "ROI",
        clue:
            "Return on investment (abbr.).",
        row: 8,
        col: 0,
        direction: "across"
    },

    {
        id: "14-across",
        number: 14,
        answer: "GINGER",
        clue:
            "___ bread house.",
        row: 8,
        col: 4,
        direction: "across"
    },

    {
        id: "14-down",
        number: 14,
        answer: "GIFT",
        clue:
            "Lies under the tree.",
        row: 8,
        col: 4,
        direction: "down"
    },

    {
        id: "15-across",
        number: 15,
        answer: "AD",
        clue:
            "Short for advertisement.",
        row: 9,
        col: 10,
        direction: "across"
    },

    {
        id: "16-across",
        number: 16,
        answer: "ELF",
        clue:
            "Santa's little helper.",
        row: 10,
        col: 2,
        direction: "across"
    },

    {
        id: "17-across",
        number: 17,
        answer: "DATA",
        clue:
            "Per Jensen works with this and modelling.",
        row: 10,
        col: 6,
        direction: "across"
    }

];


/*
Circled hint cells (1-6) spell ORANGE.
Keys are "row-col" (0-based).
*/
const CIRCLE_HINTS = {
    "8-1": 1,
    "6-11": 2,
    "1-8": 3,
    "8-6": 4,
    "8-4": 5,
    "4-4": 6
};


/* =================================
   GRID SETTINGS
================================= */

const ROWS = 12;
const COLS = 12;


/* =================================
   GAME STATE
================================= */

const cells = {};

let activeWord = null;

let solved =
    localStorage.getItem(
        "crosswordRiddle2Solved"
    ) === "true";


/* =================================
   ELEMENTS
================================= */

const gridElement =
    document.getElementById(
        "crosswordGrid"
    );

const acrossElement =
    document.getElementById(
        "acrossClues"
    );

const downElement =
    document.getElementById(
        "downClues"
    );

const activeClueElement =
    document.getElementById(
        "activeClueBox"
    );

const messageElement =
    document.getElementById(
        "crosswordMessage"
    );

const resultElement =
    document.getElementById(
        "crosswordResult"
    );

const checkButton =
    document.getElementById(
        "checkCrossword"
    );


/* =================================
   BUILD CELL DATA
================================= */

function buildCellData() {

    WORDS.forEach(word => {

        for (
            let index = 0;
            index < word.answer.length;
            index++
        ) {

            let row = word.row;
            let col = word.col;


            if (
                word.direction === "across"
            ) {

                col += index;

            } else {

                row += index;
            }


            const key =
                `${row}-${col}`;

            const letter =
                word.answer[index];


            if (!cells[key]) {

                cells[key] = {

                    row: row,

                    col: col,

                    letter: letter,

                    wordIds: [],

                    startNumber: null,

                    circleNumber:
                        CIRCLE_HINTS[key] ||
                        null

                };

            }


            /*
            Check that crossing words
            agree on the letter.
            */

            if (
                cells[key].letter !==
                letter
            ) {

                console.error(
                    "Crossword conflict at",
                    key,
                    cells[key].letter,
                    letter
                );

            }


            cells[key]
                .wordIds
                .push(word.id);


            if (index === 0) {

                cells[key]
                    .startNumber =
                        word.number;

            }

        }

    });

}


/* =================================
   CREATE GRID
================================= */

function createGrid() {

    gridElement.innerHTML = "";

    gridElement.style.gridTemplateColumns =
        `repeat(${COLS}, 1fr)`;


    for (
        let row = 0;
        row < ROWS;
        row++
    ) {

        for (
            let col = 0;
            col < COLS;
            col++
        ) {

            const key =
                `${row}-${col}`;


            /*
            Completely empty locations
            don't need visible inputs.
            */

            if (!cells[key]) {

                const blank =
                    document.createElement(
                        "div"
                    );

                blank.className =
                    "crossword-cell crossword-empty";

                gridElement.appendChild(
                    blank
                );

                continue;

            }


            const cell =
                document.createElement(
                    "div"
                );

            cell.className =
                "crossword-cell";

            cell.dataset.key =
                key;


            if (cells[key].circleNumber) {

                cell.classList.add(
                    "crossword-circle-cell"
                );

            }


            /* CLUE NUMBER */

            if (
                cells[key].startNumber !==
                null
            ) {

                const number =
                    document.createElement(
                        "span"
                    );

                number.className =
                    "crossword-number";

                number.textContent =
                    cells[key]
                        .startNumber;

                cell.appendChild(
                    number
                );

            }


            /* CIRCLED HINT MARKER */

            if (cells[key].circleNumber) {

                const circle =
                    document.createElement(
                        "span"
                    );

                circle.className =
                    "crossword-circle-marker";

                circle.textContent =
                    cells[key]
                        .circleNumber;

                cell.appendChild(
                    circle
                );

            }


            /* INPUT */

            const input =
                document.createElement(
                    "input"
                );

            input.type = "text";

            input.maxLength = 1;

            input.dataset.key =
                key;

            input.autocomplete =
                "off";

            input.autocapitalize =
                "characters";

            input.spellcheck =
                false;


            input.addEventListener(
                "focus",
                () => {

                    chooseWordFromCell(
                        key
                    );

                }
            );


            input.addEventListener(
                "input",
                event => {

                    handleLetterInput(
                        event
                    );

                }
            );


            input.addEventListener(
                "keydown",
                event => {

                    handleSpecialKey(
                        event
                    );

                }
            );


            cell.appendChild(
                input
            );


            gridElement.appendChild(
                cell
            );

        }

    }

}


/* =================================
   CREATE CLUES
================================= */

function createClues() {

    acrossElement.innerHTML = "";

    downElement.innerHTML = "";


    WORDS.forEach(word => {

        const clue =
            document.createElement(
                "button"
            );


        clue.type = "button";

        clue.className =
            "crossword-clue";

        clue.dataset.word =
            word.id;


        clue.innerHTML =
            `<strong>${word.number}.</strong>
             ${word.clue}`;


        clue.addEventListener(
            "click",
            () => {

                selectWord(
                    word.id
                );

            }
        );


        if (
            word.direction === "across"
        ) {

            acrossElement
                .appendChild(clue);

        }

        else {

            downElement
                .appendChild(clue);

        }

    });

}


/* =================================
   SELECT A WORD
================================= */

function selectWord(id) {

    activeWord =
        WORDS.find(
            word =>
                word.id === id
        );


    if (!activeWord) {
        return;
    }


    clearHighlights();


    const wordCells =
        getWordCells(
            activeWord
        );


    wordCells.forEach(
        cell => {

            const element =
                getCellElement(
                    cell.key
                );

            if (element) {

                element
                    .classList
                    .add(
                        "crossword-highlight"
                    );

            }

        }
    );


    /*
    Highlight clue.
    */

    const clue =
        document.querySelector(
            `.crossword-clue[data-word="${id}"]`
        );


    if (clue) {

        clue.classList.add(
            "active"
        );

    }


    activeClueElement.innerHTML =
        `<strong>
            ${activeWord.number}.
        </strong>
        ${activeWord.clue}`;


    /*
    Focus first empty letter.

    If complete, focus first square.
    */

    let target =
        wordCells.find(cell => {

            const input =
                getInput(
                    cell.key
                );

            return (
                input &&
                !input.value
            );

        });


    if (!target) {

        target =
            wordCells[0];

    }


    const targetInput =
        getInput(
            target.key
        );


    if (targetInput) {

        targetInput.focus();

    }

}


/* =================================
   SELECT FROM CELL
================================= */

function chooseWordFromCell(key) {

    const cell =
        cells[key];


    if (!cell) {
        return;
    }


    /*
    If active word already passes
    through this square, keep it.
    */

    if (
        activeWord &&
        cell.wordIds.includes(
            activeWord.id
        )
    ) {

        highlightActiveWord();

        return;

    }


    /*
    Otherwise select the first word
    attached to the square.
    */

    selectWord(
        cell.wordIds[0]
    );

}


/* =================================
   HIGHLIGHT ACTIVE WORD
================================= */

function highlightActiveWord() {

    if (!activeWord) {
        return;
    }


    clearHighlights();


    getWordCells(
        activeWord
    )
        .forEach(cell => {

            const element =
                getCellElement(
                    cell.key
                );

            if (element) {

                element
                    .classList
                    .add(
                        "crossword-highlight"
                    );

            }

        });


    const clue =
        document.querySelector(
            `.crossword-clue[data-word="${activeWord.id}"]`
        );


    if (clue) {

        clue.classList.add(
            "active"
        );

    }


    activeClueElement.innerHTML =
        `<strong>
            ${activeWord.number}.
        </strong>
        ${activeWord.clue}`;

}


/* =================================
   CLEAR HIGHLIGHTS
================================= */

function clearHighlights() {

    document
        .querySelectorAll(
            ".crossword-highlight"
        )
        .forEach(element => {

            element.classList.remove(
                "crossword-highlight"
            );

        });


    document
        .querySelectorAll(
            ".crossword-clue.active"
        )
        .forEach(element => {

            element.classList.remove(
                "active"
            );

        });

}


/* =================================
   GET CELLS BELONGING TO WORD
================================= */

function getWordCells(word) {

    const result = [];


    for (
        let index = 0;
        index < word.answer.length;
        index++
    ) {

        let row =
            word.row;

        let col =
            word.col;


        if (
            word.direction === "across"
        ) {

            col += index;

        }

        else {

            row += index;

        }


        result.push({

            key:
                `${row}-${col}`,

            index:
                index

        });

    }


    return result;

}


/* =================================
   INPUT
================================= */

function handleLetterInput(event) {

    if (solved) {
        return;
    }


    const input =
        event.target;


    input.value =
        input.value
            .toUpperCase()
            .replace(
                /[^A-Z]/g,
                ""
            )
            .slice(-1);


    saveProgress();


    if (input.value) {

        moveToNextSquare(
            input.dataset.key
        );

    }


    clearMessage();

}


/* =================================
   NEXT CELL

   Skip ahead to the next empty
   square in the active word.
================================= */

function moveToNextSquare(
    currentKey
) {

    if (!activeWord) {
        return;
    }


    const wordCells =
        getWordCells(
            activeWord
        );


    const currentIndex =
        wordCells.findIndex(
            cell =>
                cell.key ===
                currentKey
        );


    if (
        currentIndex === -1
    ) {
        return;
    }


    for (
        let index =
            currentIndex + 1;
        index < wordCells.length;
        index++
    ) {

        const nextInput =
            getInput(
                wordCells[index].key
            );


        if (
            nextInput &&
            !nextInput.value
        ) {

            nextInput.focus();

            return;

        }

    }

}


/* =================================
   BACKSPACE / ARROWS
================================= */

function handleSpecialKey(event) {

    if (!activeWord) {
        return;
    }


    const wordCells =
        getWordCells(
            activeWord
        );


    const currentKey =
        event.target.dataset.key;


    const index =
        wordCells.findIndex(
            cell =>
                cell.key ===
                currentKey
        );


    if (index === -1) {
        return;
    }


    /*
    BACKSPACE

    If current square is already empty,
    go backwards.
    */

    if (
        event.key === "Backspace" &&
        !event.target.value &&
        index > 0
    ) {

        event.preventDefault();


        const previous =
            getInput(
                wordCells[
                    index - 1
                ].key
            );


        if (previous) {

            previous.value = "";

            previous.focus();

            saveProgress();

        }

    }


    /*
    LEFT / UP
    */

    if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowUp"
    ) {

        if (index > 0) {

            event.preventDefault();

            getInput(
                wordCells[
                    index - 1
                ].key
            )?.focus();

        }

    }


    /*
    RIGHT / DOWN
    */

    if (
        event.key === "ArrowRight" ||
        event.key === "ArrowDown"
    ) {

        if (
            index <
            wordCells.length - 1
        ) {

            event.preventDefault();

            getInput(
                wordCells[
                    index + 1
                ].key
            )?.focus();

        }

    }

}


/* =================================
   HELPERS
================================= */

function getInput(key) {

    return document.querySelector(
        `input[data-key="${key}"]`
    );

}


function getCellElement(key) {

    return document.querySelector(
        `.crossword-cell[data-key="${key}"]`
    );

}


/* =================================
   SAVE
================================= */

function saveProgress() {

    const progress = {};


    document
        .querySelectorAll(
            ".crossword-cell input"
        )
        .forEach(input => {

            progress[
                input.dataset.key
            ] =
                input.value;

        });


    localStorage.setItem(
        "crosswordRiddle2Progress",
        JSON.stringify(progress)
    );

}


/* =================================
   RESTORE
================================= */

function restoreProgress() {

    const saved =
        localStorage.getItem(
            "crosswordRiddle2Progress"
        );


    if (!saved) {
        return;
    }


    try {

        const progress =
            JSON.parse(saved);


        Object.entries(
            progress
        )
        .forEach(
            ([key, value]) => {

                const input =
                    getInput(key);


                if (input) {

                    input.value =
                        value;

                }

            }
        );

    }

    catch {

        console.error(
            "Could not restore crossword progress."
        );

    }

}


/* =================================
   CHECK CROSSWORD
================================= */

function checkCrossword() {

    let emptySquares = 0;

    let wrongSquares = 0;


    Object.keys(cells)
        .forEach(key => {

            const input =
                getInput(key);


            if (
                !input ||
                !input.value
            ) {

                emptySquares++;

                return;

            }


            if (
                input.value
                    .toUpperCase() !==
                cells[key].letter
            ) {

                wrongSquares++;

            }

        });


    /*
    We deliberately don't show which
    individual squares are wrong.
    */


    if (emptySquares > 0) {

        showMessage(
            "🧩 You still have some empty squares."
        );

        return;

    }


    if (wrongSquares > 0) {

        showMessage(
            "👀 Something isn't quite right. Check your answers."
        );

        return;

    }


    completeCrossword();

}


/* =================================
   SUCCESS
================================= */

function completeCrossword() {

    solved = true;


    localStorage.setItem(
        "crosswordRiddle2Solved",
        "true"
    );


    /*
    Used by homepage progress bar.
    */

    localStorage.setItem(
        "riddle2",
        "solved"
    );


    showMessage(
        "✅ Clues decoded!"
    );


    resultElement.hidden =
        false;


    checkButton.hidden =
        true;


    /*
    Lock completed crossword.
    */

    document
        .querySelectorAll(
            ".crossword-cell input"
        )
        .forEach(input => {

            input.readOnly = true;

        });

}


/* =================================
   RESTORE SOLVED STATE
================================= */

function restoreSolvedState() {

    if (!solved) {
        return;
    }


    resultElement.hidden =
        false;


    checkButton.hidden =
        true;


    document
        .querySelectorAll(
            ".crossword-cell input"
        )
        .forEach(input => {

            input.readOnly = true;

        });

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
        "";

}


/* =================================
   RESET
================================= */

document
    .getElementById(
        "resetCrossword"
    )
    .addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "crosswordRiddle2Progress"
            );

            localStorage.removeItem(
                "crosswordRiddle2Solved"
            );

            localStorage.removeItem(
                "riddle2"
            );


            window.location.reload();

        }
    );


/* =================================
   CHECK BUTTON
================================= */

checkButton.addEventListener(
    "click",
    checkCrossword
);


/* =================================
   INITIALISE
================================= */

function initialiseCrossword() {

    buildCellData();

    createGrid();

    createClues();

    restoreProgress();

    restoreSolvedState();


    /*
    Start with first clue selected
    if puzzle isn't solved.
    */

    if (!solved) {

        selectWord("1-down");

    }

}


initialiseCrossword();
