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

function generateJSONContent(snippets) {
    return JSON.stringify(snippets, null, 2);
}

function downloadSnippetsAsJSON(snippets) {
    const jsonContent = generateJSONContent(snippets);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const dateTimeString = getCurrentDateTimeString();
    saveAs(blob, `snippets_${dateTimeString}.json`);
}

document.getElementById('downloadJson').addEventListener('click', async function() {
    let snippets = await getSnippets();
    downloadSnippetsAsJSON(snippets);
});

document.addEventListener('DOMContentLoaded', function() {
    const themeSwitch = document.getElementById('themeSwitch');
    const currentTheme = localStorage.getItem('theme') || 'light';
    var fileInput = document.getElementById('jsonFileInput');
    var importButton = document.getElementById('importButton');

    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            importButton.classList.remove('hidden');
        } else {
            importButton.classList.add('hidden');
        }
    });

    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
    }

    applyTheme(currentTheme);
    themeSwitch.checked = (currentTheme === 'dark');

    themeSwitch.addEventListener('change', function() {
        const newTheme = this.checked ? 'dark' : 'light';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });
});

document.getElementById('importButton').addEventListener('click', async function() {
    var fileInput = document.getElementById('jsonFileInput');
    var file = fileInput.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = async function(e) {
            var contents = e.target.result;
            try {
                var importedSnippets = JSON.parse(contents);
                var existingSnippets = await getSnippets();

                var uniqueSnippets = importedSnippets.filter(importedSnippet => 
                    !existingSnippets.some(existingSnippet => existingSnippet.name === importedSnippet.name)
                );

                var mergedSnippets = [...existingSnippets, ...uniqueSnippets];
                await saveSnippets(mergedSnippets);
                alert('Snippets imported successfully!');
            } catch (error) {
                console.error('Error parsing JSON:', error);
                alert('Error importing snippets. Please check the file format.');
            }
        };
        reader.readAsText(file);
    } else {
        alert('No file selected');
    }
});