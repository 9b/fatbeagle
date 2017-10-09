function submit() {
    var url = document.getElementById('url').value;
    if (url === '' || url.split('.').length === 1) {
        return false;
    }
    chrome.runtime.sendMessage({'msg': "crawl", "url": url});
    document.getElementById('url').value = '';
}

document.getElementById('crawl').addEventListener('click', submit);
document.getElementById('url').onkeypress = function(e) {
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13') {
        document.getElementById('crawl').click();
        return false;
    }
};