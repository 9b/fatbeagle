$(document).ready(function() {
    document.getElementById('url').onkeypress = function(e) {
        if (!e) e = window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode == '13') {
            document.getElementById('crawl').click();
            return false;
        }
    };

   $('#crawl').click(function() {
        var url = $('#url').val();
        if (url === '' || url.split('.').length === 1) {
            return false;
        }
        chrome.runtime.sendMessage({'msg': "crawl", "url": url});
        $('#url').val('');
    });

   $('#both').click(function() {
        chrome.runtime.sendMessage({'msg': "current_crawl"});
        chrome.runtime.sendMessage({'msg': "current_extract"});
   });

   $('#crawl_current').click(function() {
        chrome.runtime.sendMessage({'msg': "current_crawl"});
   });

   $('#extract_current').click(function() {
        chrome.runtime.sendMessage({'msg': "current_extract"});
   });

   $('#options').click(function() {
        chrome.runtime.sendMessage({'msg': "options"});
   });

    chrome.extension.sendRequest({method: "config"}, function(response) {
        var select_fields = ['cfg_auto_crawl', 'cfg_auto_extract'];
        for (i = 0; i < select_fields.length; i++) {
            var radio = document.getElementsByName(select_fields[i]);
            for (var j = 0, length = radio.length; j < length; j++) {
                if (radio[j].value == response[select_fields[i]]) {
                    radio[j].checked = true;
                }
            }
        }
    });

    $('.config').click(function(e) {
        var c = $(this).attr('name');
        var msg = {'msg': "reconfig"};
        msg[c] = $(this).attr('value');
        chrome.runtime.sendMessage(msg);
    });
});
