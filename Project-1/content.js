(function () {
  // Dictionary of gendered terms and their inclusive alternatives
  const genderedTerms = {
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
  };

  // Track replacements for statistics
  let replacementsCount = 0;

  // Function to check text nodes for gendered language
  function processNode(textNode) {
    let text = textNode.nodeValue;
    let modifiedText = text;
    let modified = false;

    // Get user settings
    chrome.storage.local.get(
      ["autoReplace", "highlightOnly"],
      function (settings) {
        const autoReplace =
          settings.autoReplace !== undefined ? settings.autoReplace : true;
        const highlightOnly =
          settings.highlightOnly !== undefined ? settings.highlightOnly : false;

        // Process each gendered term
        for (const [term, replacement] of Object.entries(genderedTerms)) {
          // Use regular expression with word boundaries to match whole words
          const regex = new RegExp(`\\b${term}\\b`, "gi");

          if (regex.test(modifiedText)) {
            regex.lastIndex = 0; // Reset regex state

            if (highlightOnly) {
              // Only highlight the term
              modifiedText = modifiedText.replace(
                regex,
                (match) =>
                  `<span style="background-color:rgb(236, 121, 132); border-radius: 3px; padding: 2px; width: 50px;" 
              title="Suggested inclusive alternative: ${replacement}">${match}</span>`
              );
            } else if (autoReplace) {
              // Replace the term
              modifiedText = modifiedText.replace(regex, (match) => {
                const count = (match.match(new RegExp(term, "gi")) || [])
                  .length;
                replacementsCount += count; // Count all occurrences
                updateStats();

                const matchCase = (replacement, originalWord) => {
                  if (originalWord === originalWord.toUpperCase())
                    return replacement.toUpperCase();
                  if (originalWord[0] === originalWord[0].toUpperCase()) {
                    return (
                      replacement.charAt(0).toUpperCase() + replacement.slice(1)
                    );
                  }
                  return replacement;
                };

                const casedReplacement = matchCase(replacement, match);
                return `<span style="background-color:rgb(87, 240, 99); border-radius: 3px; padding: 2px;" 
                title="Replaced from: ${match}">${casedReplacement}</span>`;
              });
            }

            modified = true;
          }
        }

        // Replace the text node with the modified HTML if changes were made
        if (modified) {
          const span = document.createElement("span");
          span.innerHTML = modifiedText;
          textNode.parentNode.replaceChild(span, textNode);
        }
      }
    );
  }

  // Update the statistics in storage
  function updateStats() {
    chrome.storage.local.get(
      ["termsReplaced", "totalReplaced", "lastReset"],
      function (data) {
        const currentDay = new Date().toDateString();
        const storedDay = data.lastReset || currentDay;

        let termsReplaced =
          storedDay === currentDay ? data.termsReplaced || 0 : 0;
        let totalReplaced = data.totalReplaced || 0;

        termsReplaced += 1;
        totalReplaced += 1;

        chrome.storage.local.set({
          termsReplaced: termsReplaced,
          totalReplaced: totalReplaced,
          lastReset: storedDay === currentDay ? storedDay : currentDay,
        });
      }
    );
  }

  // Function to walk through all text nodes in the document
  function walkTextNodes(node) {
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim().length > 0) {
      processNode(node);
    } else {
      // Skip certain elements that shouldn't be modified
      const skipElements = [
        "SCRIPT",
        "STYLE",
        "INPUT",
        "TEXTAREA",
        "SELECT",
        "OPTION",
      ];
      if (!skipElements.includes(node.nodeName)) {
        // Process child nodes
        for (let i = 0; i < node.childNodes.length; i++) {
          walkTextNodes(node.childNodes[i]);
        }
      }
    }
  }

  // Process the page when it loads
  walkTextNodes(document.body);

  // Create a MutationObserver to handle dynamic content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            walkTextNodes(node);
          }
        });
      }
    });
  });

  // Start observing the document with the configured parameters
  observer.observe(document.body, { childList: true, subtree: true });
})();
