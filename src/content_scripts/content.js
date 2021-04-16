// Content script
//  - run per tab
//  - receives the message from background (once countdown reaches zero) and displays warning accordingly
//  - removes warning and reset countdown via a message to the background script

const YODA_IMAGE_ID = 'yoda_warning_id'

// Create the "YODA" image:
let yoda = document.createElement('img');
// ID of the element (to remove it afterwards)
yoda.id = YODA_IMAGE_ID;
// Image attributes
yoda.alt = 'Yoda tells you wisely that "back to work, you should get".';
yoda.height = 730;
yoda.width = 770;
// Get the image from extension's resources:
// yoda.src = '../res/yoda_stop_it_now_big.png';
yoda.src = 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Retrato_del_Maestro_Yoda.jpg';
// Center the image with CSS:
yoda.style = 'display: block; margin-left: auto; margin-right: auto; top: 0;';

function removeYoda() {
    let yodaElement = document.getElementById(YODA_IMAGE_ID);
    yodaElement.parentNode.removeChild(yodaElement);
    browser.runtime.sendMessage({ resetForUrl: window.location });
}
// Register "on click -> remove"
yoda.onclick = removeYoda;

// IMAGE SOURCE & CREDITS: https://commons.wikimedia.org/wiki/File:Retrato_del_Maestro_Yoda.jpg#file


browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && 'value' in changes) {
        update(changes.value.newValue);
    }
});

function update(newValue) {
    style.innerText = `html { filter: sepia(${newValue}%) !important }`;
}

browser.storage.local.get('value').then(result => update(result.value));

// browser.runtime.sendMessage({ "url": window.location }); // sent upon tab loading (i.e. not necessarily when tab is active)

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.overtime) {
        // Append yoda image:
        document.body.appendChild(yoda);

        // Confirm popup -> send message to reset counter on click on OK
        alert('Stop it and get back to work !');

        setTimeout(removeYoda, 1550);
    } else {
        console.log('Should not happen');
    }
});
