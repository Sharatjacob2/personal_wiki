contextToggleButton = document.getElementById('contextToggle');
contextToggle = true;
contextUpdate = document.getElementById('contextUpdate');
contextToggleButton.addEventListener('click', function () {
    contextUpdate.style.display = 'flex';
    
    contextToggle = !contextToggle;
    if (!contextToggle) {
        contextToggleButton.style.backgroundColor = 'var(--explanation_bg_color)';
        contextToggleButton.style.color = 'var(--white)';
        contextToggleButton.style.border = '2px solid var(--white)';
        contextToggleButton.style.width = '35px';
        contextToggleButton.style.height = '35px';
        contextUpdate.children[0].textContent = 'Context Disabled';
    }
    else {
        contextToggleButton.style.backgroundColor = 'var(--white)';
        contextToggleButton.style.color = 'var(--explanation_bg_color)';
        contextToggleButton.style.border = 'none';
        contextToggleButton.style.width = '39px';
        contextToggleButton.style.height = '39px';
        contextUpdate.children[0].textContent = 'Context Enabled';
    }

    setTimeout(() => {
        contextUpdate.classList.add('fade-out');
    }, 1000); // 3000 milliseconds = 3 seconds

    setTimeout(() => {
        contextUpdate.style.display = 'none';
        contextUpdate.classList.remove('fade-out'); // Reset for next time
    }, 2000); // 4000 milliseconds = 4 seconds (1 second for the fade-out)

})

contextToggleButton.addEventListener('mouseenter', function (){
    contextInfo = document.getElementById('contextInfo');
    contextInfo.classList.remove("hidden");
    contextInfo.style.display = 'inline-block';
})

contextToggleButton.addEventListener('mouseleave', function (){
    contextInfo = document.getElementById('contextInfo');
    contextInfo.classList.add("hidden");
    contextInfo.style.display = 'none';

})

wikiPhoneToggleButton = document.getElementById('wikiPhoneToggle');
wikiPhoneToggleButton.style.backgroundColor = 'var(--explanation_bg_color)';
wikiPhoneToggleButton.style.color = 'var(--white)';
wikiPhoneToggleButton.style.border = '2px solid var(--white)';
wikiPhoneToggleButton.style.width = '35px';
wikiPhoneToggleButton.style.height = '35px';

wikiPhoneUpdate = document.getElementById('wikiPhoneUpdate');
wikiPhoneToggleButton.addEventListener('click', function () {
    wikiPhoneUpdate.style.display = 'flex';
    
    wikiAssist = !wikiAssist;
    if (!wikiAssist) {
        wikiPhoneToggleButton.style.backgroundColor = 'var(--white)';
        wikiPhoneToggleButton.style.color = 'var(--explanation_bg_color)';
        wikiPhoneToggleButton.style.border = 'none';
        wikiPhoneToggleButton.style.width = '39px';
        wikiPhoneToggleButton.style.height = '39px';
        wikiPhoneUpdate.children[0].textContent = 'Wiki Enabled';
    }
    else {
        wikiPhoneToggleButton.style.backgroundColor = 'var(--explanation_bg_color)';
        wikiPhoneToggleButton.style.color = 'var(--white)';
        wikiPhoneToggleButton.style.border = '2px solid var(--white)';
        wikiPhoneToggleButton.style.width = '35px';
        wikiPhoneToggleButton.style.height = '35px';
        wikiPhoneUpdate.children[0].textContent = 'Wiki Disabled';
    }
    console.log(`WikiAssist is ${wikiAssist}`);
    setTimeout(() => {
        wikiPhoneUpdate.classList.add('fade-out');
    }, 1000); // 3000 milliseconds = 3 seconds

    setTimeout(() => {
        wikiPhoneUpdate.style.display = 'none';
        wikiPhoneUpdate.classList.remove('fade-out'); // Reset for next time
    }, 2000); // 4000 milliseconds = 4 seconds (1 second for the fade-out)

})

wikiPhoneToggleButton.addEventListener('mouseenter', function (){
    wikiPhoneInfo = document.getElementById('wikiPhoneInfo');
    wikiPhoneInfo.classList.remove("hidden");
    wikiPhoneInfo.style.display = 'inline-block';
})

wikiPhoneToggleButton.addEventListener('mouseleave', function (){
    wikiPhoneInfo = document.getElementById('wikiPhoneInfo');
    wikiPhoneInfo.classList.add("hidden");
    wikiPhoneInfo.style.display = 'none';
})





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

            if (!wikiAssist && boldWords.length != 0) {
                document.getElementById('main_explanation').children[0].innerHTML = `<h2 class="context_title">${userInput}</h2><div class = "context_title_line"></div>` + formattedResult + `<br><br><div class = "context_title_line"></div><br> Not the correct wiki link? Update page with: `;
                wikiLinks.forEach(link => {
                    document.getElementById('main_explanation').children[0].innerHTML = document.getElementById('main_explanation').children[0].innerHTML + `<button class="tag linkTag">` + link + `</button>, `;
                })
            }
            else {
                document.getElementById('main_explanation').children[0].innerHTML = `<h2 class="context_title">${userInput}</h2><div class = "context_title_line"></div>` + formattedResult;
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
    if (event.target.classList.contains('closeContext')){
        event.target.parentElement.remove();
    }
    else if (event.target.classList.contains('linkTag')) {
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
    const parentContainer = button.parentNode.parentNode.parentNode;
    parentContainer.insertBefore(elementToMove, button.parentNode.parentNode);
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
        body: JSON.stringify({ topic: mainTopic, context: context_topic, wikiToggle: wikiAssist, contextSetting: contextToggle })
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
            const newParagraph = document.createElement('div');
            newParagraph.innerHTML = `<h2 class="context_title">${context_topic}<br> <span style="font-weight:300; font-size:20px;">(w.r.t ${mainTopic})</span></h2><div class = "context_title_line"></div><span class="close closeContext">&times;</span><p>` + formattedResult + `</p>`;
            newParagraph.className = "context_para";
            container_explanation.insertBefore(newParagraph, button.parentElement.parentElement);
            newParagraph.scrollIntoView({ behavior: "smooth" });
        });

    button.disabled = false;
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
