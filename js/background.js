console.log("Background script laddat");



/**
 * Lyssnar på när en ny flik skapas och omdirigerar till Google OCH skriver ut CTRL + T
 */
chrome.tabs.onCreated.addListener((tab) => {

    // Om det är en ny tom flik (`chrome://newtab/`), omdirigera till Google
    /**
     * Kontrollerar ifall tab.url är tom eller om det är en ny flik, om det är sant så omdirigerar den till google
     * chrome eventet onUpdated som lyssnar på när google har laddats klart och och gör sedan en kontroll och skriver ut CTRL + t
     */
    if (!tab.url || tab.url.startsWith("chrome://newtab")) {
        console.warn("🚫 Upptäckte en tom flik, omdirigerar till Google...");
        chrome.tabs.update(tab.id, { url: "https://www.google.com" });

        // Lyssna på när Google-sidan har laddats klart
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, updatedTab) {

            // Kontrollera om URL är korrekt
            if (tabId === tab.id && changeInfo.status === "complete" && updatedTab.url && updatedTab.url.includes("https://www.google.com")) {

                // Skicka meddelandet först när Google har laddats klart
                chrome.tabs.sendMessage(tab.id, {
                    action: "show_message",
                    text: "CTRL + T"
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn("⚠️ Kunde inte skicka meddelande. Content-script kanske inte är laddat?");
                    }
                });

                // Ta bort event listenern så att vi inte skickar meddelandet flera gånger
                chrome.tabs.onUpdated.removeListener(listener);
            }
        });

        return; // Avsluta här så att vi inte fortsätter med injektionen
    }
});

/** 
 * Lyssnar på när användaren byter flik (navigerar till en ny URL) och skriver ut CTRL + TAB
 */
// Lyssnar på när användaren byter aktiv flik (byter mellan existerande flikar)
chrome.tabs.onActivated.addListener((activeInfo) => {

    // Hämta information om den aktiva fliken
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (chrome.runtime.lastError) {
            console.warn("⚠️ Kunde inte hämta flikinformation.");
            return;
        }


        // Skicka meddelande till den aktiva fliken (för flikbyte)
        chrome.tabs.sendMessage(tab.id, {
            action: "show_message",
            text: "CTRL + TAB"
        }, () => {
            if (chrome.runtime.lastError) {

                console.warn("⚠️ Inga mottagare för meddelandet. Content-script kanske inte är laddat?");
            }
        });
    });
});

/**
 * Kod för lyssna efter om användaren laddar om sidan CTRL R
 * Lyssnar efter om det uppdateras, när statusen är complete och om det är samma tab url så skrivs ctrl r ut. 
 * Om url inte är samma skrivs alt + ← / alt + → ut men kan även triggas när man byter flik
 */
// Spara tidigare URL för varje flik
let previousUrls = {};

// Lyssna på när en flik laddas om
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {

        // Kolla om URL:en är densamma som innan
        if (previousUrls[tabId] === tab.url) {

            // Skicka meddelandet till content-script
            chrome.tabs.sendMessage(tabId, {
                action: "show_message",
                text: "CTRL + R"
            }, () => {
                if (chrome.runtime.lastError) {
                    console.warn("⚠️ Kunde inte skicka meddelande. Content-script kanske inte är laddat?");
                }
            });
        }

        else {
            chrome.tabs.sendMessage(tabId, {
                action: "show_message",
                text: "ALT + ← / ALT + →"
            }, () => {
                if (chrome.runtime.lastError) {
                    console.warn("⚠️ Kunde inte skicka meddelande. Content-script kanske inte är laddat?");
                }
            });
        }

        // Uppdatera den sparade URL:en för denna flik
        previousUrls[tabId] = tab.url;
    }
});

// Lyssna på när användaren byter flik och uppdatera URL:en
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url) {
            previousUrls[activeInfo.tabId] = tab.url;
        }
    });
});


// Spara den aktuella aktiva fliken
let activeTabId = null;

// Uppdatera aktiv flik när användaren byter flik
chrome.tabs.onActivated.addListener((activeInfo) => {
    activeTabId = activeInfo.tabId;
});

/** 
 * Lyssnar på när en flik stängs och skriver ut CTRL + W  
 * Finns event som lysnar på ifall tabs är borttagna, kontrollerar ifall det är tabben man är på  
 */
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {

    // Om den stängda fliken var den aktiva, visa "CTRL + W"
    if (tabId === activeTabId) {

        // Hitta en annan öppen flik att skicka meddelandet till
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "show_message",
                    text: "CTRL + W"
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.warn("⚠️ Kunde inte skicka meddelande. Content-script kanske inte är laddat?");
                    }
                });
            }
        });
    }
});


/**
 * Lyssnar efter att användaren öppnar inspectorn
 */









