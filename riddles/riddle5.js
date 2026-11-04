"use strict";


/*
Final mission: electronic combination lock.

Decoder pages resolve to combination 675.
*/


const LOCK_CODE = "675";

const STORAGE_KEYS = {
    solved: "lockRiddle5Solved"
};


const lockForm =
    document.getElementById("lockForm");

const lockInput =
    document.getElementById("lockCodeInput");

const lockError =
    document.getElementById("lockError");

const lockPanel =
    document.getElementById("lockPanel");

const lockResult =
    document.getElementById("lockResult");

const resetButton =
    document.getElementById("resetLock");


let solved =
    localStorage.getItem(
        STORAGE_KEYS.solved
    ) === "true";


function showLockError(message) {

    lockError.textContent = message;
    lockError.hidden = false;

}


function clearLockError() {

    lockError.textContent = "";
    lockError.hidden = true;

}


function showFinale() {

    if (lockPanel) {
        lockPanel.hidden = true;
    }

    if (lockResult) {
        lockResult.hidden = false;
    }

}


function completeLock() {

    solved = true;

    localStorage.setItem(
        STORAGE_KEYS.solved,
        "true"
    );

    localStorage.setItem(
        "riddle5",
        "solved"
    );

    showFinale();

}


function restoreSolvedState() {

    if (!solved) {
        return;
    }

    showFinale();

}


function mountLockHints() {

    if (
        typeof createHintPanel !== "function" ||
        !lockForm ||
        solved
    ) {
        return;
    }

    if (
        lockForm.querySelector(".hint-panel")
    ) {
        return;
    }

    const panel = createHintPanel({
        hints: [
            "Use your math skills",
            "Find a decoder that translates the writing in the stone into a math equation",
            "8*(8+7)*18/2"
        ],
        getSolution: function () {
            return LOCK_CODE;
        }
    });

    if (panel) {
        lockForm.appendChild(panel);
    }

}


if (lockForm) {

    mountLockHints();

    lockForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const entered =
                lockInput.value.trim();

            if (entered === LOCK_CODE) {

                clearLockError();
                completeLock();
                return;
            }

            showLockError(
                "The lock refuses to open. Study the clues again."
            );

            lockInput.select();
        }
    );
}


if (resetButton) {

    resetButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                STORAGE_KEYS.solved
            );

            localStorage.removeItem(
                "riddle5"
            );

            window.location.reload();
        }
    );
}


restoreSolvedState();
