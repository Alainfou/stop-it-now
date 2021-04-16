/**
 * CSS to hide everything on the page,
 * except for elements that have the "stop-me" class.
 */
//const hidePage = `body > :not(.stop-me) {
//                    display: none;
//                  }`;

const DEFAULT_TIME = 10;
const MIN_TIME = 2;
const MAX_TIME = 60;
const DEFAULT_SITES = '9gag, facebook, twitter, reddit, whatsapp, instagram, youtube, linkedin';

let timeInput = document.getElementById('timeinput');
let sitesInput = document.getElementById('sitesinput');

timeInput.addEventListener('change', e => setTimeValue(e.target.value));
sitesInput.addEventListener('change', e => setSitesValue(e.target.value));

async function setTimeValue(time) {
    await browser.storage.local.set({ time });
}

async function setSitesValue(sites) {
    await browser.storage.local.set({ sites });
}

async function init() {
    // Handle time
    const handleTime = (timeValue) => {
        if (!timeValue || timeValue < MIN_TIME || timeValue > MAX_TIME) {
            timeValue = DEFAULT_TIME;
        }
        timeInput.value = timeValue;
        setTimeValue(timeValue);
        console.log('Stored time', timeValue);
    };

    // Handle websites
    const handleSites = (sitesValue) => {
        if (!sitesValue || sitesValue == '') {
            sitesValue = DEFAULT_SITES;
        }
        sitesInput.innerHTML = sitesValue;
        setSitesValue(sitesValue);
        console.log('Stored sites', sitesValue);
    };

    // Get values from storage if any, and update popup accordingly
    browser.storage.local.get('time')
        .then(handleTime)
        .catch(err => handleTime(DEFAULT_TIME));

    browser.storage.local.get('sites')
        .then(handleSites)
        .catch(err => handleSites(DEFAULT_SITES));

    console.log('Stored.');
}

init().catch(e => console.error(e));

///**
// * Listen for clicks on the buttons, and send the appropriate message to
// * the content script in the page.
// */
//function listenForClicks() {
//    document.addEventListener("click", (e) => {

//        /**
//         * Given the name of a beast, get the URL to the corresponding image.
//         */
//        function beastNameToURL(beastName) {
//            switch (beastName) {
//                case "Frog":
//                    return browser.extension.getURL("beasts/frog.jpg");
//                case "Snake":
//                    return browser.extension.getURL("beasts/snake.jpg");
//                case "Turtle":
//                    return browser.extension.getURL("beasts/turtle.jpg");
//            }
//        }

//        /**
//         * Insert the page-hiding CSS into the active tab,
//         * then get the beast URL and
//         * send a "beastify" message to the content script in the active tab.
//         */
//        function beastify(tabs) {
//            browser.tabs.insertCSS({ code: hidePage }).then(() => {
//                let url = beastNameToURL(e.target.textContent);
//                browser.tabs.sendMessage(tabs[0].id, {
//                    command: "beastify",
//                    beastURL: url
//                });
//            });
//        }

//        /**
//         * Remove the page-hiding CSS from the active tab,
//         * send a "reset" message to the content script in the active tab.
//         */
//        function reset(tabs) {
//            browser.tabs.removeCSS({ code: hidePage }).then(() => {
//                browser.tabs.sendMessage(tabs[0].id, {
//                    command: "reset",
//                });
//            });
//        }

//        /**
//         * Just log the error to the console.
//         */
//        function reportError(error) {
//            console.error(`Could not beastify: ${error}`);
//        }

//        /**
//         * Get the active tab,
//         * then call "beastify()" or "reset()" as appropriate.
//         */
//        if (e.target.classList.contains("beast")) {
//            browser.tabs.query({ active: true, currentWindow: true })
//                .then(beastify)
//                .catch(reportError);
//        }
//        else if (e.target.classList.contains("reset")) {
//            browser.tabs.query({ active: true, currentWindow: true })
//                .then(reset)
//                .catch(reportError);
//        }
//    });
//}

///**
// * There was an error executing the script.
// * Display the popup's error message, and hide the normal UI.
// */
//function reportExecuteScriptError(error) {
//    document.querySelector("#popup-content").classList.add("hidden");
//    document.querySelector("#error-content").classList.remove("hidden");
//    console.error(`Failed to execute beastify content script: ${error.message}`);
//}

///**
// * When the popup loads, inject a content script into the active tab,
// * and add a click handler.
// * If we couldn't inject the script, handle the error.
// */
//browser.tabs.executeScript({ file: "/src/content.js" })
//    .then(listenForClicks)
//    .catch(reportExecuteScriptError);
