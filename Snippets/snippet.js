let snippets;
let snippet;

const urlParams = new URLSearchParams(window.location.search);
const snippetName = urlParams.get('id');

chrome.storage.local.get({ snippets: [] }, function(result) {
  snippets = result.snippets;

  snippet = snippets.find(snippet => snippet.name === snippetName);

  if (!snippet) {
    document.getElementById('snippetName').textContent = 'Snippet not found';
    return;
  }

  loadSnippet(snippet);
});

function loadSnippet(snippet) {
  let snippetUrl = document.getElementById('snippetUrl');
  const snippetCode = document.getElementById('snippetCode');
  let tempUrl = snippet.url;

  let detachedSnippetUrl = detachElement(snippetUrl);

  setSnippetName(snippet.name);
  setSnippetCode(snippet.code);
  loadCheckBoxes(snippetCode);
  appendToFindSnippet(detachedSnippetUrl);
  configureSnippetUrl(snippetUrl, tempUrl);
}

document.getElementById('smallFont').addEventListener('click', function() {
  const snippetCode = document.getElementById('snippetCode');
  snippetCode.style.fontSize = '12px';
  snippetCode.style.width = '350px';
  document.body.style.width = '420px';

  const checkboxes = snippetCode.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.style.width = '12px';
    checkbox.style.height = '12px';
    if (checkbox.checked) {
      checkbox.style.fontSize = '10px';
    }
  });

  const toolbarButtons = document.querySelectorAll('#toolBar button');
    toolbarButtons.forEach(button => {
        button.style.width = '20px';
        button.style.height = '20px';
        button.style.fontSize = '12px';
        const icon = button.querySelector('i');
        if (icon) {
            icon.style.fontSize = '15px';
        }
    });
    const toolBar = document.getElementById('toolBar');
    toolBar.style.gap = '5px';
});

document.getElementById('mediumFont').addEventListener('click', function() {
  const snippetCode = document.getElementById('snippetCode');
  snippetCode.style.fontSize = '18px';
  snippetCode.style.width = '515px';
  document.body.style.width = '610px';

  const checkboxes = snippetCode.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.style.width = '18px';
    checkbox.style.height = '18px';
    if (checkbox.checked) {
      checkbox.style.fontSize = '15px';
    }
  });

  const toolbarButtons = document.querySelectorAll('#toolBar button');
    toolbarButtons.forEach(button => {
        button.style.width = '25px';
        button.style.height = '25px';
        button.style.fontSize = '16px';
        const icon = button.querySelector('i');
        if (icon) {
            icon.style.fontSize = '15px';
        }
    });

    const toolBar = document.getElementById('toolBar');
    toolBar.style.gap = '7px';

  const checkboxTool = document.querySelector('.material-icons.checkbox-icon');
  checkboxTool.style.fontSize = '18px';
});

document.getElementById('largeFont').addEventListener('click', function() {
  const snippetCode = document.getElementById('snippetCode');
  snippetCode.style.fontSize = '24px';
  snippetCode.style.width = '690px';
  document.body.style.width = '770px';

  const checkboxes = snippetCode.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.style.width = '24px';
    checkbox.style.height = '24px';
    if (checkbox.checked) {
      checkbox.style.fontSize = '20px';
    }
  });

  const toolbarButtons = document.querySelectorAll('#toolBar button');
    toolbarButtons.forEach(button => {
        button.style.width = '30px';
        button.style.height = '30px';
        button.style.fontSize = '20px';
        const icon = button.querySelector('i');
        if (icon) {
            icon.style.fontSize = '18px';
        }
    });

    const toolBar = document.getElementById('toolBar');
    toolBar.style.gap = '10px';

  const checkboxTool = document.querySelector('.material-icons.checkbox-icon');
  checkboxTool.style.fontSize = '20px';
});

document.getElementById('backButton').addEventListener('click', function() {
  window.location.href = '../popup.html?loadSnippets=true';
});

document.getElementById('newAddUrlButton').addEventListener('click', function() {
  const snippetUrl = document.getElementById('snippetUrl');
  const newUrl = prompt("Please enter the URL:");

  if (newUrl !== null && newUrl.trim() !== "") {
      snippetUrl.href = newUrl;
      snippetUrl.textContent = newUrl;
      this.style.visibility = "hidden";
  }
});

document.getElementById('editButton').addEventListener('click', function() {
  const snippetCode = document.getElementById('snippetCode');
  snippetCode.contentEditable = "true";

  const snippetUrl = document.getElementById('snippetUrl');
  if (snippetUrl.textContent !== ""){
    snippetUrl.contentEditable = "true";
    snippetUrl.textContent = snippet.url;
  }

  const newAddUrlButton = document.getElementById('newAddUrlButton');
  if (snippetUrl.href.includes('null') || snippetUrl.href.trim() === "" || snippetUrl.textContent.includes('null') || snippetUrl.textContent.trim() === "") {
    newAddUrlButton.style.visibility = "visible";
  } else {
    newAddUrlButton.style.visibility = "hidden";
  }

  document.getElementById('saveButton').style.display = "block";
  document.getElementById('boldButton').style.visibility = "visible";
  document.getElementById('checkboxButton').style.visibility = "visible";
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

document.getElementById('boldButton').addEventListener('click', function() {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);

  if (range && range.commonAncestorContainer.querySelector && range.commonAncestorContainer.querySelector('input[type="checkbox"]')) {
      return;
  }

  const parentElement = range.commonAncestorContainer.parentElement;

  if (parentElement && parentElement.tagName === 'B') {
      const unboldedText = document.createTextNode(parentElement.textContent);
      parentElement.replaceWith(unboldedText);
  } else {
      const boldElement = document.createElement('b');
      boldElement.textContent = range.toString();
      range.deleteContents();
      range.insertNode(boldElement);
  }

  selection.removeAllRanges();
});

document.getElementById('checkboxButton').addEventListener('click', function() {
  const selection = window.getSelection();

  if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'checkbox' + Date.now();

      console.log("Checkbox created id: ", checkbox.id);
      const label = document.createElement('label');
      label.htmlFor = checkbox.id;

      handleCheckboxChange(checkbox);

      range.deleteContents();
      range.insertNode(checkbox);
      range.insertNode(label);

      console.log("Checkbox inserted");

      range.setStartAfter(checkbox);
      range.setEndAfter(checkbox);
      selection.removeAllRanges();
      selection.addRange(range);
  }
});

document.getElementById('saveButton').addEventListener('click', function() {
  const snippetCode = document.getElementById('snippetCode');
  snippetCode.contentEditable = "false";

  let updatedSnippetCode = convertAnchorsToUrls(snippetCode.innerHTML);
  updatedSnippetCode = updatedSnippetCode.replace('data-unique="bottom-url"', '');

  const snippetUrl = document.getElementById('snippetUrl');
  let currentUrl = snippetUrl.textContent.trim() === "" ? "" : snippetUrl.textContent;
  snippet.url = currentUrl;

  snippetUrl.contentEditable = "false";

  if (snippet.url !== "") {
    snippetUrl.textContent = "Find it here!";
  } else {
      snippetUrl.textContent = "";
  }

  const index = snippets.findIndex(s => s.name === snippet.name);
  if (index !== -1) {
      snippets[index].code = updatedSnippetCode;
      snippets[index].url = currentUrl;
  }

  saveSnippets(snippets).then(() => {
      console.log('Snippet saved');
  }).catch(err => {
      console.error('Error saving snippet: ', err);
  });

  this.style.display = "none";
  document.getElementById('newAddUrlButton').style.visibility = "hidden";
  document.getElementById('boldButton').style.visibility = "hidden";
  document.getElementById('checkboxButton').style.visibility = "hidden";
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

function setSnippetName(name) {
  document.getElementById('snippetName').textContent = name;
}

function setSnippetCode(code) {
  document.getElementById('snippetCode').innerHTML = convertUrlsToAnchors(code);
}

function configureSnippetUrl(snippetUrl, url) {
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url;
  }
  snippetUrl.href = url;
  snippetUrl.target = "_blank";
  if (url === ""){
      snippetUrl.textContent = "";
  }
  else{
      snippetUrl.textContent = "Find it here!";
  }
  snippetUrl.setAttribute('data-unique', 'bottom-url');
}

function detachElement(element) {
  return element.parentNode.removeChild(element);
}

function appendToFindSnippet(element) {
  const findSnippetElement = document.getElementById('findSnippet');
  findSnippetElement.appendChild(element);
  findSnippetElement.style.display = 'block';
}

function handleCheckboxChange(checkbox) {
  checkbox.addEventListener('change', function() {
    console.log('handle checkbox change');
      this.setAttribute('data-checked', this.checked ? 'true' : 'false');

      saveCurrentSnippetState(checkbox);
  });
}

function saveCurrentSnippetState(checkbox) {
  console.log('Checkbox saved');
  const snippetCode = document.getElementById('snippetCode');
  let updatedSnippetCode = convertAnchorsToUrls(snippetCode.innerHTML);
  updatedSnippetCode = updatedSnippetCode.replace('data-unique="bottom-url"', '');

  const snippetUrlElement = document.getElementById('snippetUrl');
  let currentUrl = snippetUrlElement.textContent.trim() !== "" ? snippetUrlElement.href : "";

  snippet.url = currentUrl;

  const index = snippets.findIndex(s => s.name === snippet.name);
  if (index !== -1) {
      snippets[index].code = updatedSnippetCode;
      snippets[index].url = currentUrl;
  }

  saveSnippets(snippets).then(() => {
      console.log('Checkbox saved');
  }).catch(err => {
      console.error('Error saving Checkbox: ', err);
  });
}

function loadCheckBoxes(snippetCode) {
  snippetCode.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    const isChecked = checkbox.getAttribute('data-checked') === 'true';
    checkbox.checked = isChecked;
});

snippetCode.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
checkbox.style.width = '12px';
checkbox.style.height = '12px';
});
}

document.getElementById('snippetCode').addEventListener('change', function(event) {
  if (event.target.type === 'checkbox') {
      event.target.setAttribute('data-checked', event.target.checked ? 'true' : 'false');
      saveCurrentSnippetState(event.target);
  }
});

document.getElementById('snippetCode').addEventListener('paste', function(event) {
  event.preventDefault();

  var text = (event.clipboardData || window.clipboardData).getData('text');

  if (document.getSelection) {
      var selection = document.getSelection();
      if (selection.rangeCount > 0) {
          var range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(text));
      }
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  applyTheme(currentTheme);
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