document.addEventListener("DOMContentLoaded", function () {
  // Default gendered terms dictionary
  const defaultGenderedTerms = {
    businessman: "businessperson",
    businesswoman: "businessperson",
    cameraman: "camera operator",
    chairman: "chairperson",
    congressmen: "members of congress",
    congressman: "member of congress",
    congresswoman: "member of congress",
    doorman: "door attendant",
    fireman: "firefighter",
    fisherman: "fisher",
    foreman: "supervisor",
    freshman: "first-year student",
    girlfriend: "partner",
    boyfriend: "partner",
    gentlemen: "everyone",
    "ladies and gentlemen": "everyone",
    hostess: "host",
    housewife: "homemaker",
    mailman: "mail carrier",
    mankind: "humanity",
    manmade: "artificial",
    manpower: "workforce",
    middleman: "intermediary",
    policeman: "police officer",
    policewoman: "police officer",
    postman: "postal worker",
    salesman: "salesperson",
    saleswoman: "salesperson",
    spokesman: "spokesperson",
    spokeswoman: "spokesperson",
    stewardess: "flight attendant",
    waitress: "server",
    workman: "worker",
    "he/she": "they",
    "his/her": "their",
    "him/her": "them",
    "men and women": "people",
    "man hours": "work hours",
    "man-made": "artificial",
    "man-to-man": "person-to-person",
    manhood: "adulthood",
    manned: "staffed",
    mankind: "humankind",
    "mother nature": "nature",
    motherly: "nurturing",
    fatherly: "protective",
  };

  // Application State
  let state = {
    termsReplaced: 0,
    totalReplaced: 0,
    autoReplace: true,
    highlightOnly: false,
    showNotifications: true,
    darkMode: false,
    customTerms: {},
    lastReset: new Date().toDateString(),
  };

  // DOM Elements
  const elements = {
    termsReplaced: document.getElementById("termsReplaced"),
    totalReplaced: document.getElementById("totalReplaced"),
    autoReplace: document.getElementById("autoReplace"),
    highlightOnly: document.getElementById("highlightOnly"),
    showNotifications: document.getElementById("showNotifications"),
    textInput: document.getElementById("textInput"),
    results: document.getElementById("results"),
    checkButton: document.getElementById("checkButton"),
    copyButton: document.getElementById("copyButton"),
    resetStats: document.getElementById("resetStats"),
    loadingSpinner: document.getElementById("loadingSpinner"),
    notification: document.getElementById("notification"),
    dictionarySection: document.getElementById("dictionarySection"),
    toggleDictionary: document.getElementById("toggleDictionary"),
    termInput: document.getElementById("termInput"),
    replacementInput: document.getElementById("replacementInput"),
    addTermButton: document.getElementById("addTermButton"),
    customTermsList: document.getElementById("customTermsList"),
    exportData: document.getElementById("exportData"),
    importData: document.getElementById("importData"),
  };

  // Initialize the application
  initializeApp();

  // Event Listeners
  registerEventListeners();

  // Functions
  function initializeApp() {
    loadState();
    resetDailyStats();
    updateUI();
  }

  function registerEventListeners() {
    // Settings toggles
    elements.autoReplace.addEventListener("change", function () {
      state.autoReplace = this.checked;
      if (this.checked) {
        elements.highlightOnly.checked = false;
        state.highlightOnly = false;
      }
      saveState();
      showNotification("Settings updated");
    });

    elements.highlightOnly.addEventListener("change", function () {
      state.highlightOnly = this.checked;
      if (this.checked) {
        elements.autoReplace.checked = false;
        state.autoReplace = false;
      }
      saveState();
      showNotification("Settings updated");
    });

    elements.showNotifications.addEventListener("change", function () {
      state.showNotifications = this.checked;
      saveState();
    });

    // Main functionality
    function checkTextHandler() {
      // 🔹 Your existing logic for checking text

      //Send a message to background.js
      chrome.runtime.sendMessage({ action: "fetchData" }, (response) => {
        console.log("Received from Background:", response.data);
      });
    }

    // Only one event listener
    document.addEventListener("DOMContentLoaded", function () {
      // 🔹 Attach a single event listener to checkButton
      elements.checkButton.addEventListener("click", checkTextHandler);

      elements.copyButton.addEventListener("click", copyResultText);
      elements.resetStats.addEventListener("click", resetAllStats);
    });

    // Dictionary management
    elements.toggleDictionary.addEventListener(
      "click",
      toggleDictionarySection
    );
    elements.addTermButton.addEventListener("click", addCustomTerm);
    elements.exportData.addEventListener("click", exportUserData);
    elements.importData.addEventListener("click", importUserData);

    // Responsive text input
    elements.textInput.addEventListener("keydown", function (e) {
      if (e.ctrlKey && e.key === "Enter") {
        checkTextHandler();
      }
    });
  }

  function loadState() {
    chrome.storage.local.get(
      [
        "termsReplaced",
        "totalReplaced",
        "autoReplace",
        "highlightOnly",
        "showNotifications",
        "darkMode",
        "customTerms",
        "lastReset",
      ],
      function (data) {
        if (data) {
          state = { ...state, ...data };
        }
      }
    );
  }

  function saveState() {
    chrome.storage.local.set(state);
  }

  function updateUI() {
    // Update counters
    elements.termsReplaced.textContent = state.termsReplaced || 0;
    elements.totalReplaced.textContent = state.totalReplaced || 0;

    // Update toggle switches
    elements.autoReplace.checked = state.autoReplace;
    elements.highlightOnly.checked = state.highlightOnly;
    elements.showNotifications.checked = state.showNotifications;

    // Update custom terms list
    updateCustomTermsList();
  }

  function resetDailyStats() {
    const today = new Date().toDateString();
    if (state.lastReset !== today) {
      state.termsReplaced = 0;
      state.lastReset = today;
      saveState();
    }
  }

  function showNotification(message) {
    if (!state.showNotifications) return;

    elements.notification.textContent = message;
    elements.notification.style.display = "block";

    // Use animation to show and hide notification
    elements.notification.style.animation = "none";
    // Force reflow to restart animation
    void elements.notification.offsetWidth;
    elements.notification.style.animation = "slideNotification 3s forwards";

    setTimeout(() => {
      elements.notification.style.display = "none";
    }, 3000);
  }

  function checkTextHandler() {
    const text = elements.textInput.value;

    if (!text.trim()) {
      elements.results.innerHTML = "<p>Please enter some text to check.</p>";
      return;
    }

    // Show loading spinner
    elements.loadingSpinner.style.display = "block";
    elements.checkButton.disabled = true;

    // Use setTimeout to allow the UI to update
    setTimeout(() => {
      const { resultText, replacements } = checkText(text);

      // Hide loading spinner
      elements.loadingSpinner.style.display = "none";
      elements.checkButton.disabled = false;

      if (replacements.length === 0) {
        elements.results.innerHTML = "<p>✅ No gendered terms found!</p>";
        elements.copyButton.style.display = "none";
        return;
      }

      // Update statistics
      state.termsReplaced += replacements.length;
      state.totalReplaced += replacements.length;
      saveState();
      updateUI();

      // Display results
      elements.results.innerHTML = `<p>Found ${replacements.length} gendered term(s):</p>`;

      if (state.highlightOnly) {
        const resultParagraph = document.createElement("p");
        resultParagraph.innerHTML = resultText;
        elements.results.appendChild(resultParagraph);
      } else {
        displayTermCards(replacements, text);
      }

      // Show copy button
      elements.copyButton.style.display = "inline-block";

      showNotification(`Found ${replacements.length} gendered terms`);
    }, 300);
  }

  function checkText(text) {
    // Combine default and custom terms
    const genderedTerms = { ...defaultGenderedTerms, ...state.customTerms };

    let resultText = text;
    const replacements = [];

    // Find and highlight/replace gendered terms
    for (const [term, replacement] of Object.entries(genderedTerms)) {
      // Use regular expression with word boundaries to match whole words
      const regex = new RegExp(`\\b${term}\\b`, "gi");

      if (regex.test(text)) {
        // Reset the regex since we used the test method
        regex.lastIndex = 0;

        // Replace the term with a highlighted version
        resultText = resultText.replace(regex, (match) => {
          replacements.push({
            original: match,
            suggested: replacement,
            context: getContext(text, match),
          });
          return `<span class="highlighted">${match}</span> <span class="suggestion">(suggested: ${replacement})</span>`;
        });
      }
    }

    return { resultText, replacements };
  }

  function getContext(text, term) {
    const termIndex = text.toLowerCase().indexOf(term.toLowerCase());
    if (termIndex === -1) return "";

    const startIndex = Math.max(0, termIndex - 20);
    const endIndex = Math.min(text.length, termIndex + term.length + 20);

    let context = text.substring(startIndex, endIndex);
    if (startIndex > 0) context = "..." + context;
    if (endIndex < text.length) context = context + "...";

    return context;
  }

  function displayTermCards(replacements, originalText) {
    const cardsContainer = document.createElement("div");
    replacements.forEach((replacement, index) => {
      const card = document.createElement("div");
      card.className = "term-card";

      const termInfo = document.createElement("div");
      termInfo.className = "term-info";

      const termOriginal = document.createElement("p");
      termOriginal.innerHTML = `<b>${replacement.original}</b> → <span class="suggestion">${replacement.suggested}</span>`;

      const termContext = document.createElement("p");
      termContext.className = "context";
      termContext.innerHTML = replacement.context.replace(
        new RegExp(`\\b${replacement.original}\\b`, "gi"),
        `<span class="highlighted">${replacement.original}</span>`
      );

      const actionButton = document.createElement("button");
      actionButton.className = "apply-btn term-action";
      actionButton.innerHTML = '<i class="fas fa-check"></i>';
      actionButton.dataset.index = index;
      actionButton.dataset.tooltip = "Apply this suggestion";
      actionButton.addEventListener("click", () => {
        applyReplacement(replacement, originalText);
      });

      termInfo.appendChild(termOriginal);
      termInfo.appendChild(termContext);
      card.appendChild(termInfo);
      card.appendChild(actionButton);

      cardsContainer.appendChild(card);
    });

    elements.results.appendChild(cardsContainer);

    // Add "Apply All" button
    const applyAllBtn = document.createElement("button");
    applyAllBtn.className = "apply-btn";
    applyAllBtn.innerHTML =
      '<i class="fas fa-check-double"></i> Apply All Suggestions';
    applyAllBtn.addEventListener("click", () => {
      applyAllReplacements(replacements, originalText);
    });

    elements.results.appendChild(applyAllBtn);
  }

  function applyReplacement(replacement, originalText) {
    const regex = new RegExp(`\\b${replacement.original}\\b`, "gi");
    const updatedText = originalText.replace(regex, replacement.suggested);
    elements.textInput.value = updatedText;

    // Re-check the text
    checkTextHandler();
    showNotification(
      `Replaced "${replacement.original}" with "${replacement.suggested}"`
    );
  }

  function applyAllReplacements(replacements, originalText) {
    let updatedText = originalText;

    replacements.forEach((replacement) => {
      const regex = new RegExp(`\\b${replacement.original}\\b`, "gi");
      updatedText = updatedText.replace(regex, replacement.suggested);
    });

    elements.textInput.value = updatedText;

    // Re-check the text
    checkTextHandler();
    showNotification("Applied all suggestions");
  }

  function copyResultText() {
    const text = elements.textInput.value;
    navigator.clipboard.writeText(text).then(
      function () {
        showNotification("Text copied to clipboard!");
      },
      function (err) {
        showNotification("Could not copy text: " + err);
      }
    );
  }

  function resetAllStats() {
    // Show confirmation
    if (confirm("Are you sure you want to reset all statistics?")) {
      state.termsReplaced = 0;
      state.totalReplaced = 0;
      state.lastReset = new Date().toDateString();
      saveState();
      updateUI();
      showNotification("Statistics have been reset");
    }
  }

  // Dictionary Management Functions
  function toggleDictionarySection() {
    const isVisible = elements.dictionarySection.style.display !== "none";
    elements.dictionarySection.style.display = isVisible ? "none" : "block";
    elements.toggleDictionary.textContent = isVisible
      ? "Manage Custom Terms"
      : "Hide Custom Terms";
  }

  function addCustomTerm() {
    const term = elements.termInput.value.trim().toLowerCase();
    const replacement = elements.replacementInput.value.trim();

    if (!term || !replacement) {
      showNotification("Please enter both a term and replacement");
      return;
    }

    // Add to custom terms
    state.customTerms[term] = replacement;
    saveState();

    // Clear inputs
    elements.termInput.value = "";
    elements.replacementInput.value = "";

    // Update the list
    updateCustomTermsList();
    showNotification(`Added "${term}" → "${replacement}"`);
  }

  function updateCustomTermsList() {
    elements.customTermsList.innerHTML = "";

    if (Object.keys(state.customTerms).length === 0) {
      elements.customTermsList.innerHTML = "<p>No custom terms added yet.</p>";
      return;
    }

    for (const [term, replacement] of Object.entries(state.customTerms)) {
      const termItem = document.createElement("div");
      termItem.className = "term-card";

      const termInfo = document.createElement("div");
      termInfo.className = "term-info";
      termInfo.innerHTML = `<b>${term}</b> → ${replacement}`;

      const deleteButton = document.createElement("button");
      deleteButton.className = "term-action";
      deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
      deleteButton.addEventListener("click", () => {
        removeCustomTerm(term);
      });

      termItem.appendChild(termInfo);
      termItem.appendChild(deleteButton);
      elements.customTermsList.appendChild(termItem);
    }
  }

  function removeCustomTerm(term) {
    delete state.customTerms[term];
    saveState();
    updateCustomTermsList();
    showNotification(`Removed "${term}" from custom terms`);
  }

  function exportUserData() {
    const exportData = {
      settings: {
        autoReplace: state.autoReplace,
        highlightOnly: state.highlightOnly,
        showNotifications: state.showNotifications,
        darkMode: state.darkMode,
      },
      statistics: {
        totalReplaced: state.totalReplaced,
      },
      customTerms: state.customTerms,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileName = "inclusive-language-checker-data.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileName);
    linkElement.click();

    showNotification("Data exported successfully");
  }

  function importUserData() {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";

    fileInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const importedData = JSON.parse(e.target.result);

          // Update state with imported data
          if (importedData.settings) {
            state.autoReplace = importedData.settings.autoReplace;
            state.highlightOnly = importedData.settings.highlightOnly;
            state.showNotifications = importedData.settings.showNotifications;
            state.darkMode = importedData.settings.darkMode;
          }

          if (
            importedData.statistics &&
            importedData.statistics.totalReplaced
          ) {
            state.totalReplaced = importedData.statistics.totalReplaced;
          }

          if (importedData.customTerms) {
            state.customTerms = importedData.customTerms;
          }

          saveState();
          updateUI();
          showNotification("Data imported successfully");
        } catch (error) {
          showNotification("Error importing data: " + error.message);
        }
      };
      reader.readAsText(file);
    });

    fileInput.click();
  }

  // Web Page Content Processing
  // This will be triggered when the extension is active on a webpage
  function processPageContent() {
    // This function will be injected into the page via content script
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: scanPageForGenderedTerms,
      });
    });
  }

  function scanPageForGenderedTerms() {
    // Get all text nodes in the document
    const textNodes = [];
    const walk = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walk.nextNode())) {
      // Skip script and style elements
      if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.parentNode.nodeName)) {
        continue;
      }

      textNodes.push(node);
    }

    // Get gendered terms from storage
    chrome.storage.local.get(
      ["autoReplace", "highlightOnly", "customTerms"],
      function (data) {
        // Combine default and custom terms
        const genderedTerms = {
          ...defaultGenderedTerms,
          ...(data.customTerms || {}),
        };

        let replacementCount = 0;

        // Check each text node
        textNodes.forEach((textNode) => {
          let content = textNode.nodeValue;
          let newContent = content;
          let modified = false;

          for (const [term, replacement] of Object.entries(genderedTerms)) {
            const regex = new RegExp(`\\b${term}\\b`, "gi");

            if (regex.test(content)) {
              regex.lastIndex = 0;

              if (data.highlightOnly) {
                // Create a wrapper element for highlighting
                const wrapper = document.createElement("span");
                wrapper.innerHTML = content.replace(
                  regex,
                  (match) =>
                    `<span style="background-color: #ffe6e6; border-radius: 3px; padding: 0 2px;">${match}</span>`
                );

                textNode.parentNode.replaceChild(wrapper, textNode);
                modified = true;
                replacementCount++;
                break;
              } else if (data.autoReplace !== false) {
                newContent = newContent.replace(regex, replacement);
                modified = true;
                replacementCount += (content.match(regex) || []).length;
              }
            }
          }

          if (modified && !data.highlightOnly) {
            textNode.nodeValue = newContent;
          }
        });

        // Update statistics if replacements were made
        if (replacementCount > 0) {
          chrome.storage.local.get(
            ["termsReplaced", "totalReplaced"],
            function (stats) {
              chrome.storage.local.set({
                termsReplaced: (stats.termsReplaced || 0) + replacementCount,
                totalReplaced: (stats.totalReplaced || 0) + replacementCount,
              });

              // Notify the user
              if (data.showNotifications !== false) {
                const notification = document.createElement("div");
                notification.style.position = "fixed";
                notification.style.top = "10px";
                notification.style.right = "10px";
                notification.style.backgroundColor = "#4caf50";
                notification.style.color = "white";
                notification.style.padding = "10px 15px";
                notification.style.borderRadius = "5px";
                notification.style.zIndex = "9999";
                notification.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
                notification.textContent = `Replaced ${replacementCount} gendered terms`;

                document.body.appendChild(notification);

                setTimeout(() => {
                  notification.style.opacity = "0";
                  notification.style.transition = "opacity 0.5s ease";
                  setTimeout(() => {
                    document.body.removeChild(notification);
                  }, 500);
                }, 3000);
              }
            }
          );
        }
      }
    );
  }

  // Content script communication
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.action === "getReplacements") {
      // Handle communication from content scripts
      // This will be used when the extension is actively scanning a webpage
      sendResponse({
        autoReplace: state.autoReplace,
        highlightOnly: state.highlightOnly,
        customTerms: state.customTerms,
      });
    }
  });
});
