/* global chrome */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getBlockStatus') {
        chrome.storage.local.get(["BlockControl"]).then((result) => {
            console.log('BlockControl' in result);
            if ('BlockControl' in result) {
                // Retrieve the existing data
                const existingData = result.BlockControl;
                console.log("Value currently is " + existingData);
                // Check if the new entry already exists
                const entryIndex = existingData.findIndex(entry => entry.domain === message.domain);
                if (entryIndex !== -1) {
                    // Send a message to the popup script
                    const blockBy = existingData[entryIndex].blockBy;
                    chrome.runtime.sendMessage({ action: 'sendBlockStatus', domain: message.domain, blockBy: blockBy, blockStatus: true });
                } else {
                    chrome.runtime.sendMessage({ action: 'sendBlockStatus', domain: message.domain, blockBy: 'domain', blockStatus: false });
                }
            }
        });
    }
});

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.type === "BlockControl") {
            let newData = request.data;
            chrome.storage.local.get(["BlockControl"]).then((result) => {
                console.log('BlockControl' in result);
                if ('BlockControl' in result) {
                    // Retrieve the existing data
                    const existingData = result.BlockControl;
                    var updatedData = [...existingData];
                    // Check if the new entry already exists
                    const entryIndex = existingData.findIndex(entry => entry.domain === newData.domain);

                    if (entryIndex !== -1) {
                        if (newData.action === 'block') {
                            // Entry already exists, update the existing entry
                            updatedData[entryIndex] = newData;
                        } else {
                            // Entry already exists, remove the entry
                            updatedData.splice(entryIndex, 1);
                        }
                    } else {
                        // Entry does not exist, add the new entry
                        updatedData.push(newData);
                    }

                    // Update the local storage with the modified array
                    chrome.storage.local.set({ 'BlockControl': updatedData }, function () {
                        // Data has been updated successfully
                        console.log('Data has been updated successfully');
                    });
                } else {
                    if (newData.action === 'block') {
                        // No existing data, create a new array with the new entry
                        const newArray = [newData];

                        // Update the local storage with the new array
                        chrome.storage.local.set({ 'BlockControl': newArray }, function () {
                            // Data has been added successfully
                            console.log('Data has been updated successfully');
                        });
                    }
                }
            });
        }
    }
);

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