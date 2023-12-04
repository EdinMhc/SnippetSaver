async function getSnippets() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get({ snippets: [] }, (result) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve(result.snippets);
        });
    });
}

async function saveSnippets(snippets) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ snippets }, () => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve();
        });
    });
}

document.getElementById('deleteAll').addEventListener('click', deleteAllSnippets);

document.getElementById('backToMain').addEventListener('click', function() { window.location.href = '../popup.html'; });

document.getElementById('exportSnippets').addEventListener('click', exportSnippets);

async function deleteAllSnippets(){
        let confirmation = confirm("Are you sure you want to delete all snippets?");
        if (confirmation) {
            snippets = [];
            await saveSnippets(snippets);
            snippetContainerElement.innerHTML = '';
        } else {}
}

async function exportSnippets() {
    let snippets = await getSnippets(); // Retrieve snippets from storage
    let zip = new JSZip();

    // Loop through each snippet and add it to the zip file
    snippets.forEach(snippet => {
        let textContent = extractTextFromHTML(snippet.code);
        zip.file(snippet.name + ".txt", textContent); // Ensure you use the correct property for snippet content
    });

    // Generate the zip file and trigger download
    zip.generateAsync({type:"blob"})
       .then(function(content) {
           saveAs(content, "snippets.zip");
       });
}

function extractTextFromHTML(htmlString) {
    // Create a temporary DOM element
    var tempDiv = document.createElement("div");
    // Set its HTML content
    tempDiv.innerHTML = htmlString;
    // Extract and return the text content
    return tempDiv.textContent || tempDiv.innerText || "";
}