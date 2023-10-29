/* global chrome */

/**
 * 
 * @param {*} domain 
 * @returns 
 */
async function shouldBlockPage(url) {
    return await new Promise((resolve, reject) => {
        chrome.storage.local.get(["BlockControl"]).then((result) => {
            const { BlockControl } = result;
            if (BlockControl) {
                const existingData = BlockControl;
                const domain = new URL(url).hostname;
                const entryIndex = existingData.findIndex(entry => entry.domain === domain);

                if (entryIndex === -1) {
                    resolve({ blockStatus: false });
                    return;
                }

                const entry = existingData[entryIndex];
                if (entry.blockBy === 'domain' || (entry.blockBy === 'url' && url.includes(entry.url))) {
                    resolve(Object.assign(entry, { blockStatus: true }));
                    return;
                }
            }

            resolve({ blockStatus: false });
        });
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(sender.tab ?
        "from a content script: " + sender.tab.url :
        "from the extension");
    console.log(message);

    if (message.action === 'GetBlockStatus') {
        shouldBlockPage(message.url).then((result) => {
            var response = {};
            if (result.blockStatus) {
                response = { action: message.responseType, domain: message.domain, blockBy: result.blockBy, blockStatus: true };
            } else {
                response = { action: message.responseType, domain: message.domain, blockBy: 'domain', blockStatus: false };
            }

            if (sender.tab) {
                // Send a message to the content script
                sendResponse(response);
            } else {
                // Send a message to the popup script
                chrome.runtime.sendMessage(response);
            }
        }).catch((error) => {
            console.error('Error in shouldBlockPage:', error);
            sendResponse({ error: 'An error occurred' });
        });

        // Return true to indicate that sendResponse will be used asynchronously
        return true;
    }
});

chrome.runtime.onMessage.addListener(
    function (message, sender, sendResponse) {
        if (message.type === "BlockControl") {
            let newData = message.data;
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