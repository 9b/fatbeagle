$('#cfg_profiles').change(function() {
    localStorage.cfg_active_profile = $(this).val();
    var channels = JSON.parse(localStorage.cfg_profiles);
    for (i = 0; i < channels.length; i++) {
        if (channels[i].name !== localStorage.cfg_active_profile) {
            continue;
        }
        localStorage.cfg_crawl_server = channels[i].url;
        localStorage.cfg_crawl_token = channels[i].token;
        localStorage.cfg_crawl_key = channels[i].key;
    }
});

function add_node() {
    var name = document.getElementById('cfg_profile_name').value;
    if (name === '') {
        var error = document.getElementById("error_message");
        error.innerHTML = "Name can't be blank.";
        setTimeout(function() {
            error.innerHTML = "";
        }, 3000);
        return false;
    }
    var url = document.getElementById('cfg_crawl_server').value;
    var token = document.getElementById('cfg_crawl_token').value;
    var key = document.getElementById('cfg_crawl_key').value;
    localStorage.cfg_crawl_server = url;
    localStorage.cfg_crawl_token = token;
    localStorage.cfg_crawl_key = key;

    var channels = JSON.parse(localStorage.cfg_profiles);
    var result = $.grep(channels, function(e){ return e.name == name; });
    if (result.length > 0) {
        var error = document.getElementById("error_message");
        error.innerHTML = "Name is already used.";
        setTimeout(function() {
            error.innerHTML = "";
        }, 3000);
        return false;
    }
    channels.push({'id': channels.length, 'name': name, 'url': url,
                   'token': token, 'key': key});
    localStorage.cfg_profiles = JSON.stringify(channels);
    document.getElementById('cfg_profile_name').value = '';
    document.getElementById('cfg_crawl_server').value = '';
    document.getElementById('cfg_crawl_token').value = '';
    document.getElementById('cfg_crawl_key').value = '';
    localStorage.cfg_active_profile = name;
    location.reload();
}

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

    var active_profile = document.getElementById('cfg_active_profile');
    localStorage.cfg_active_profile = select.options[select.selectedIndex].value;
    var purge = document.getElementById('cfg_purge').value;
    localStorage.cfg_purge = parseInt(purge);
    var threshold = document.getElementById('cfg_threshold').value;
    localStorage.cfg_threshold = parseInt(threshold);
    var select = document.getElementById('cfg_state_key');
    localStorage.cfg_state_key = select.options[select.selectedIndex].value;

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

    document.getElementById('cfg_purge').value = localStorage.cfg_purge;
    document.getElementById('cfg_threshold').value = localStorage.cfg_threshold;
    var el = document.getElementById('cfg_state_key');
    for (var i=0; i < el.options.length; i++) {
        if (el.options[i].value == localStorage.cfg_state_key) {
            el.selectedIndex = i;
            break;
        }
    }

    var channels = JSON.parse(localStorage.cfg_profiles);
    var rows = [];
    var options = [];
    for (i = 0; i < channels.length; i++) {
        var columns = [];
        columns.push($('<td/>').append(channels[i].name));
        columns.push($('<td/>').append(channels[i].url));
        columns.push($('<td/>').append(channels[i].token));
        columns.push($('<td/>').append(channels[i].key));
        var btn = $('<button/>', {
            class: 'btn btn-xs btn-danger remove-node',
            text: '-',
            id: channels[i].id
        });
        columns.push($('<td/>').append(btn));
        var row = $('<tr/>').append(columns);
        rows.push(row);

        var option = $('<option/>', {
            value: channels[i].name,
            text: channels[i].name,
            id: channels[i].id
        });
        options.push(option);
    }
    $("tbody#profiles").empty().append(rows);
    $('.remove-node').click(function(item) {
        for (i = 0; i < channels.length; i++) {
            if (channels[i].id !== parseInt(this.id)) {
                localStorage.cfg_active_profile = channels[i].name;
                continue;
            }
            channels.splice(i, 1);
            localStorage.cfg_profiles = JSON.stringify(channels);
            location.reload();
        }
    });
    $('#cfg_profiles').empty().append(options);

    var el = document.getElementById('cfg_profiles');
    for (var i=0; i < el.options.length; i++) {
        if (el.options[i].value == localStorage.cfg_active_profile) {
            el.selectedIndex = i;
            break;
        }
    }
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
$(function () {
    $('[data-toggle="tooltip"]').tooltip();
});
document.querySelector('#add_profile').addEventListener('click', add_node);

