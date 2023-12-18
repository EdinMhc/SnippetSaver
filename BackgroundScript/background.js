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
        console.log("Existing snippets:", allSnippets);

        let snippetName = `QuickSnippet${allSnippets.length}`;
        console.log("Snippet name:", snippetName);

        let newSnippet = {
            name: snippetName,
            code: selectedText,
            isFavorite: false,
            url: pageUrl
        };

        allSnippets.push(newSnippet);
        await saveSnippets(allSnippets);

        console.log("New snippet created:", newSnippet);
    } catch (error) {
        console.error("Error creating snippet:", error);
    }
}
