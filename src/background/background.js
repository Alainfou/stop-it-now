// Background script
//  - handles countdown for the active tab and sends the warning message
//  - handles reset of the countdown
//  - handles extension's user settings

let mapOfProcrastinationTimes = {};
const isForbiddenRegex = /(\.com)|(\.org)/;
const MAX_TIME = 2;

function handleTabMessage(msg) {
    console.log('Listening');
    const tabUrl = msg.resetForUrl;
    if (tabUrl && /.*mozilla.*/.test(tabUrl)) {
        console.log('Found tab');
        console.log(tabUrl);
    }
    // Reset the procrastination time allowed
    if (mapOfProcrastinationTimes[tabUrl] < 1) {
        mapOfProcrastinationTimes[tabUrl] = MAX_TIME;
    }
}

browser.runtime.onMessage.addListener(handleTabMessage);

async function countDown(tab) {
    console.log('Counting down');
    // tab.url requires the `tabs` permission (or a matching host permission)
    let tabUrl = tab.url.concat("/"); // (make sure tabUrl ends with a slash)
    tabUrl = tabUrl.substring(tabUrl.indexOf("://") + 3);
    // remove anything that is after the first found slash
    tabUrl = tabUrl.substring(0, tabUrl.indexOf("/"));
    // if there is a subdomain, remove it
    if (tabUrl.split(".").length > 2) {
        tabUrl = tabUrl.substring(tabUrl.indexOf(".") + 1);
    }

    // Do not handle corner cases (switch back and forth between tabs, tab displayed on screen but not focused, etc.)

    if (tabUrl && isForbiddenRegex.test(tabUrl)) {
        if (mapOfProcrastinationTimes[tabUrl]) {
            mapOfProcrastinationTimes[tabUrl] = mapOfProcrastinationTimes[tabUrl] - 1;
        } else {
            mapOfProcrastinationTimes[tabUrl] = MAX_TIME;
        }
        // If the amount of allowed procrastination time left reaches zero... measures shall be taken!
        if (mapOfProcrastinationTimes[tabUrl] === 0) {
            let tabId = tab.id;
            // await browser.tabs.insertCSS(tabId, { code: 'body { border: 5px solid red };' });
            //        await browser.sessions.setTabValue(tabId, "border-css", 'body { border: 5px solid red };');
            browser.tabs.sendMessage(tabId, { "overtime": true });
            mapOfProcrastinationTimes[tabUrl] = -1; // so that the above test will not reset it to MAX_TIME and loops again here
        }
    }
    console.log(mapOfProcrastinationTimes);
}

function onError(error) {
    console.log(`[Stop me now] Tab query error: ${error}`);
}

function getCurrentTab() {
    return browser.tabs.query({ active: true });
}

// Get the active tab:
// Did not use ` browser.tabs.query({ active: true, currentWindow: true, url: "*://*.mozilla.org/*" }); `
// because of the url problem (we'd like to filter on several domains at the same time...)
function callOnActiveTab(callback) {
    getCurrentTab().then((tabs) => {
        for (var tab of tabs) {
            if (tab.active) {
                callback(tab);
            }
        }
    });
}

// Check every minute which tab is active and act accordingly 60000
setInterval(callOnActiveTab, 6000, countDown);

/**
 * The borderify CSS.
 */
const borderCSS = 'body { border: 5px solid red };';

/*
 * Borderifies the current tab, and, using setTabValue, stores the fact
 * that this tab was borderified.
 */
async function borderify() {
    let tabArray = await browser.tabs.query({ currentWindow: true, active: true });
    let tabId = tabArray[0].id;
    await browser.tabs.insertCSS(tabId, { code: borderCSS });
    await browser.sessions.setTabValue(tabId, "border-css", borderCSS);
}

/*
 * When new tabs are created, we want to check, using getTabValue, whether
 * the tab has the borderified state. That would mean it was borderified, then
 * closed, then reopened, so we want to reapply the borderify CSS.
 *
 * But we can't insertCSS in onCreated, it's too early. So instead we make 
 * an onUpdated listener, just for this tab. In onUpdated we check the tab ID,
 * and if this is our tab, insert the CSS and remove the listener.
 */
browser.tabs.onCreated.addListener((tab) => {

    async function borderifyRestored(targetTabId, thisTabId) {
        if (targetTabId === thisTabId) {
            let stored = await browser.sessions.getTabValue(targetTabId, "border-css");
            if (stored) {
                let result = await browser.tabs.insertCSS(targetTabId, { code: stored });
            }
            browser.tabs.onUpdated.removeListener(thisBorderifyRestored);
        }
    }

    let thisBorderifyRestored = borderifyRestored.bind(null, tab.id);
    browser.tabs.onUpdated.addListener(thisBorderifyRestored);
});
