let snippets;
let snippet;

const urlParams = new URLSearchParams(window.location.search);
const snippetName = urlParams.get('id');

chrome.storage.local.get({ snippets: [] }, function(result) {
  snippets = result.snippets;

  snippet = snippets.find(snippet => snippet.name === snippetName);

  if (snippet) {
    document.getElementById('snippetName').textContent = snippet.name;
    document.getElementById('snippetCode').innerHTML = convertUrlsToAnchors(snippet.code);
    
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
  const snippetCode = document.getElementById('snippetCode');
  snippetCode.style.fontSize = '12px';
  snippetCode.style.width = '350px';  // Adjust the width of the snippetCode
  document.body.style.width = '420px'; 
});

document.getElementById('mediumFont').addEventListener('click', function() {
  const snippetCode = document.getElementById('snippetCode');
  snippetCode.style.fontSize = '18px';
  snippetCode.style.width = '515px';  // Adjust the width of the snippetCode
  document.body.style.width = '610px'; 
});

document.getElementById('largeFont').addEventListener('click', function() {
  const snippetCode = document.getElementById('snippetCode');
  snippetCode.style.fontSize = '24px';
  snippetCode.style.width = '690px';  // Adjust the width of the snippetCode
  document.body.style.width = '770px'; 
});


document.getElementById('backButton').addEventListener('click', function() {
  window.history.back();
});

document.getElementById('newAddUrlButton').addEventListener('click', function() {
  const snippetUrl = document.getElementById('snippetUrl');
  const newUrl = prompt("Please enter the URL:");

  // Check if the user clicked "Cancel" or entered an empty URL
  if (newUrl !== null && newUrl.trim() !== "") {
      snippetUrl.href = newUrl;
      snippetUrl.textContent = newUrl;
      this.style.display = "none";  // Hide the button after adding the URL
  }
});

document.getElementById('editButton').addEventListener('click', function() {
  const snippetCode = document.getElementById('snippetCode');
  snippetCode.contentEditable = "true";

  const snippetUrl = document.getElementById('snippetUrl');
  snippetUrl.contentEditable = "true";
  
  if (snippetUrl.href.includes('null') || snippetUrl.href.trim() === "" || snippetUrl.textContent.includes('null') || snippetUrl.textContent.trim() === "") {
    document.getElementById('newAddUrlButton').style.visibility = "visible";  // Show the button
} else {
    document.getElementById('newAddUrlButton').style.visibility = "hidden";  // Hide the button
}

  document.getElementById('saveButton').style.display = "block";
  document.getElementById('boldButton').style.visibility = "visible";
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

  let updatedSnippetCode = convertAnchorsToUrls(snippetCode.innerHTML);

  const snippetUrl = document.getElementById('snippetUrl');
  snippetUrl.contentEditable = "false";
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
  document.getElementById('newAddUrlButton').style.visibility = "hidden";
  document.getElementById('boldButton').style.visibility = "hidden";
});

// document.getElementById('boldButton').addEventListener('click', function() {
//   const selection = window.getSelection();
//   const range = selection.getRangeAt(0);
//   const selectedText = range.toString();

//   // Check if the selected text is inside an anchor tag
//   const parentElement = range.commonAncestorContainer.parentElement;
//   if (parentElement && parentElement.tagName === 'A') {
//       // If inside an anchor tag, do nothing and return
//       return;
//   }

//   const boldElement = document.createElement('b');
//   boldElement.textContent = selectedText;

//   range.deleteContents();
//   range.insertNode(boldElement);

//   selection.removeAllRanges();
// });

document.getElementById('boldButton').addEventListener('click', function() {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const parentElement = range.commonAncestorContainer.parentElement;

  if (parentElement && parentElement.tagName === 'B') {
      // If the selected text is bolded, unbold it
      const unboldedText = document.createTextNode(parentElement.textContent);
      parentElement.replaceWith(unboldedText);
  } else {
      // If the selected text is not bolded, bold it
      const boldElement = document.createElement('b');
      boldElement.textContent = range.toString();
      range.deleteContents();
      range.insertNode(boldElement);
  }

  selection.removeAllRanges();
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

function convertUrlsToAnchors(text) {
  const urlRegex = /(?<!href="|">)(https?:\/\/[^\s<]+)/g;
  return text.replace(urlRegex, function(url) {
      return `<a href="${url}" target="_blank">${url}</a>`;
  });
}

function convertAnchorsToUrls(text) {
  const anchorRegex = /<a href="(https?:\/\/[^"]+)" target="_blank">\1<\/a>/g;
  return text.replace(anchorRegex, '$1');
}