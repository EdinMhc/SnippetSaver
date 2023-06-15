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

  const updatedSnippetCode = snippetCode.textContent;
  snippet.code = updatedSnippetCode;

  chrome.storage.local.set({ snippets: snippets }, function() {
    console.log('Snippet saved');
  });

  this.style.display = "none";
});
