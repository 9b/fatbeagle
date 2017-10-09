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

function buildHostMap(a) {
    var map = {};
    for (var i = 0; i < a.length; i++) {
        var c = a[i].replace(/(^\w+:|^)\/\//, ''); //  Remove protocol
        var domain = c.split('/')[0]; //  Grab the domain, no URL
        if (map.hasOwnProperty(domain)) {
            map[domain] += 1;
        } else {
            map[domain] = 1;
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
