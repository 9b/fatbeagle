$(document).ready(function() {
    var woofWoofFBOverride = window['woofWoofFBOverride'];
    if (woofWoofFBOverride === undefined) {
        woofWoofFBOverride = false;
    }
    var entirePage = window.document.documentElement.innerHTML;
    chrome.runtime.sendMessage({msg: "page", content: entirePage,
                                manual: woofWoofFBOverride});
});