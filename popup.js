const snippetNameElement = document.getElementById('snippetName');
const snippetContentElement = document.getElementById('snippetContent');
const saveSnippetElement = document.getElementById('saveSnippet');
const loadSnippetsElement = document.getElementById('loadSnippets');
const errorMessageElement = document.getElementById('errorMessage');
const snippetContainerElement = document.getElementById('snippetContainer');

let snippets = [];
let snippetsLoaded = false;
let activeSnippet = null;

saveSnippetElement.addEventListener('click', saveSnippet);
loadSnippetsElement.addEventListener('click', toggleSnippetsVisibility);

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

async function saveSnippet() {
    let snippetName = document.getElementById('snippetName').value;
    let snippetCode = document.getElementById('snippetContent').value;

    if (snippetName === '' || snippetName.length > 25 || snippets.some(snippet => snippet.name === snippetName)) {
        if(snippetName === '') {
            document.getElementById('snippetName').classList.add('input-error');
            document.getElementById('errorMessage').textContent = 'Error: Snippet name must not be empty';
        }
        else if(snippetName.length > 25) {
            document.getElementById('snippetName').classList.add('input-error');
            document.getElementById('errorMessage').textContent = 'Error: Snippet name must not exceed 25 characters';
        }
        else {
            document.getElementById('errorMessage').textContent = 'Error: Snippet name must be unique';
        }
        return;
    }

    let tabs = await promisifyQuery({active: true, lastFocusedWindow: true});
    
    if (tabs.length === 0) {
        console.warn("No active tab found");
        return;
    }
    
    let url = tabs.url;
    let snippet = { name: snippetName, code: snippetCode, url: url, isFavorite: false };

    let firstUnfavoritedIndex = snippets.findIndex(s => !s.isFavorite);
    if (firstUnfavoritedIndex === -1) {
        snippets.push(snippet);
    } else {
        snippets.splice(firstUnfavoritedIndex, 0, snippet);
    }

    await saveSnippets(snippets);

    console.log('Snippet saved');

    document.getElementById('snippetName').value = '';
    document.getElementById('snippetContent').value = '';
    document.getElementById('errorMessage').textContent = '';

    if (snippetsLoaded) {
        loadSnippets();
    }
    clearPopupState();
}

function promisifyQuery(queryOptions) {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError.message);
            } else if (tabs.length === 0) {
                reject(new Error("No active tab found"));
            } else {
                resolve(tabs[0]);
            }
        });
    });
}

async function loadSnippets() {
    snippets = await getSnippets();

    snippets.sort((a, b) => {
        if (a.isFavorite === b.isFavorite) return 0;
        return a.isFavorite ? -1 : 1; 
    });

    while (snippetContainerElement.firstChild) {
        snippetContainerElement.firstChild.remove();
    }

    snippets.forEach(function(snippet) {

        const link = document.createElement('div');
        link.draggable = true;

        link.addEventListener('dragstart', function(event) {
            event.dataTransfer.setData('text/plain', snippet.name);
        });

        link.addEventListener('dragover', function(event) {
            event.preventDefault();
        });

        link.addEventListener('drop', function(event) {
            event.preventDefault();
            const targetSnippetName = event.dataTransfer.getData('text/plain');
            reorderSnippets(targetSnippetName, snippet.name);
        });

        const snippetName = enterSnippet(snippet);
        link.appendChild(snippetName);

        const favoriteButton = createFavoriteButton(snippet);
        if (snippet.isFavorite) {
            favoriteButton.textContent = 'favorite';
            favoriteButton.classList.add('filled');
        } else {
            favoriteButton.textContent = 'favorite_border';
            favoriteButton.classList.remove('filled');
        }
        link.appendChild(favoriteButton);

        const editButton = createEditButton(snippet);
        link.appendChild(editButton);

        const copyButton = createCopyButton(snippet);
        link.appendChild(copyButton);

        const deleteButton = createDeleteButton(snippet);
        link.appendChild(deleteButton);

        snippetContainerElement.appendChild(link);
    });
    snippetsLoaded = true;
}

async function reorderSnippets(draggedName, targetName) {
    const draggedIndex = snippets.findIndex(snippet => snippet.name === draggedName);
    const targetIndex = snippets.findIndex(snippet => snippet.name === targetName);

    if (draggedIndex !== targetIndex) {
        const [draggedSnippet] = snippets.splice(draggedIndex, 1);
        snippets.splice(targetIndex, 0, draggedSnippet);

        await saveSnippets(snippets);
        await loadSnippets();
    }
}

function updateSnippet(oldName, newName) {
    let index = snippets.findIndex(s => s.name === oldName);
    if (index !== -1) {
        snippets[index].name = newName;
        saveSnippets();
    }
}

function copySnippet(text) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;

    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    navigator.clipboard.writeText(textContent)
        .then(() => {
            console.log('Snippet copied to clipboard');
        })
        .catch(err => {
            console.error('Could not copy snippet: ', err);
        });
}

async function deleteSnippet(snippetName) {
    snippets = snippets.filter(snippet => snippet.name !== snippetName);
    await saveSnippets(snippets);
    loadSnippets();
}

async function toggleSnippetsVisibility() {
    if(snippetContainerElement.style.display === "none" || snippetContainerElement.style.display === "") {
        await loadSnippets();
        snippetContainerElement.style.display = "block";
    } else {
        snippetContainerElement.style.display = "none";
    }
}

function enterSnippet(snippet) {
    const snippetName = document.createElement('a');
        snippetName.classList.add('snippet-name');
        snippetName.textContent = snippet.name;
        snippetName.style.flexGrow = '1';

        snippetName.addEventListener('click', function(event) {
            if (!event.target.classList.contains('copy-button') && !event.target.classList.contains('delete-button') && !event.target.classList.contains('edit-button')) {
                window.location.href = 'Snippets/snippet.html?id=' + encodeURIComponent(snippet.name);
            }
        });
  
    return snippetName;
}

function createEditButton(snippet) {
    const editButton = document.createElement('span');
    editButton.classList.add('edit-button');
    editButton.addEventListener('click', function (event) {
        event.preventDefault();
        toggleSnippetEditMode(event.target.parentNode, snippet);
    });
    
    editButton.classList.add('material-icons');
    editButton.textContent = 'edit';
  
    return editButton;
}
 
function createFavoriteButton(snippet) {
    const favoriteButton = document.createElement('span');
    favoriteButton.classList.add('favorite-button', 'material-icons');
    favoriteButton.textContent = 'favorite_border';

    favoriteButton.addEventListener('click', function (event) {
        event.preventDefault();
        // Toggle favorite state
        if (favoriteButton.textContent === 'favorite_border') {
            favoriteButton.textContent = 'favorite';
            favoriteButton.classList.add('filled');
        } else {
            favoriteButton.textContent = 'favorite_border';
            favoriteButton.classList.remove('filled');
        }

        toggleFavoriteStatus(snippet);
    });

    return favoriteButton;
}

function toggleFavoriteStatus(snippet) {
    
    snippet.isFavorite = !snippet.isFavorite;

    // Needs working, puts the favorited on top
    if (snippet.isFavorite) {
        snippets = snippets.filter(s => s.name !== snippet.name);
        snippets.push(snippet);
    }

    snippets.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return 0; // Keep original order for others
    });

    saveAndReloadSnippets();
}

function saveAndReloadSnippets() {
    saveSnippets(snippets).then(() => {
        console.log('Snippet favorite status updated');
        loadSnippets();
    }).catch(err => {
        console.error('Error updating snippet favorite status: ', err);
    });
}

function toggleSnippetEditMode(container, snippet) {
    let snippetNameElement = container.querySelector('.snippet-name');
    if (snippetNameElement && !container.classList.contains('editable')) {
        if (activeSnippet && activeSnippet !== container) {
            exitEditMode(activeSnippet);
          }

        snippetNameElement.contentEditable = true;
        snippetNameElement.focus();
        container.classList.add('editable');

        snippetNameElement.classList.add('disabled-link');
        container.draggable = false;

        container.querySelectorAll('.copy-button, .delete-button, .edit-button, .favorite-button').forEach(button => {
            button.style.display = 'none';
        });

        snippetNameElement.style.outline = 'none';

        if (!container.querySelector('.apply-button')) {
            const applyButton = document.createElement('div');
            applyButton.classList.add('apply-button');
            applyButton.addEventListener('click', function (event) {
                event.preventDefault();
                applySnippetNameChange(container, snippet, snippetNameElement.textContent);
            });

            const applyIcon = document.createElement('span');
            applyIcon.classList.add('material-icons');
            applyIcon.textContent = 'check';
            applyButton.appendChild(applyIcon);

            container.appendChild(applyButton);
        }

        activeSnippet = container;
    }
}

function applySnippetNameChange(container, snippet, newName) {
    const snippetNameElement = container.querySelector('.snippet-name');

    if (snippetNameElement && newName.trim() !== '') {
        const currentName = snippet.name;

        if (newName.trim() !== currentName && (newName.trim().length > 25 || snippets.some(snip => snip.name === newName.trim()))) {
            const applyButton = container.querySelector('.apply-button');
            applyButton.classList.add('input-error');

            setTimeout(function() {
                applyButton.classList.remove('input-error');
            }, 2000);

            return;
        }                  
        snippet.name = newName.trim();
        snippetNameElement.textContent = snippet.name;
        snippetNameElement.contentEditable = false;
        container.classList.remove('editable');
        
        snippetNameElement.classList.remove('disabled-link');

        const applyButton = container.querySelector('.apply-button');
        if (applyButton) {
            container.removeChild(applyButton);
        }

        saveSnippets(snippets);
    }

    container.querySelectorAll('.copy-button, .delete-button, .edit-button, .favorite-button').forEach(button => {
        button.style.display = '';
    });

}

function exitEditMode(container) {
    let snippetNameElement = container.querySelector('.snippet-name');
    
    container.querySelectorAll('.copy-button, .delete-button, .edit-button').forEach(button => {
      button.style.display = '';
    });
  
    const applyButton = container.querySelector('.apply-button');
    if (applyButton) {
      container.removeChild(applyButton);
    }
  
    snippetNameElement.contentEditable = false;
    container.classList.remove('editable');
    container.draggable = true;
    activeSnippet = null;
  }

function createCopyButton(snippet) {
    const copyButton = document.createElement('div');
    copyButton.classList.add('copy-button');
    copyButton.addEventListener('click', function (event) {
        event.preventDefault();
        const snippetText = snippet.code;
        copySnippet(snippetText);
    });

    const copyIcon = document.createElement('span');
    copyIcon.classList.add('material-icons');
    copyIcon.textContent = 'content_copy';
    copyButton.appendChild(copyIcon);

    return copyButton;
}

function createDeleteButton(snippet) {
    const deleteButton = document.createElement('div');
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', function (event) {
        event.preventDefault();
        deleteSnippet(snippet.name);
    });

    const deleteIcon = document.createElement('span');
    deleteIcon.classList.add('material-icons');
    deleteIcon.textContent = 'delete';
    deleteButton.appendChild(deleteIcon);

    return deleteButton;
}

function handleEditButtonClick(event, snippet) {
    const parentContainer = event.target.parentNode;
    const nameContainer = parentContainer.querySelector('.snippet-name');

    if(nameContainer) {
        const oldName = nameContainer.textContent;
        nameContainer.contentEditable = true;
        nameContainer.focus();

        nameContainer.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.contentEditable = false;
                if(this.textContent.trim() !== '') {
                    updateSnippet(oldName, this.textContent.trim());
                } else {
                    this.textContent = oldName;
                }
            }
        });

        nameContainer.addEventListener('blur', function() {
            this.contentEditable = false;
            if(this.textContent.trim() !== '') {
                updateSnippet(oldName, this.textContent.trim());
            } else {
                this.textContent = oldName;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async (event) => {
    restorePopupState();
    snippets = await getSnippets();
    const currentTheme = localStorage.getItem('theme') || 'light';
    applyTheme(currentTheme);

    function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    }

    const urlParams = new URLSearchParams(window.location.search);
    const loadSnippetsFlag = urlParams.get('loadSnippets');
    if (loadSnippetsFlag === 'true'){
        loadSnippets();
    }
}});

document.getElementById('settings').addEventListener('click', function() {
    window.location.href = '../Settings/settings.html';
});

// NEW
function savePopupState() {
    let snippetName = document.getElementById('snippetName').value;
    let snippetContent = document.getElementById('snippetContent').value;

    chrome.storage.local.set({ popupState: { snippetName, snippetContent } });
}

document.getElementById('snippetName').addEventListener('input', savePopupState);
document.getElementById('snippetContent').addEventListener('input', savePopupState);
window.addEventListener('blur', savePopupState);

function restorePopupState() {
    chrome.storage.local.get('popupState', function(data) {
        if (data.popupState) {
            document.getElementById('snippetName').value = data.popupState.snippetName || '';
            document.getElementById('snippetContent').value = data.popupState.snippetContent || '';
        }
    });
}

function clearPopupState() {
    chrome.storage.local.remove('popupState');
}