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
        solved + " / 5 COMPLETE";


    // Update progress bar

    const percentage = (solved / 5) * 100;

    document.getElementById("progressFill").style.width =
        percentage + "%";


    // Unlock final mission status

    const vault =
        document.getElementById("vault");

    const vaultIcon =
        document.getElementById("vaultIcon");

    const vaultHeading =
        document.getElementById("vaultHeading");

    const vaultText =
        document.getElementById("vaultText");

    if (solved === 5) {

        vault.classList.add("unlocked");

        vaultIcon.innerText = "🏆";

        vaultHeading.innerText =
            "MISSION ACCOMPLISHED";

        vaultText.innerText =
            "You saved Nisseline — and Christmas! " +
            "She will never forget what you did.";

    } else {

        vault.classList.remove("unlocked");

        vaultIcon.innerText = "🔐";

        vaultHeading.innerText =
            "Nisseline is still missing";

        vaultText.innerText =
            "Complete all five challenges " +
            "to free Nisseline and save Christmas.";
    }
}


/* --------------------------------
   OPENING STORY POP-UP
-------------------------------- */

const INTRO_SEEN_KEY = "nisselineIntroSeen";

const storyIntroModal =
    document.getElementById("storyIntroModal");

const startRescueButton =
    document.getElementById("startRescueMission");

const openStoryBriefingButton =
    document.getElementById("openStoryBriefing");


function showStoryIntro() {

    if (!storyIntroModal) {
        return;
    }

    storyIntroModal.classList.add("visible");
}


function hideStoryIntro() {

    if (!storyIntroModal) {
        return;
    }

    storyIntroModal.classList.remove("visible");

    localStorage.setItem(
        INTRO_SEEN_KEY,
        "true"
    );
}


function initStoryIntro() {

    if (!storyIntroModal) {
        return;
    }

    if (localStorage.getItem(INTRO_SEEN_KEY) !== "true") {
        showStoryIntro();
    }

    if (startRescueButton) {
        startRescueButton.addEventListener(
            "click",
            hideStoryIntro
        );
    }

    if (openStoryBriefingButton) {
        openStoryBriefingButton.addEventListener(
            "click",
            showStoryIntro
        );
    }
}


// Run whenever homepage loads

updateProgress();
initStoryIntro();
