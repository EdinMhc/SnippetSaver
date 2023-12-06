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
    let snippets = await getSnippets();
    let zip = new JSZip();

    snippets.forEach(snippet => {
        let textContent = extractTextFromHTML(snippet.code);
        zip.file(snippet.name + ".txt", textContent);
    });

    zip.generateAsync({type:"blob"})
       .then(function(content) {
        const dateTimeString = getCurrentDateTimeString();
       saveAs(content, `snippets${dateTimeString}.zip`);
       });
}

function extractTextFromHTML(htmlString) {
    var tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlString;
    return tempDiv.textContent || tempDiv.innerText || "";
}

function getCurrentDateTimeString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${minutes}${hours}${day}${month}${year}`;
}
