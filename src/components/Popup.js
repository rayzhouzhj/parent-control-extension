/* global chrome */

import React, { useState, useEffect } from 'react';

const Popup = () => {
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        chrome.storage.local.get('enabled', data => {
            setIsEnabled(data.enabled);
        });
    }, []);

    const toggleEnabled = () => {
        const newValue = !isEnabled;
        chrome.storage.local.set({ enabled: newValue }, () => {
            setIsEnabled(newValue);
        });
    };

    return (
        <div>
            <h1>Parent Control Extension</h1>
            <button onClick={toggleEnabled}>
                {isEnabled ? 'Disable' : 'Enable'}
            </button>
        </div>
    );
};

export default Popup;