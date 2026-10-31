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

    formElement.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const entered =
                inputElement.value.trim();

            if (entered === PLACEHOLDER_PASSWORD) {

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
