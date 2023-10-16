/* global chrome */

import React, { useState, useEffect } from 'react';

const Options = () => {
    const [blockedSites, setBlockedSites] = useState([]);
    const [newSite, setNewSite] = useState('');

    useEffect(() => {
        chrome.storage.local.get('blocked', data => {
            if (data.blocked) {
                setBlockedSites(data.blocked);
            }
        });
    }, []);

    const addSite = () => {
        const newBlockedSites = [...blockedSites, newSite];
        chrome.storage.local.set({ blocked: newBlockedSites }, () => {
            setBlockedSites(newBlockedSites);
            setNewSite('');
        });
    };

    const removeSite = site => {
        const newBlockedSites = blockedSites.filter(item => item !== site);
        chrome.storage.local.set({ blocked: newBlockedSites }, () => {
            setBlockedSites(newBlockedSites);
        });
    };

    return (
        <div>
            <h1>Blocked Sites</h1>
            <input
                type="text"
                value={newSite}
                onChange={e => setNewSite(e.target.value)}
            />
            <button onClick={addSite}>Add</button>
            <ul>
                {blockedSites.map(site => (
                    <li key={site}>
                        {site}
                        <button onClick={() => removeSite(site)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Options;