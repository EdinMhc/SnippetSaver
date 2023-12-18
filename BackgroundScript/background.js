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

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: "createSnippet",
        title: "Create Snippet",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "createSnippet" && info.selectionText) {
        createSnippet(info.selectionText, tab.url);
    }
});

async function createSnippet(selectedText, pageUrl) {
    try {
        let allSnippets = await getSnippets();

        let snippetName = `QuickSnippet${allSnippets.length}`;

        let newSnippet = {
            name: snippetName,
            code: selectedText,
            isFavorite: false,
            url: pageUrl
        };

        // Find the first index of an unfavorited snippet
        let firstUnfavoritedIndex = allSnippets.findIndex(s => !s.isFavorite);

        // Insert the new snippet at the correct position
        if (firstUnfavoritedIndex === -1) {
            allSnippets.push(newSnippet);
        } else {
            allSnippets.splice(firstUnfavoritedIndex, 0, newSnippet);
        }

        await saveSnippets(allSnippets);

        console.log("New snippet created:", newSnippet);
    } catch (error) {
        console.error("Error creating snippet:", error);
    }
}