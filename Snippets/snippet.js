let snippets;
let snippet;

const urlParams = new URLSearchParams(window.location.search);
const snippetName = urlParams.get('id');

chrome.storage.local.get({ snippets: [] }, function(result) {
  snippets = result.snippets;

  snippet = snippets.find(snippet => snippet.name === snippetName);

  if (snippet) {
    document.getElementById('snippetName').textContent = snippet.name;
    document.getElementById('snippetCode').textContent = snippet.code;
    
    let snippetUrl = document.getElementById('snippetUrl');
    snippetUrl.href = snippet.url;
    snippetUrl.target = "_blank";

    const actualLink = snippet.url;

    snippetUrl.textContent = actualLink;

    const findSnippetElement = document.getElementById('findSnippet');
    findSnippetElement.style.display = 'block';
  } else {
    document.getElementById('snippetName').textContent = 'Snippet not found';
  }
});

document.getElementById('smallFont').addEventListener('click', function() {
  document.getElementById('snippetCode').style.fontSize = '12px';
});

document.getElementById('mediumFont').addEventListener('click', function() {
  document.getElementById('snippetCode').style.fontSize = '18px';
});

document.getElementById('largeFont').addEventListener('click', function() {
  document.getElementById('snippetCode').style.fontSize = '24px';
});

document.getElementById('backButton').addEventListener('click', function() {
  window.history.back();
});

document.getElementById('editButton').addEventListener('click', function() {
  const snippetCode = document.getElementById('snippetCode');
  snippetCode.contentEditable = "true";

  const snippetUrl = document.getElementById('snippetUrl');
  snippetUrl.contentEditable = "true";

  document.getElementById('saveButton').style.display = "block";
});

document.getElementById('copyButton').addEventListener('click', function() {
  const snippetText = document.getElementById('snippetCode').textContent;

  navigator.clipboard.writeText(snippetText)
  .then(() => {
      console.log('Snippet copied to clipboard');
  })
  .catch(err => {
      console.error('Could not copy snippet: ', err);
  });
});

document.getElementById('saveButton').addEventListener('click', function() {
  const snippetCode = document.getElementById('snippetCode');
  snippetCode.contentEditable = "false";

  const snippetUrl = document.getElementById('snippetUrl');
  snippetUrl.contentEditable = "false";

  const updatedSnippetCode = snippetCode.textContent;
  const updatedSnippetUrl = snippetUrl.innerHTML;

  const index = snippets.findIndex(s => s.name === snippet.name);
  if (index !== -1) {
    snippets[index].code = updatedSnippetCode;
    snippets[index].url = updatedSnippetUrl;
  }

  saveSnippets(snippets).then(() => {
    console.log('Snippet saved');
  }).catch(err => {
    console.error('Error saving snippet: ', err);
  });

  this.style.display = "none";
});

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