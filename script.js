function isRiddleUnlocked(number) {

    if (number === 1) {
        return true;
    }

    return localStorage.getItem(
        "riddle" + number + "Unlocked"
    ) === "true";
}


function updateProgress() {

    let solved = 0;

    for (let number = 1; number <= 5; number++) {

        const status =
            localStorage.getItem("riddle" + number);

        const card =
            document.getElementById("riddle" + number);

        const statusElement =
            card.querySelector(".riddle-status");

        card.classList.remove("solved", "locked");

        if (status === "solved") {

            solved++;

            card.classList.add("solved");

            statusElement.innerText = "✓";

        } else if (!isRiddleUnlocked(number)) {

            card.classList.add("locked");

            statusElement.innerText = "🔒";

        } else {

            statusElement.innerText = "→";
        }
    }


    // Update progress text

    document.getElementById("progressText").innerText =
        solved + " / 5 SOLVED";


    // Update progress bar

    const percentage = (solved / 5) * 100;

    document.getElementById("progressFill").style.width =
        percentage + "%";


    // Unlock final challenge

    if (solved === 5) {

        document
            .getElementById("vault")
            .classList.add("unlocked");

        document
            .getElementById("vaultIcon")
            .innerText = "🔓";

        document
            .getElementById("vaultText")
            .innerText =
            "All riddles solved. The final challenge is unlocked!";
    }
}


// Run whenever homepage loads

updateProgress();
