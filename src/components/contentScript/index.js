/* global chrome */

console.log('Content script injected successfully');

(async () => {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'GetBlockStatus',
            domain: window.location.hostname,
            url: window.location.href,
            responseType: 'ContentGetBlockStatusResp'
        });
        console.log('ContentScript: receiving response from background script');
        console.log(response);
        if(response.blockStatus) {
            window.location.href = 'https://www.google.com';
            // window.location.href = chrome.runtime.getURL('blocked.html');
        }
        // do something with the response here
    } catch (error) {
        console.error('ContentScript: error while sending message to background script', error);
    }
})();
