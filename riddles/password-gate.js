"use strict";


/*
Password gates for riddles 2–5.

Each riddle page sets data-riddle-number on
the main container. Until the correct code
is entered, only the gate is shown.

Unlocks persist in localStorage so returning
players do not need to re-enter the code.
*/


const PLACEHOLDER_PASSWORD = "00000";

const RIDDLE4_PASSWORD = "31642";

/*
Mission 5 unlock: code from Mission 4
decoder (5 digits).
*/
const RIDDLE5_PASSWORD = "81299";

/*
Mission 3 unlock: code from Mission 2
crossword + decoder (5 digits).
*/
const RIDDLE3_PASSWORD = "81726";

const WORDLE_ANSWER_KEY = "wordleRiddle1Answer";


/*
Alphabet decoder (A–I = 1–9, then repeats):
A1 B2 C3 D4 E5 F6 G7 H8 I9
J1 K2 L3 M4 N5 O6 P7 Q8 R9
S1 T2 U3 V4 W5 X6 Y7 Z8
*/
function decodeWordToCode(word) {

    if (typeof word !== "string") {
        return "";
    }

    const letters = word
        .trim()
        .toUpperCase();

    if (!/^[A-Z]+$/.test(letters)) {
        return "";
    }

    let code = "";

    for (let i = 0; i < letters.length; i++) {
        const digit =
            ((letters.charCodeAt(i) - 65) % 9) + 1;
        code += String(digit);
    }

    return code;
}


function getWordleUnlockCode() {

    const answer =
        localStorage.getItem(WORDLE_ANSWER_KEY);

    return decodeWordToCode(answer);
}


function getRequiredPassword(riddleNumber) {

    if (riddleNumber === 2) {
        return getWordleUnlockCode();
    }

    if (riddleNumber === 3) {
        return RIDDLE3_PASSWORD;
    }

    if (riddleNumber === 4) {
        return RIDDLE4_PASSWORD;
    }

    if (riddleNumber === 5) {
        return RIDDLE5_PASSWORD;
    }

    return PLACEHOLDER_PASSWORD;
}


function unlockStorageKey(riddleNumber) {
    return "riddle" + riddleNumber + "Unlocked";
}


function isRiddleUnlocked(riddleNumber) {
    return localStorage.getItem(
        unlockStorageKey(riddleNumber)
    ) === "true";
}


function markRiddleUnlocked(riddleNumber) {
    localStorage.setItem(
        unlockStorageKey(riddleNumber),
        "true"
    );
}


function showUnlockedContent(gateElement, contentElement) {
    gateElement.hidden = true;
    contentElement.hidden = false;
}


function showPasswordError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.hidden = false;
}


function clearPasswordError(errorElement) {
    errorElement.textContent = "";
    errorElement.hidden = true;
}


const GATE_HINTS = {

    2: {
        hints: [
            "Riddle one gave you 5 letters... You need 5 digits",
            "Translate the letters from your word in riddle 1 into a 5 digit code using one of the decoders"
        ],
        getSolution: function () {
            return (
                getWordleUnlockCode() ||
                "ADD CORRECT CODE HERE"
            );
        }
    },

    3: {
        hints: [
            "The solution to riddle 2 is more than just a random word",
            "A decoder in the room translates colors into numbers"
        ],
        getSolution: function () {
            return RIDDLE3_PASSWORD;
        }
    },

    4: {
        hints: [
            "the route in the labyinth was not random",
            "The way you walked in riddle 3 traces a three digit number, translate it to a 5 digit number using a decoder in the room"
        ],
        getSolution: function () {
            return RIDDLE4_PASSWORD;
        }
    },

    5: {
        hints: [
            "Which three objects did you see in the winter landscape?",
            "A decoder in the room translates emojis into numbers. The order is shown by the arrow"
        ],
        getSolution: function () {
            return RIDDLE5_PASSWORD;
        }
    }

};


function mountGateHints(gateElement, riddleNumber) {

    if (
        typeof createHintPanel !== "function"
    ) {
        return;
    }

    const config =
        GATE_HINTS[riddleNumber];

    if (!config) {
        return;
    }

    const existing =
        gateElement.querySelector(
            ".hint-panel"
        );

    if (existing) {
        return;
    }

    const panel = createHintPanel({
        hints: config.hints,
        getSolution: config.getSolution
    });

    if (!panel) {
        return;
    }

    const formElement =
        gateElement.querySelector(
            ".password-form"
        );

    if (formElement) {
        formElement.appendChild(panel);
    } else {
        gateElement.appendChild(panel);
    }

}


function initPasswordGate() {

    const page = document.querySelector(
        "[data-riddle-number]"
    );

    if (!page) {
        return;
    }

    const riddleNumber =
        Number(page.dataset.riddleNumber);

    if (
        !Number.isInteger(riddleNumber) ||
        riddleNumber < 2 ||
        riddleNumber > 5
    ) {
        return;
    }

    const gateElement =
        document.getElementById("passwordGate");

    const contentElement =
        document.getElementById("riddleContent");

    const formElement =
        document.getElementById("passwordForm");

    const inputElement =
        document.getElementById("passwordInput");

    const errorElement =
        document.getElementById("passwordError");

    if (
        !gateElement ||
        !contentElement ||
        !formElement ||
        !inputElement ||
        !errorElement
    ) {
        return;
    }

    if (isRiddleUnlocked(riddleNumber)) {
        showUnlockedContent(
            gateElement,
            contentElement
        );
        return;
    }

    mountGateHints(
        gateElement,
        riddleNumber
    );

    formElement.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const entered =
                inputElement.value.trim();

            const required =
                getRequiredPassword(riddleNumber);

            if (
                required &&
                entered === required
            ) {

                clearPasswordError(errorElement);
                markRiddleUnlocked(riddleNumber);
                showUnlockedContent(
                    gateElement,
                    contentElement
                );
                return;
            }

            showPasswordError(
                errorElement,
                "That code is incorrect. Check your decoder and try again."
            );

            inputElement.select();
        }
    );
}


initPasswordGate();
