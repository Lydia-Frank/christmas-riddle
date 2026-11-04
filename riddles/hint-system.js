"use strict";


/*
Reusable progressive hint UI.

Supports any number of hints, then
solution: Hint 1 → … → Hint N → Solution.
*/


function createHintPanel(config) {

    const {
        hints,
        getSolution,
        buttonLabel = "Hint",
        nextHintLabel = "Another hint",
        solutionLabel = "Show solution",
        doneLabel = "Solution revealed"
    } = config;

    if (
        !Array.isArray(hints) ||
        hints.length === 0
    ) {
        return null;
    }

    const panel =
        document.createElement("div");

    panel.className = "hint-panel";

    const button =
        document.createElement("button");

    button.type = "button";
    button.className = "hint-button";
    button.textContent = buttonLabel;

    const list =
        document.createElement("div");

    list.className = "hint-reveals";
    list.hidden = true;

    const items = [];

    hints.forEach(function (text, index) {

        const item =
            document.createElement("p");

        item.className = "hint-item";
        item.hidden = true;

        const label =
            document.createElement("span");

        label.className = "hint-item-label";
        label.textContent =
            "Hint " + (index + 1);

        const body =
            document.createElement("span");

        body.className = "hint-item-text";
        body.textContent = text;

        item.appendChild(label);
        item.appendChild(body);
        list.appendChild(item);
        items.push(item);

    });

    const solutionItem =
        document.createElement("p");

    solutionItem.className =
        "hint-item hint-solution";
    solutionItem.hidden = true;

    const solutionLabelEl =
        document.createElement("span");

    solutionLabelEl.className =
        "hint-item-label";
    solutionLabelEl.textContent =
        "Solution";

    const solutionBody =
        document.createElement("span");

    solutionBody.className =
        "hint-item-text";

    solutionItem.appendChild(
        solutionLabelEl
    );
    solutionItem.appendChild(
        solutionBody
    );
    list.appendChild(solutionItem);

    let step = 0;
    const totalSteps =
        hints.length + 1;

    button.addEventListener(
        "click",
        function () {

            if (step >= totalSteps) {
                return;
            }

            step += 1;
            list.hidden = false;

            if (step <= hints.length) {

                items[step - 1]
                    .hidden = false;

                if (
                    step < hints.length
                ) {
                    button.textContent =
                        nextHintLabel;
                } else {
                    button.textContent =
                        solutionLabel;
                }

                return;
            }

            const solutionText =
                typeof getSolution ===
                "function"
                    ? getSolution()
                    : String(
                        getSolution ||
                        "ADD CORRECT CODE HERE"
                    );

            solutionBody.textContent =
                solutionText ||
                "ADD CORRECT CODE HERE";

            solutionItem.hidden = false;
            button.textContent =
                doneLabel;
            button.disabled = true;
        }
    );

    panel.appendChild(button);
    panel.appendChild(list);

    return panel;

}
