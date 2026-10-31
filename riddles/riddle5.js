"use strict";


/*
Final mission: electronic combination lock.

Clues resolve to December 25 → combination 1225.
*/


const LOCK_CODE = "1225";

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


if (lockForm) {

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
