/**
 * Add Protocol to any URL if it's missing
 * @param {string} url URL to check for a protocol
 * @param {string} def Which protocol to add
 * @return {string}    Returns a URL with proper protocol added to it
 */
function addProtocol(url, def) {
    if (!url || url === "") {
        return "";
    }
    if (!/^(f|ht)tps?:\/\//i.test(url)) {
        url = def + "://" + url;
    }
    return url;
}

/**
 * Remove any duplicate entries from an array
 * @param  {array} a Array with duplicate items
 * @return {array}   Array with unique items
 */
function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

/**
 * Validate TLD of an incoming domain or URL
 * @param  {string} a Domain or URL with a TLD to check
 * @return {array}    List of valid URLs based on TLD
 */
function validTLD(a) {
    var matches = [];
    for (var i = 0; i < a.length; i++) {
        var c = a[i].replace(/(^\w+:|^)\/\//, ''); //  Remove protocol
        var domain = c.split('/')[0]; //  Grab the domain, no URL
        var f = domain.split('.'); //  Split for TLD checking
        if (TLDS.indexOf(f[f.length - 1]) > -1) {
            matches.push(a[i]);
        }
    }
    return matches;
}

/**
 * Helper function to take a URL to domain
 * @param  {string} url URL to prune to a domain
 * @return {string}     Domain extracted from the URL
 */
function url2domain(url) {
    var _p = document.createElement('a');
    _p.href = url;
    var parsed = psl.parse(_p.hostname);
    return parsed.domain;
}

/**
 * Helper function to take a URL to a hostname
 * @param  {string} url URL to prune to a hostname
 * @return {string}     Hostname extracted from the URL
 */
function url2hostname(url) {
    var _p = document.createElement('a');
    _p.href = url;
    return _p.hostname;
}

/**
 * Return the proper state key based on selected method
 * @param  {string} url URL to process
 * @return {string}     Value that conforms to the desired state selection
 */
function derive_state(url) {
    var sm;
    if (localStorage.cfg_state_key === 'sm_domain') {
        sm = url2domain(url);
    } else if (localStorage.cfg_state_key === 'sm_hostname') {
        sm = url2hostname(url);
    } else {
        sm = url; //  Just use the URL
    }
    return sm;
}

/**
 * Create a frequency map based on state selection
 * @param  {array} a List of values to count
 * @return {object}  Mapping of value to counts
 */
function buildHostMap(a) {
    var map = {};
    for (var i = 0; i < a.length; i++) {
        var sm = derive_state(a[i]);
        if (map.hasOwnProperty(sm)) {
            map[sm] += 1;
        } else {
            map[sm] = 1;
        }
    }
    return map;
}

//  Load the context menus for FatBeagle
function loadContextMenus() {
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({"title": "FatBeagle", "id": "parent",
                                "contexts": ['all']});
    chrome.contextMenus.create({"title": "Send to crawlers", "parentId": "parent",
                                "contexts": ['all'], "id": "crawl"});
    chrome.contextMenus.create({"title": "Options", "parentId": "parent",
                                "contexts": ['all'], "id": "options"});
}
