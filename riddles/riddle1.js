"use strict";


/* --------------------------------
   WORD LISTS
-------------------------------- */

/*
Possible solution words.

Every solution must be exactly
five letters long.
*/

const SOLUTION_WORDS = [
    "ANGEL",
    "BELLS",
    "COMET",
    "ELVES",
    "GIFTS",
    "HOLLY",
    "LIGHT",
    "MERRY",
    "SANTA",
    "SNOWY",
    "TREES",
    "CANDY",
    "CAROL",
    "JESUS",
    "JOLLY",
    "CHEER"
];


/*
Additional words that players are
allowed to guess.

The solution words are automatically
accepted, so they do not need to be
repeated here.
*/




/*
There is one invalid entry above:
"SECRET" has six letters.

This filter ensures that only valid
five-letter words enter the game.
*/

let VALID_GUESSES = new Set();


async function loadValidGuesses() {

    try {

        const response = await fetch("words.txt");

        if (!response.ok) {
            throw new Error("Could not load words.txt");
        }

        const text = await response.text();

        const words = text
            .split(/\r?\n/)
            .map(word => word.trim().toUpperCase())
            .filter(word => /^[A-Z]{5}$/.test(word));


        VALID_GUESSES = new Set([
            ...words,
            ...SOLUTION_WORDS
        ]);


        console.log(
            "Loaded",
            VALID_GUESSES.size,
            "valid Wordle guesses"
        );

    } catch (error) {

        console.error(
            "Could not load word list:",
            error
        );

        /*
        Fallback:
        At least allow the possible answers.
        */

        VALID_GUESSES =
            new Set(SOLUTION_WORDS);
    }
}

/* --------------------------------
   GAME SETTINGS
-------------------------------- */

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

const STORAGE_KEYS = {
    answer: "wordleRiddle1Answer",
    guesses: "wordleRiddle1Guesses",
    finished: "wordleRiddle1Finished",
    won: "wordleRiddle1Won"
};


/* --------------------------------
   GAME STATE
-------------------------------- */

let answer = "";
let currentGuess = "";
let submittedGuesses = [];
let gameFinished = false;
let gameWon = false;


/* --------------------------------
   PAGE ELEMENTS
-------------------------------- */

const gridElement =
    document.getElementById("wordleGrid");

const keyboardElement =
    document.getElementById("wordleKeyboard");

const messageElement =
    document.getElementById("wordleMessage");

const resultElement =
    document.getElementById("wordleResult");

const resultTitleElement =
    document.getElementById("resultTitle");

const resultTextElement =
    document.getElementById("resultText");

const resetButton =
    document.getElementById("resetWordleButton");


/* --------------------------------
   KEYBOARD LAYOUT
-------------------------------- */

const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"]
];


/* --------------------------------
   START GAME
-------------------------------- */

function initialiseGame() {

    answer = getOrCreateAnswer();

    submittedGuesses = getSavedGuesses();

    gameFinished =
        localStorage.getItem(STORAGE_KEYS.finished) === "true";

    gameWon =
        localStorage.getItem(STORAGE_KEYS.won) === "true";

    createGrid();

    createKeyboard();

    restoreSubmittedGuesses();

    updateCurrentRow();

    if (gameFinished) {
        showCompletedGame();
    }

    /*
    DEVELOPMENT ONLY:

    Open the browser console to see
    the selected answer.

    Delete this console.log before
    the Christmas party.
    */

    console.log("Riddle 1 answer:", answer);
}


/* --------------------------------
   SELECT AND SAVE ANSWER
-------------------------------- */

function getOrCreateAnswer() {

    const savedAnswer =
        localStorage.getItem(STORAGE_KEYS.answer);

    if (
        savedAnswer &&
        SOLUTION_WORDS.includes(savedAnswer)
    ) {
        return savedAnswer;
    }

    const randomIndex =
        Math.floor(
            Math.random() * SOLUTION_WORDS.length
        );

    const selectedAnswer =
        SOLUTION_WORDS[randomIndex];

    localStorage.setItem(
        STORAGE_KEYS.answer,
        selectedAnswer
    );

    return selectedAnswer;
}


/* --------------------------------
   GET SAVED GUESSES
-------------------------------- */

function getSavedGuesses() {

    const savedGuesses =
        localStorage.getItem(STORAGE_KEYS.guesses);

    if (!savedGuesses) {
        return [];
    }

    try {

        const parsedGuesses =
            JSON.parse(savedGuesses);

        if (!Array.isArray(parsedGuesses)) {
            return [];
        }

        return parsedGuesses.filter(
            guess =>
                typeof guess === "string" &&
                guess.length === WORD_LENGTH
        );

    } catch (error) {

        console.error(
            "Could not restore saved guesses:",
            error
        );

        return [];
    }
}


/* --------------------------------
   CREATE GRID
-------------------------------- */

function createGrid() {

    gridElement.innerHTML = "";

    for (
        let row = 0;
        row < MAX_ATTEMPTS;
        row++
    ) {

        const rowElement =
            document.createElement("div");

        rowElement.className = "wordle-row";

        rowElement.setAttribute(
            "aria-label",
            "Attempt " + (row + 1)
        );

        for (
            let column = 0;
            column < WORD_LENGTH;
            column++
        ) {

            const tileElement =
                document.createElement("div");

            tileElement.className = "wordle-tile";

            tileElement.id =
                `tile-${row}-${column}`;

            tileElement.setAttribute(
                "aria-label",
                `Attempt ${row + 1}, letter ${column + 1}`
            );

            rowElement.appendChild(tileElement);
        }

        gridElement.appendChild(rowElement);
    }
}


/* --------------------------------
   CREATE KEYBOARD
-------------------------------- */

function createKeyboard() {

    keyboardElement.innerHTML = "";

    KEYBOARD_ROWS.forEach(row => {

        const rowElement =
            document.createElement("div");

        rowElement.className =
            "wordle-keyboard-row";

        row.forEach(key => {

            const buttonElement =
                document.createElement("button");

            buttonElement.type = "button";

            buttonElement.className =
                "wordle-key";

            buttonElement.dataset.key = key;

            if (key === "ENTER") {

                buttonElement.textContent =
                    "ENTER";

                buttonElement.classList.add(
                    "wordle-key-wide"
                );

                buttonElement.setAttribute(
                    "aria-label",
                    "Submit guess"
                );

            } else if (key === "BACKSPACE") {

                buttonElement.textContent =
                    "⌫";

                buttonElement.classList.add(
                    "wordle-key-wide"
                );

                buttonElement.setAttribute(
                    "aria-label",
                    "Delete letter"
                );

            } else {

                buttonElement.textContent = key;

                buttonElement.setAttribute(
                    "aria-label",
                    "Letter " + key
                );
            }

            buttonElement.addEventListener(
                "click",
                () => handleInput(key)
            );

            rowElement.appendChild(buttonElement);
        });

        keyboardElement.appendChild(rowElement);
    });
}


/* --------------------------------
   HANDLE INPUT
-------------------------------- */

function handleInput(key) {

    if (gameFinished) {
        return;
    }

    if (key === "ENTER") {
        submitGuess();
        return;
    }

    if (key === "BACKSPACE") {

        currentGuess =
            currentGuess.slice(0, -1);

        updateCurrentRow();

        clearMessage();

        return;
    }

    if (
        /^[A-Z]$/.test(key) &&
        currentGuess.length < WORD_LENGTH
    ) {

        currentGuess += key;

        updateCurrentRow();

        clearMessage();
    }
}


/* --------------------------------
   DISPLAY CURRENT GUESS
-------------------------------- */

function updateCurrentRow() {

    const currentRow =
        submittedGuesses.length;

    if (currentRow >= MAX_ATTEMPTS) {
        return;
    }

    for (
        let column = 0;
        column < WORD_LENGTH;
        column++
    ) {

        const tileElement =
            document.getElementById(
                `tile-${currentRow}-${column}`
            );

        const letter =
            currentGuess[column] || "";

        tileElement.textContent = letter;

        tileElement.classList.toggle(
            "filled",
            Boolean(letter)
        );
    }
}


/* --------------------------------
   SUBMIT GUESS
-------------------------------- */

function submitGuess() {

    if (currentGuess.length !== WORD_LENGTH) {

        showMessage(
            "Enter a five-letter word."
        );

        shakeCurrentRow();

        return;
    }

    if (!VALID_GUESSES.has(currentGuess)) {

        showMessage(
            "That word is not in the word list."
        );

        shakeCurrentRow();

        return;
    }

    const submittedGuess = currentGuess;

    submittedGuesses.push(submittedGuess);

    localStorage.setItem(
        STORAGE_KEYS.guesses,
        JSON.stringify(submittedGuesses)
    );

    revealGuess(
        submittedGuess,
        submittedGuesses.length - 1
    );

    currentGuess = "";

    if (submittedGuess === answer) {
        winGame();
        return;
    }

    if (
        submittedGuesses.length >= MAX_ATTEMPTS
    ) {
        loseGame();
        return;
    }

    clearMessage();
}


/* --------------------------------
   EVALUATE GUESS

   correct = green
   present = yellow
   absent  = grey
-------------------------------- */

function evaluateGuess(guess, solution) {

    const result =
        Array(WORD_LENGTH).fill("absent");

    const remainingSolutionLetters =
        solution.split("");

    const remainingGuessLetters =
        guess.split("");


    /*
    First pass: identify letters that
    are in the correct position.
    */

    for (
        let index = 0;
        index < WORD_LENGTH;
        index++
    ) {

        if (
            remainingGuessLetters[index] ===
            remainingSolutionLetters[index]
        ) {

            result[index] = "correct";

            remainingSolutionLetters[index] = null;

            remainingGuessLetters[index] = null;
        }
    }


    /*
    Second pass: identify letters that
    exist elsewhere in the answer.
    */

    for (
        let index = 0;
        index < WORD_LENGTH;
        index++
    ) {

        const letter =
            remainingGuessLetters[index];

        if (letter === null) {
            continue;
        }

        const matchingIndex =
            remainingSolutionLetters.indexOf(letter);

        if (matchingIndex !== -1) {

            result[index] = "present";

            remainingSolutionLetters[matchingIndex] =
                null;
        }
    }

    return result;
}


/* --------------------------------
   REVEAL SUBMITTED GUESS
-------------------------------- */

function revealGuess(guess, rowNumber) {

    const evaluation =
        evaluateGuess(guess, answer);

    for (
        let column = 0;
        column < WORD_LENGTH;
        column++
    ) {

        const tileElement =
            document.getElementById(
                `tile-${rowNumber}-${column}`
            );

        tileElement.textContent =
            guess[column];

        tileElement.classList.add("filled");

        tileElement.classList.add(
            evaluation[column]
        );

        updateKeyboardKey(
            guess[column],
            evaluation[column]
        );
    }
}


/* --------------------------------
   RESTORE PREVIOUS GUESSES
-------------------------------- */

function restoreSubmittedGuesses() {

    submittedGuesses.forEach(
        (guess, rowNumber) => {

            revealGuess(
                guess,
                rowNumber
            );
        }
    );
}


/* --------------------------------
   UPDATE KEYBOARD COLOURS
-------------------------------- */

function updateKeyboardKey(letter, status) {

    const keyElement =
        keyboardElement.querySelector(
            `[data-key="${letter}"]`
        );

    if (!keyElement) {
        return;
    }

    /*
    Green has the highest priority,
    followed by yellow, then grey.
    */

    const currentPriority =
        getStatusPriority(
            getKeyStatus(keyElement)
        );

    const newPriority =
        getStatusPriority(status);

    if (
        newPriority < currentPriority
    ) {
        return;
    }

    keyElement.classList.remove(
        "correct",
        "present",
        "absent"
    );

    keyElement.classList.add(status);
}


function getKeyStatus(keyElement) {

    if (
        keyElement.classList.contains("correct")
    ) {
        return "correct";
    }

    if (
        keyElement.classList.contains("present")
    ) {
        return "present";
    }

    if (
        keyElement.classList.contains("absent")
    ) {
        return "absent";
    }

    return "unused";
}


function getStatusPriority(status) {

    const priorities = {
        unused: 0,
        absent: 1,
        present: 2,
        correct: 3
    };

    return priorities[status];
}


/* --------------------------------
   WIN GAME
-------------------------------- */

function winGame() {

    gameFinished = true;
    gameWon = true;

    localStorage.setItem(
        STORAGE_KEYS.finished,
        "true"
    );

    localStorage.setItem(
        STORAGE_KEYS.won,
        "true"
    );

    /*
    This is the value checked by the
    homepage progress bar.
    */

    localStorage.setItem(
        "riddle1",
        "solved"
    );

    showMessage("🎄 Correct!");

    showCompletedGame();
}


/* --------------------------------
   LOSE GAME
-------------------------------- */

function loseGame() {

    gameFinished = true;
    gameWon = false;

    localStorage.setItem(
        STORAGE_KEYS.finished,
        "true"
    );

    localStorage.setItem(
        STORAGE_KEYS.won,
        "false"
    );

    showMessage(
        "The hidden word was " + answer + "."
    );

    showCompletedGame();
}


/* --------------------------------
   COMPLETED GAME PANEL
-------------------------------- */

function showCompletedGame() {

    resultElement.hidden = false;

    keyboardElement.hidden = true;

    if (gameWon) {

        resultTitleElement.textContent =
            "Riddle solved!";

        resultTextElement.textContent =
            `You found the hidden word: ${answer}.`;

    } else {

        resultTitleElement.textContent =
            "The word escaped!";

        resultTextElement.textContent =
            `The hidden word was ${answer}. Use the reset button to try a new word.`;
    }
}


/* --------------------------------
   MESSAGES
-------------------------------- */

function showMessage(message) {

    messageElement.textContent = message;
}


function clearMessage() {

    messageElement.textContent = "";
}


/* --------------------------------
   SHAKE INVALID ROW
-------------------------------- */

function shakeCurrentRow() {

    const currentRow =
        submittedGuesses.length;

    const rowElement =
        gridElement.children[currentRow];

    if (!rowElement) {
        return;
    }

    rowElement.classList.remove(
        "wordle-shake"
    );

    void rowElement.offsetWidth;

    rowElement.classList.add(
        "wordle-shake"
    );
}


/* --------------------------------
   PHYSICAL KEYBOARD
-------------------------------- */

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            handleInput("ENTER");

        } else if (
            event.key === "Backspace" ||
            event.key === "Delete"
        ) {

            handleInput("BACKSPACE");

        } else if (
            /^[a-zA-Z]$/.test(event.key)
        ) {

            handleInput(
                event.key.toUpperCase()
            );
        }
    }
);


/* --------------------------------
   RESET DURING DEVELOPMENT
-------------------------------- */

resetButton.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            STORAGE_KEYS.answer
        );

        localStorage.removeItem(
            STORAGE_KEYS.guesses
        );

        localStorage.removeItem(
            STORAGE_KEYS.finished
        );

        localStorage.removeItem(
            STORAGE_KEYS.won
        );

        localStorage.removeItem(
            "riddle1"
        );

        window.location.reload();
    }
);


/* --------------------------------
   START
-------------------------------- */

async function startGame() {

    showMessage("Loading word list...");

    await loadValidGuesses();

    initialiseGame();

    clearMessage();
}


startGame();