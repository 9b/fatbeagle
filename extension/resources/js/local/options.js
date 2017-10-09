function save_options() {
    $('#save').toggleClass('btn-primary').toggleClass('btn-success');
    var select_fields = ['cfg_debug', 'cfg_auto_crawl', 'cfg_auto_extract'];
    for (i = 0; i < select_fields.length; i++) {
        var radio = document.getElementsByName(select_fields[i]);
        for (var j = 0, length = radio.length; j < length; j++) {
            if (radio[j].checked) {
                localStorage[select_fields[i]] = radio[j].value;
                break;
            }
        }
    }

    var url = document.getElementById('cfg_crawl_server').value;
    localStorage.cfg_crawl_server = url;
    var token = document.getElementById('cfg_crawl_token').value;
    localStorage.cfg_crawl_token = token;
    var key = document.getElementById('cfg_crawl_key').value;
    localStorage.cfg_crawl_key = key;

    localStorage.cfg_threshold = 5;
    localStorage.cfg_purge = 3;

    // Kick-off alarms to perform an update on the indicators
    chrome.alarms.create("processEvents",
                         {delayInMinutes: 0.1, periodInMinutes: 0.5});
    localStorage.cfg_configured = true;

    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = "Options saved!";
    setTimeout(function() {
        status.innerHTML = "";
        $('#save').toggleClass('btn-primary').toggleClass('btn-success');
    }, 3000);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    var select_fields = ['cfg_debug', 'cfg_auto_crawl', 'cfg_auto_extract'];
    for (i = 0; i < select_fields.length; i++) {
        var radio = document.getElementsByName(select_fields[i]);
        for (var j = 0, length = radio.length; j < length; j++) {
            if (radio[j].value == localStorage[select_fields[i]]) {
                radio[j].checked = true;
            }
        }
    }
    document.getElementById('cfg_crawl_server').value = localStorage.cfg_crawl_server;
    document.getElementById('cfg_crawl_token').value = localStorage.cfg_crawl_token;
    document.getElementById('cfg_crawl_key').value = localStorage.cfg_crawl_key;
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
$(function () {
    $('[data-toggle="tooltip"]').tooltip();
});


