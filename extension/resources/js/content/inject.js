$(document).ready(function() {
    var entirePage = window.document.documentElement.innerHTML;
    chrome.runtime.sendMessage({msg: "page", 'content': entirePage});
});