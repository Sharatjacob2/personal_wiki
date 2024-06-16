const heightOfInput = document.getElementById("user-input").style.height;
document.getElementById("run-btn").style.height = heightOfInput;
document.getElementById("extra-info").style.height = heightOfInput;

let wikiAssist = true;

document.getElementById('wiki-assist').addEventListener('click', function () {
    maxPos = document.getElementById('wiki-assist').clientWidth - document.getElementById('wikiToggle').clientWidth;
    maxPos = maxPos - 8;
    wikiToggleButton = document.getElementById('wikiToggle');
    toggleChange(wikiToggleButton, wikiAssist);
    wikiAssist = !wikiAssist;
});

function toggleChange(button, flag) {
    if (flag) {
        button.style.left = `${maxPos}px`;
        button.style.backgroundColor = `green`;
    }
    else {
        button.style.left = `0.25vw`;
        button.style.backgroundColor = `red`;

    }
}

let wikiLinks = [];

document.getElementById('run-btn').addEventListener('click', function () {
    const userInput = document.getElementById('user-input').value;
    generate_main_explanation(userInput);
});


function generate_main_explanation(userInput) {
    const button = document.getElementById('inline_wiki_assist');
    const parentContainer = button.parentNode;
    elementToMove = document.getElementById("generating");

    if (button.nextSibling != elementToMove) {
        parentContainer.insertBefore(elementToMove, button.nextSibling);
        const targetRect = button.nextSibling.getBoundingClientRect();
        const offsetTop = targetRect.top - 30;
        elementToMove.style.top = `${offsetTop}px`;
    }

    document.getElementById("generating").style.display = 'flex';
    elementToMove.scrollIntoView({ behavior: "smooth" });

    fetch('/llm_output', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: userInput, wikiToggle: wikiAssist })
    })
        .then(response => response.json())
        .then(data => {
            let boldWords = data.tags;
            let formattedResult = data.explanation;
            if (!wikiAssist) {
                wikiLinks = data.links;
            }
            const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            boldWords.forEach(word => {
                const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi');
                if (regex.test(formattedResult)) {
                    formattedResult = formattedResult.replace(regex, `<button class="tag" data-maintopicvalue="${userInput}">` + word + `</button>`);
                    console.log(word)
                }
                else {
                    console.log("didnt work")
                }
            });

            document.getElementById('main_explanation').innerHTML = `<h2 class="context_title">${userInput}</h2><div class = "context_title_line"></div>` + formattedResult + `<br><br><div class = "context_title_line"></div><br> Not the correct wiki link? Update page with: `;
            if (!wikiAssist) {
                wikiLinks.forEach(link => {
                    document.getElementById('main_explanation').innerHTML = document.getElementById('main_explanation').innerHTML + `<button class="tag linkTag">` + link + `</button>, `;
                })
            }

            // Use innerHTML to render the formatted HTML
            document.getElementById("generating").style.display = 'none';
            document.getElementById('main_explanation').classList.remove("hidden");

            const elements = document.querySelectorAll('.context_para');
            const elementsArray = Array.from(elements);
            elementsArray.forEach(element => {
                element.remove();
            });
        });
}



let container_explanation = document.getElementById('explanation');
container_explanation.addEventListener('click', function (event) {
    if (event.target.classList.contains('linkTag')) {
        generate_main_explanation(event.target.textContent);
    }
    else if (event.target.classList.contains('tag')) {
        newTag(event.target);
    }
});

function newTag(button) {
    button.disabled = true;
    console.log(button);
    const mainTopic = button.dataset.maintopicvalue;
    const context_topic = button.textContent;

    const elementToMove = document.getElementById('generating');
    const parentContainer = button.parentNode.parentNode;
    parentContainer.insertBefore(elementToMove, button.parentNode);
    elementToMove.style.display = 'flex';
    elementToMove.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
        window.scrollBy(0, -10);
    }, 500);

    fetch('/llm_context_output', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ topic: mainTopic, context: context_topic })
    })
        .then(response => response.json())
        .then(data => {
            let boldWords = data.tags; // Add the words you want to bolden here
            let formattedResult = data.explanation;
            const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            boldWords.forEach(word => {
                // Replace each occurrence of the word with the same word wrapped in <b> tags
                const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi');
                if (regex.test(formattedResult)) {
                    formattedResult = formattedResult.replace(regex, `<button class="tag" data-maintopicvalue="${context_topic}">` + word + `</button>`);
                    console.log(word)
                }
                else {
                    console.log("didnt work")
                }
            });

            // Use innerHTML to render the formatted HTML
            elementToMove.style.display = 'none';
            const newParagraph = document.createElement('p');
            newParagraph.innerHTML = `<h2 class="context_title">${context_topic} w.r.t ${mainTopic}</h2><div class = "context_title_line"></div>` + formattedResult;
            newParagraph.className = "context_para"
            container_explanation.insertBefore(newParagraph, button.parentElement);
            newParagraph.scrollIntoView({ behavior: "smooth" });
        });

}



document.getElementById('wikiInfo').addEventListener('click', function () {
    document.getElementById("wikiInfoBox").classList.remove("hidden");
    document.getElementById("main_content").classList.add("blur_effect");
});

document.getElementById('close_wiki').addEventListener('click', function () {
    document.getElementById("wikiInfoBox").classList.add("hidden");
    document.getElementById("main_content").classList.remove("blur_effect");
});




document.getElementById('extra-info').addEventListener('click', function () {
    document.getElementById("aboutbox").classList.remove("hidden");
    document.getElementById("main_content").classList.add("blur_effect");
    document.getElementById("two-about").classList.add("inactive");
});

document.getElementById('close_about').addEventListener('click', function () {
    document.getElementById("aboutbox").classList.add("hidden");
    document.getElementById("main_content").classList.remove("blur_effect");
});

document.getElementById('two-about').addEventListener('click', function () {
    document.getElementById("helpbox").classList.remove("hidden");
    document.getElementById("aboutbox").classList.add("hidden");
    document.getElementById("one-help").classList.add("inactive");
});

document.getElementById('one-help').addEventListener('click', function () {
    document.getElementById("aboutbox").classList.remove("hidden");
    document.getElementById("helpbox").classList.add("hidden");
    document.getElementById("two-about").classList.add("inactive");
});


document.getElementById('close_help').addEventListener('click', function () {
    document.getElementById("helpbox").classList.add("hidden");
    document.getElementById("main_content").classList.remove("blur_effect");
    document.getElementById("two").classList.add("inactive");
});


const fullscreen_button = document.getElementById('fullscreen');
var elem = document.documentElement;

fullscreen_button.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
});
