/* global chrome */

// import logo from "./logo.svg";
// import "./Popup.css";

export const getCurrentTabUId = (callback) => {
    const queryInfo = { active: true, currentWindow: true };

    chrome.tabs &&
        chrome.tabs.query(queryInfo, (tabs) => {
            callback(tabs[0].id);
        });
};

function Popup() {
    const sendMessage = () => {
        getCurrentTabUId((id) => {
            id &&
                chrome.tabs.sendMessage(id, {
                    value: "openPopup",
                });
            window.close();
        });
    };

    return (
        <div className="App">
            <header className="App-header">
                <button onClick={sendMessage}>Open popup</button>
            </header>
        </div>
    );
}

export default Popup;