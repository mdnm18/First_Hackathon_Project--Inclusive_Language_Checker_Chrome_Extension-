chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed!");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "fetchData") {
    console.log("Fetching Data in Background...");
    sendResponse({ data: "Sample Data from Background Script" });
  }
});
