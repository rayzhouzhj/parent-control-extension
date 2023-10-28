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

                resolve({ blockStatus: false });
            }
            // if ('BlockControl' in result) {
            //     // Retrieve the existing data
            //     const existingData = result.BlockControl;
            //     const domain = new URL(url).hostname;
            //     // Check if the new entry already exists
            //     const entryIndex = existingData.findIndex(entry => entry.domain === domain);
            //     if (entryIndex !== -1) {
            //         const entry = existingData[entryIndex];
            //         if (entry.blockBy === 'domain' 
            //             || (entry.blockBy === 'url' && url.indexOf(entry.url) > -1)) {
            //             resolve(Object.assign(entry, {blockStatus: true}));
            //         } else {
            //             resolve({ blockStatus: false });
            //         }
            //     } else {
            //         resolve({ blockStatus: false });
            //     }
            // }
        });
    });
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message.action === 'getBlockStatus') {
        const result = await shouldBlockPage(message.url);
        if (result.blockStatus) {
            // Send a message to the popup script
            chrome.runtime.sendMessage({ action: 'sendBlockStatus', domain: result.domain, blockBy: result.blockBy, blockStatus: true });
        } else {
            chrome.runtime.sendMessage({ action: 'sendBlockStatus', domain: result.domain, blockBy: 'domain', blockStatus: false });
        }
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

// chrome.webNavigation.onCommitted.addListener((details) => {
//     // Check if the page is blocked based on your condition
//     const data = shouldBlockPage(details.url);

//     if (data.blockStatus) {
//         // Inject content script into the blocked page
//         // chrome.scripting.executeScript({
//         //     target: { tabId: details.tabId },
//         //     files: ["redirect.js"]
//         // });
//         console.log('This website is blocked');
//     } else {
//         console.log('This website is not blocked');
//     }
// });

// chrome.webRequest.onBeforeRequest.addListener(
//     function (details) {
//         chrome.storage.local.get(["BlockControl"]).then((result) => {
//             console.log('BlockControl' in result);
//             if ('BlockControl' in result) {
//                 // Retrieve the existing data
//                 const existingData = result.BlockControl;
//                 console.log("Value currently is " + existingData);
//                 chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//                     const url = tabs[0].url;
//                     const hostname = new URL(url).hostname;
//                     // Check if the new entry already exists
//                     const entryIndex = existingData.findIndex(entry => entry.domain === hostname);
//                     if (entryIndex !== -1) {
//                         console.log('This website is blocked');
//                     } else {
//                         console.log('This website is not blocked');
//                     }
//                 });
//             }
//         });
//     },
//     { urls: ["<all_urls>"] },
//     ["blocking"]
// );

// chrome.storage.local.get(["BlockControl"]).then((result) => {
//     console.log('BlockControl' in result);
//     if ('BlockControl' in result) {
//         // Retrieve the existing data
//         const existingData = result.BlockControl;
//         console.log("Value currently is " + existingData);
//         chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//             const url = tabs[0].url;
//             const hostname = new URL(url).hostname;
//             // Check if the new entry already exists
//             const entryIndex = existingData.findIndex(entry => entry.domain === hostname);
//             if (entryIndex !== -1) {
//                 chrome.webRequest.onBeforeRequest.addListener(
//                     function (details) {
//                         console.log('This website is blocked');
//                         // for (var i = 0; i < blocked.length; i++) {
//                         //     if (details.url.indexOf(blocked[i]) > -1) {
//                         //         return { cancel: true };
//                         //     }
//                         // }

//                     },
//                     { urls: ["<all_urls>"] },
//                     ["blocking"]
//                 );
//             } else {
//                 console.log('This website is not blocked');
//             }
//         });
//     }
// });

// chrome.storage.local.get(['BlockControl'], function (local) {
//     var blocked = local.blocked || [];
//     var enabled = local.enabled;

//     if (!enabled) return;

//     chrome.webRequest.onBeforeRequest.addListener(
//         function (details) {
//             for (var i = 0; i < blocked.length; i++) {
//                 if (details.url.indexOf(blocked[i]) > -1) {
//                     return { cancel: true };
//                 }
//             }
//         },
//         { urls: ["<all_urls>"] },
//         ["blocking"]
//     );
// });