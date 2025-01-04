// Receive message from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.courses) {
        console.log(request.courses);
    }
});
