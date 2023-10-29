/* global chrome */

// import React from "react";
// import { createRoot } from 'react-dom/client';
// import "@webcomponents/custom-elements";
// import ContentScript from "./contentScript";

// class ReactExtensionContainer extends HTMLElement {
//     connectedCallback() {
//         const mountPoint = document.createElement("div");
//         mountPoint.id = "reactExtensionPoint";

//         const shadowRoot = this.attachShadow({ mode: "open" });
//         shadowRoot.appendChild(mountPoint);

//         const root = createRoot(mountPoint);
//         root.render(<ContentScript />);
//     }
// }

// const initWebComponent = function () {
//     customElements.define("react-extension-container", ReactExtensionContainer);

//     const app = document.createElement("react-extension-container");
//     document.documentElement.appendChild(app);
// };

// initWebComponent();

console.log('Content script injected successfully');

// // Listen for the response from the background script
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     console.log('Received message:', message);
//     if (message.action === 'sendBlockStatus') {
//         if (message.blockStatus) {
//             console.log("blockStatus is true");
//             window.location.href = "https://www.google.com";
//         }
//     }
// });

// Send a message to the background script
// chrome.runtime.sendMessage({ action: 'getBlockStatus', domain: window.location.hostname, url: window.location.href });

(async () => {
    const response = await chrome.runtime.sendMessage({ action: 'getBlockStatus', domain: window.location.hostname, url: window.location.href });
    // do something with response here, not outside the function
    console.log('ContentScript: receiving response from background script')
    console.log(response);
})();
