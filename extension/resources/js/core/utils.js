function addProtocol(url, def) {
    if (!url || url === "") {
        return "";
    }
    if (!/^(f|ht)tps?:\/\//i.test(url)) {
        url = def + "://" + url;
    }
    return url;
}

function removeArrayItem(arr, value) {
    var index = arr.indexOf(value);
    if (index >= 0) {
        arr.splice(index, 1);
    }
    return arr;
}

function uniq(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

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

function url2domain(url) {
    var _p = document.createElement('a');
    _p.href = url;
    var parsed = psl.parse(_p.hostname);
    return parsed.domain;
}

function url2hostname(url) {
    var _p = document.createElement('a');
    _p.href = url;
    return _p.hostname;
}

function derive_state(url) {
    var sm;
    if (localStorage.cfg_state_key === 'sm_domain') {
        sm = url2domain(url);
    } else if (localStorage.cfg_state_key === 'sm_hostname') {
        sm = url2hostname(url);
    } else {
        //  This is default for the moment
        sm = url2domain(url);
    }
    return sm;
}

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

function loadContextMenus() {
    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({"title": "FatBeagle", "id": "parent",
                                "contexts": ['all']});
    chrome.contextMenus.create({"title": "Send to crawlers", "parentId": "parent",
                                "contexts": ['all'], "id": "crawl"});
    chrome.contextMenus.create({"title": "Options", "parentId": "parent",
                                "contexts": ['all'], "id": "options"});
}
