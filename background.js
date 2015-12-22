// listening for an event / one-time requests
// coming from the popup
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.type) {
        case "time-on-the-fly":
            timeFlies();
        break;
    }
    return true;
});
 
// send a message to the content script
var timeFlies = function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {message: "convert-selected", timezone:"Europe/Paris"} );
    });
}