const heightOfInput = document.getElementById("user-input").style.height;
document.getElementById("run-btn").style.height = heightOfInput;


document.getElementById('run-btn').addEventListener('click', function () {
    const userInput = document.getElementById('user-input').value;
    fetch('/llm_output', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: userInput })
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
                    formattedResult = formattedResult.replace(regex, `<button class="tag" data-maintopicvalue="${userInput}">` + word + `</button>`);
                    console.log(word)
                }
                else {
                    console.log("didnt work")
                }
            });
            // Use innerHTML to render the formatted HTML
            document.getElementById('main_explanation').innerHTML = formattedResult;

            const elements = document.querySelectorAll('.context_para');            
            // Convert NodeList to an array (optional but safer for compatibility)
            const elementsArray = Array.from(elements);
            // Iterate over the array and remove each element
            elementsArray.forEach(element => {
                element.remove();
            });
        
        });
});

let container_explanation = document.getElementById('explanation');

container_explanation.addEventListener('click', function (event) {
    if (event.target.classList.contains('tag')) {
        newTag(event.target);
    }
});

function newTag(button) {
    console.log(button);
    const mainTopic = button.dataset.maintopicvalue;
    const context_topic = button.textContent;
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

            const newParagraph = document.createElement('p');
            newParagraph.innerHTML = formattedResult;
            newParagraph.className = "context_para"
            container_explanation.insertBefore(newParagraph, button.parentElement);
        });

}    
