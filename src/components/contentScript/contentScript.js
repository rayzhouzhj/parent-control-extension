/* global chrome */

import { useState, useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";

function ContentScript() {
    // const { modal, overlay } = useStyles();
    const [open, setOpen] = useState(false);

    const [message, setMessage] = useState(false);
    const sendMessage = () => {
        chrome.runtime.sendMessage({
            value: "hello from content script",
        });
    };

    // // Send a message to the background script
    // chrome.runtime.sendMessage({ action: 'getBlockStatus', domain: window.location.hostname, url: window.location.href });

    // // Listen for the response from the background script
    // chrome.runtime.onMessage.addListener((message) => {
    //     console.log('Received message:', message);
    //     if (message.action === 'sendBlockStatus' && message.domain === window.location.hostname) {
    //         if (message.blockStatus) {
    //             console.log("blockStatus is true");
    //             window.location.href = "https://www.google.com";
    //         }
    //     }
    // });

    useEffect(() => {
        console.log('Content mounted');

        // Send a message to the background script
        // chrome.runtime.sendMessage({ action: 'getBlockStatus', domain: window.location.hostname, url: window.location.href });

        // // Listen for the response from the background script
        // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        //     console.log('Received message:', message);
        //     if (message.action === 'sendBlockStatus' && message.domain === window.location.hostname) {
        //         if (message.blockStatus) {
        //             console.log("blockStatus is true");
        //             window.location.href = "https://www.google.com";
        //         }
        //     }
        // });
    });

    chrome.runtime.onMessage.addListener((message) => {
        setMessage(message.value);
        console.log("receiving message from background script")
        console.log(message.value);
        if (message.value === "openPopup") {
            setOpen(true);
        }
    });

    if (!open) return null;

    return (
        <div/>
    );
}

export default ContentScript;