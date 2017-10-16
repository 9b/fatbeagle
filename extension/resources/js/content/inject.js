$(document).ready(function() {
    $('body').keypress(function(e) {
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;
        if (e.altKey && e.shiftKey && keyCode == 210) {
            chrome.runtime.sendMessage({'msg': "current_crawl"});
            chrome.runtime.sendMessage({'msg': "current_extract"});
        }
        if (e.altKey && e.shiftKey && keyCode == 63743) {
            chrome.runtime.sendMessage({'msg': "current_crawl"});
        }
        if (e.altKey && e.shiftKey && keyCode == 212) {
            chrome.runtime.sendMessage({'msg': "current_extract"});
        }
    });

    var woofWoofFBOverride = window['woofWoofFBOverride'];
    if (woofWoofFBOverride === undefined) {
        woofWoofFBOverride = false;
    }
    var entirePage = window.document.documentElement.innerHTML;
    chrome.runtime.sendMessage({msg: "page", content: entirePage,
                                manual: woofWoofFBOverride});
});