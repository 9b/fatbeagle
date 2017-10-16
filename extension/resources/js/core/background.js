/**
 * Initialize our global space with a couple setup content and shared resources.
 */
var parser = document.createElement('a');
var state = {'count': 0, 'map': {}, 'flush': 0};
(function() {
    if (typeof localStorage.cfg_init === "undefined") {
        localStorage.cfg_init = true;
        localStorage.cfg_threshold = 5; //  When to throw away noisy hosts
        localStorage.cfg_purge = 15; //  How often to purge our state machine
        localStorage.cfg_auto_crawl = false;
        localStorage.cfg_auto_extract = false;
        localStorage.cfg_debug = false;
        localStorage.cfg_crawl_server = 'https://ws.riskiq.net/v1/landingPage/bulk';
        localStorage.cfg_crawl_token = '--YOUR-TOKEN-HERE--';
        localStorage.cfg_crawl_key = '--YOUR-KEY-HERE--';
        chrome.tabs.create({'url': OPTIONS_PAGE});
    }
})();


/** Reset the state machine */
function flushState() {
    //  This keeps our view of the world from being too bias.
    state = {'count': 0, 'map': {}, 'flush': 0};
}

/** Sync state machine with observations from page content */
function syncState(map) {
    for (var key in map) {
        if (state.map.hasOwnProperty(key)) {
            state.map[key] += map[key];
        } else {
            state.map[key] = map[key];
        }
    }
}


/**
 * Submit Crawl Candidates
 * Take the payload created from our other processes and send it along to the
 * crawler API. This function will handle the authentication and entire post
 * processing back to the server.
 */
function submitCrawls(payload) {
    console.log("Submitting crawls.");
    payload = JSON.stringify(payload);
    var key = localStorage.cfg_crawl_token + ":" + localStorage.cfg_crawl_key;
    var auth = window.btoa(key);
    var properties = {method: "POST", body: payload,
                      headers: {"Accept": "application/json",
                                "Content-Type": "application/json",
                                "Authorization": "Basic " + auth}};
    fetch(localStorage.cfg_crawl_server, properties)
    .then(function(response) {
        return response.json();
    })
    .then(function(payload) {
        if (localStorage.cfg_debug === 'true') { console.log("Extension synced with the server."); }
    })
    .catch(function(error) {
        console.log("ERROR", error);
    });
}


/**
 * Process Events
 * Go through local storage and extract any of the saved URL information that
 * we collected and send it off to the landing page crawlers. As we prepare the
 * entries, we will remove them from storage. There's no real error handling in
 * this process.
 */
function processEvents() {
    var _saved = 0;
    var _discard = 0;

    if (localStorage.cfg_configured !== 'true') {
        if (localStorage.cfg_debug === 'true') { console.log("Extension has not been configured"); }
        return false;
    }
    var entries = [];
    for (var i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i).substring(0, 4) === "cfg_") {
            continue;
        }
        var url = localStorage.getItem(localStorage.key(i));
        var obj = {'url': url};
        var sm = derive_state(url);
        if (state.map[sm] < parseInt(localStorage.cfg_threshold)) {
            entries.push(obj);
            _saved += 1;
        } else {
            _discard += 1;
        }
        localStorage.removeItem(localStorage.key(i));
    }
    state.flush += 1;
    if (localStorage.cfg_debug === 'true') {
        console.log("Saved", _saved, "Discarded", _discard, "State", state);
    }
    if (state.flush >= parseInt(localStorage.cfg_purge)) { flushState(); }
    if (entries.length === 0) {
        if (localStorage.cfg_debug === 'true') {
            console.log("No new entries to submit for crawling.");
        }
        return false;
    }
    var prepped = {'entry': entries};
    submitCrawls(prepped);
}

function extractLinks(message) {
    if (localStorage.cfg_auto_extract !== 'true' && !message.manual) {
        if (localStorage.cfg_debug === 'true') {
            console.log("Auto-extract is not set to process.");
        }
        return false;
    }
    var matches = [];
    var regmap = ['url'];
    for (var idx in regmap) {
        var rx = new RegExp(PATTERNS[regmap[idx]]);
        while((match = rx.exec(message.content)) !== null) {
            matches.push(match[0].toLowerCase());
        }
    }
    matches = validTLD(matches);
    syncState(buildHostMap(matches));
    matches = uniq(matches);
    var entries = [];
    for (var i = 0; i < matches.length; i++) {
        var sm = derive_state(matches[i]);
        if (state.map[sm] > parseInt(localStorage.cfg_threshold)) {
            continue;
        }
        entries.push({'url': matches[i]});
    }
    var prepped = {'entry': entries};
    submitCrawls(prepped);
    chrome.browserAction.setBadgeText({"text": String(entries.length)});
}

/**
 * Alarm Listener
 * Listen for any Chrome-generated alarms and route the request to the proper
 * functions. These alarms get setup at the start of the extension.
 */
chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name == "processEvents") {
        processEvents();
    }
});


/**
 * Network Interceptor
 * Look at all network requests happening in the browser and process the URLs
 * into localstorage if they match the types of request we care about. In an
 * effort to reduce the noise, we only load scripts, websites and AJAX requests.
 * Since we can't send the amount of data in real-time, we hash the URL and
 * store that inside of localstorage. An alarm will trigger in order to send
 * the information out to the crawlers.
 */
chrome.webRequest.onBeforeRequest.addListener(
    function(data) {
        if (localStorage.cfg_auto_crawl !== 'true') {
            if (localStorage.cfg_debug === 'true') {
                // console.log("Auto-crawling is not set to process.");
            }
            return {cancel: false};
        }
        focus = ['xmlhttprequest', 'script', 'main_frame'];
        if (focus.indexOf(data.type) == -1) {
            return {cancel: false};
        }
        var h = md5(data.url);
        localStorage[h] = data.url;
        var sm = derive_state(data.url);
        if (state.map.hasOwnProperty(sm)) {
            state.map[sm] += 1;
        } else {
            state.map[sm] = 1;
        }
        state.count += 1;
        return {cancel: false};
    },
    {urls: ["<all_urls>"]},
    ["blocking"]
);


/**
 * Context Menus
 * This dog knows a couple tricks. For cases when the user wants to manually
 * submit a url, or link from within a page, they can do so with custom context
 * menus. This handler will route the information to the proper place. When
 * handling in-page links, we smartly identify the item the user wishes to
 * crawl by looking at the submission context. If there's a `linkUrl`, then
 * we know the user submitted a hyper-link. If not, then we  fall back to the
 * text of the submission and perform some analysis on top of it.
 */
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "options") {
        chrome.tabs.create({'url': OPTIONS_PAGE});
        return false;
    }
    var entries = [{'url': info.pageUrl}];
    if (info.hasOwnProperty('linkUrl')) {
        entries.push({'url': info.linkUrl});
    }

    var matches = [];
    var regmap = ['domain', 'ip'];
    for (var idx in regmap) {
        var rx = new RegExp(PATTERNS[regmap[idx]]);
        while((match = rx.exec(info.selectionText)) !== null) {
            matches.push(match[0]);
        }
    }
    if (matches.length > 0) {
        if (info.selectionText.substring(0,4) !== 'http') {
            entries.push({'url': addProtocol(info.selectionText, 'http')});
            entries.push({'url': addProtocol(info.selectionText, 'https')});
        } else {
            entries.push({'url': info.selectionText});
        }
    }

    var prepped = {'entry': entries};
    submitCrawls(prepped);
});


/**
 * Page Parser
 * Sniff, sniff! When users opt-in to having their pages inspected, we will
 * marshal the DOM over to this back-end handler. We start by first finding
 * all of the URLs within the page. From there, we prune anything without a
 * valid TLD. In order to reduce noise, we build and sync frequency for all
 * observed hosts. As a final pass, we check the hostname of the URL against
 * our aggregate state machine and prune anything over the set threshold.
 */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.msg === "page") {
            extractLinks(request);
        }

        if (request.msg === "crawl") {
            var entries = [];
            if (request.url.substring(0,4) !== 'http') {
                entries.push({'url': addProtocol(request.url, 'http')});
                entries.push({'url': addProtocol(request.url, 'https')});
            } else {
                entries.push({'url': request.url});
            }
            var prepped = {'entry': entries};
            submitCrawls(prepped);
        }

        if (request.msg === 'current_crawl') {
            chrome.tabs.query({active: true}, function(tabs) {
                if (tabs.length === 0) {
                    return false;
                }
                var entries = [{'url': tabs[0]['url']}];
                var prepped = {'entry': entries};
                submitCrawls(prepped);
            });
        }

        if (request.msg === 'current_extract') {
            chrome.tabs.query({active: true}, function(tabs) {
                if (tabs.length === 0) {
                    return false;
                }
                var tab = tabs[0];
                chrome.tabs.executeScript(null, {file: JQUERY});
                chrome.tabs.executeScript(tab.id, {
                    code: 'window.woofWoofFBOverride = true;'
                }, function() {
                    chrome.tabs.executeScript(tab.id, {file: INJECT});
                });
            });
        }

        if (request.msg === 'options') {
            chrome.tabs.create({'url': OPTIONS_PAGE});
        }

        if (request.msg === 'reconfig') {
            console.log(request);
            if (request.hasOwnProperty('cfg_auto_crawl')) {
                if (request['cfg_auto_crawl'] === "true") {
                    localStorage.cfg_auto_crawl = true;
                } else {
                    localStorage.cfg_auto_crawl = false;
                }
            }

            if (request.hasOwnProperty('cfg_auto_extract')) {
                if (request['cfg_auto_extract'] === "true") {
                    localStorage.cfg_auto_extract = true;
                } else {
                    localStorage.cfg_auto_extract = false;
                }
            }
        }
    }
);


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.method === "config") {
        sendResponse({'cfg_auto_crawl': localStorage.cfg_auto_crawl,
                      'cfg_auto_extract': localStorage.cfg_auto_extract});
    }
});


//  Unleash the beagle!
chrome.alarms.create("processEvents",
                     {delayInMinutes: 0.1, periodInMinutes: 0.5});
chrome.runtime.onInstalled.addListener(loadContextMenus);
chrome.runtime.onStartup.addListener(loadContextMenus);
