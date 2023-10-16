/* global chrome */

chrome.storage.local.get(['blocked', 'enabled'], function (local) {
    var blocked = local.blocked || [];
    var enabled = local.enabled;

    if (!enabled) return;

    chrome.webRequest.onBeforeRequest.addListener(
        function (details) {
            for (var i = 0; i < blocked.length; i++) {
                if (details.url.indexOf(blocked[i]) > -1) {
                    return { cancel: true };
                }
            }
        },
        { urls: ["<all_urls>"] },
        ["blocking"]
    );
});