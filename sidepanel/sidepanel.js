// Listen for messages from the content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.webmUrls) {
        createSidePanel(request.webmUrls); 
    }
});

function createSidePanel(webmUrls) {
    // Create the side panel elements (adjust styling as needed)
    const sidePanel = document.createElement('div');
    const webmList = document.createElement('ul');
    const downloadAllButton = document.createElement('button');
    downloadAllButton.textContent = "Download All";

    // Add each webm to the list with download functionality
    webmUrls.forEach(url => {
        const listItem = document.createElement('li');
        listItem.textContent = url;

        listItem.addEventListener('click', () => {
            chrome.downloads.download({
                url: url,
                filename: "downloaded_webm.webm" // Customize filename if desired
            });
        });
        webmList.appendChild(listItem);
    });

    // Add the download all functionality
    downloadAllButton.addEventListener('click', () => {
        webmUrls.forEach(url => {
            chrome.downloads.download({
                url: url,
                filename: "downloaded_webm.webm"
            });
        });
    });

    // Assemble and display the side panel
    sidePanel.appendChild(webmList);
    sidePanel.appendChild(downloadAllButton);
    document.body.appendChild(sidePanel); 
}
