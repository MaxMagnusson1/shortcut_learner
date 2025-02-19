



/**
 * Lyssnar på när en ny flik skapas och omdirigerar till Google OCH skriver ut CTRL + T
 */
chrome.tabs.onCreated.addListener((tab) => {
        this.isCtrlTVisible = false;
        this.isCtrlWVisible = false;
        this.flagForWebbsiteForCTRLR = false;
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
                this.isCtrlTVisible = true;
                console.log("CTRL + T");
                // Skicka meddelandet först när Google har laddats klart
                chrome.tabs.sendMessage(tab.id, {
                    action: "show_message",
                    text: "CTRL + T"
                }, () => {
                    if (chrome.runtime.lastError) {
                        // console.warn("⚠️ Kunde inte skicka meddelande. Content-script kanske inte är laddat?");
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

        console.log("CTRL + TAB");  
        // Skicka meddelande till den aktiva fliken (för flikbyte)
        if(!this.isCtrlWVisible){
            chrome.tabs.sendMessage(tab.id, {
            action: "show_message",
            text: "CTRL + TAB"
        }, () => {
            if (chrome.runtime.lastError) {
                // console.warn("⚠️ Inga mottagare för meddelandet. Content-script kanske inte är laddat?");
            }
        });
        }
        this.isCtrlWVisible = false;
        


    });
});

/**
 * Kod för lyssna efter om användaren laddar om sidan CTRL R
 * Lyssnar efter om det uppdateras, när statusen är complete och om det är samma tab url så skrivs ctrl r ut. 
 * Om url inte är samma skrivs alt + ← / alt + → ut men kan även triggas när man byter flik
 */
// Spara tidigare URL för varje flik

let ctrlRPressed = false;
let altArrowPressed = false;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ctrl_r_pressed') {
        ctrlRPressed = true;
    }
    if (message.action === 'alt_arrow_pressed') {
        altArrowPressed = true;
    }
});

let previousUrls = {};

// Lyssna på när en flik laddas om
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {

        // Kolla om URL:en är densamma som innan
        if (previousUrls[tabId] === tab.url) {
            console.log("🔄 Sidan laddades om. Skickar meddelande...");
            // Skicka meddelandet till content-script
            if (!ctrlRPressed) {

            if(!this.flagForWebbsiteForCTRLR){
                 chrome.tabs.sendMessage(tabId, {
                action: "show_message",
                text: "CTRL + R"
            }, () => {
                if (chrome.runtime.lastError) {
                    // console.warn("⚠️ Kunde inte skicka meddelande. Content-script kanske inte är laddat?");
                }
            });
            }}
            else {
                ctrlRPressed = false;
            }
            this.flagForWebbsiteForCTRLR = false;
                 
        }

        else {

            if (!altArrowPressed) {
                
            setTimeout(() => {
                if(!this.isCtrlTVisible && !this.flagForWebbsiteForAlt){
                chrome.tabs.sendMessage(tabId, {
                action: "show_message",
                text: "ALT + ← / ALT + →"
            }, () => {
                if (chrome.runtime.lastError) {
                    // console.warn("⚠️ Kunde inte skicka meddelande. Content-script kanske inte är laddat?");
                }
            });
                }
                this.isCtrlTVisible = false;
                this.flagForWebbsiteForAlt = false;
            }, 1);

        } else {
            altArrowPressed = false
            
        }
               
            
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
                console.log("CTRL + W");
                this.isCtrlWVisible = true;
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "show_message",
                    text: "CTRL + W"
                }, () => {
                    if (chrome.runtime.lastError) {
                        // console.warn("⚠️ Kunde inte skicka meddelande. Content-script kanske inte är laddat?");
                    }
                });
            }
        });
    }
});


/**
 * Lyssna efter att användaren bokmärker en sida 
 */

let ctrlDPressed = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ctrl_d_pressed') {
        ctrlDPressed = true;
    }
});

chrome.bookmarks.onCreated.addListener((id, bookmark) => {

    if (!ctrlDPressed) {
    chrome.tabs.sendMessage(activeTabId, {
        action: "show_message",
        text: "CTRL + D"
    }, () => {
        if (chrome.runtime.lastError) {
            // console.warn("⚠️ Kunde inte skicka meddelande. Content-script kanske inte är laddat?");
        }
    });
} else {
    ctrlDPressed = false;
}
});
  

/**
 * Hanterar när användaren laddar ner något och skriver ut CTRL + S
 */
let ctrlSPressed = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ctrl_s_pressed') {
        ctrlSPressed = true;
    }
});

chrome.downloads.onCreated.addListener((downloadItem) => {
    if (!ctrlSPressed) {
        chrome.tabs.sendMessage(activeTabId, {
            action: "show_message",
            text: "CTRL + S"
        }, () => {
            if (chrome.runtime.lastError) {
                // console.warn("⚠️ Kunde inte skicka meddelande. Content-script kanske inte är laddat?");
            }
        });
    } else {
        ctrlSPressed = false; 
    }
});


/**
 * Lyssnar efter om användaren söker eller navigerar till en webbplats
 */
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        const url = new URL(changeInfo.url);

        // Kontrollera om det är en sökning eller en direkt navigering
        if ((url.hostname.includes("google.com") && url.pathname.includes("/search")) ||
            (url.hostname.includes("bing.com") && url.pathname.includes("/search")) ||
            (url.hostname.includes("duckduckgo.com") && url.pathname.includes("/")) ||
            (url.hostname.includes("yahoo.com") && url.pathname.includes("/search"))) {
            
            // Det är en sökning
            console.log("🔍 Användaren gjorde en sökning:", url.searchParams.get("q"));
        } else {
            // Det är en direkt navigering till en webbplats
            console.log("🌍 Användaren navigerade till en webbsida:", url.href);
            this.flagForWebbsiteForCTRLR = true;
            this.flagForWebbsiteForAlt = true;
        }
    }
});


// Lyssnar på meddelanden för GUI-användning
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "save_action_for_GUI") {
        saveShortcutToStorage(message.shortcut, "gui_actions");
        sendResponse({ status: "GUI action saved!" });
    } else {
        sendResponse({ status: "Shortcut not saved!" });
    }
    return true; // Låter Chrome vänta på asynkron lagring
});

// Lyssnar på meddelanden för tangentbordsgenvägar
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "save_shortcut_from_keyboard") {
        saveShortcutToStorage(message.shortcut, "keyboard_shortcuts");
        sendResponse({ status: "Keyboard shortcut saved!" });
    }
    return true; // Låter Chrome vänta på asynkron lagring
});

// Funktion för att spara kortkommandon med en separat nyckel beroende på typ (GUI eller tangentbord)
function saveShortcutToStorage(shortcut, storageKey) {
    if (!shortcut) {
        console.warn("⚠️ Försökte spara ett tomt kortkommando. Ignorerar.");
        return;
    }

    chrome.storage.local.get([storageKey], function (result) {
        if (chrome.runtime.lastError) {
            console.error("❌ Fel vid hämtning av Chrome Storage:", chrome.runtime.lastError);
            return;
        }

        let shortcuts = result[storageKey] || {}; // Hämta rätt lagringsnyckel

        // Öka räknaren för kortkommandot
        shortcuts[shortcut] = (shortcuts[shortcut] || 0) + 1;

        // Spara tillbaka uppdaterad data
        chrome.storage.local.set({ [storageKey]: shortcuts }, function () {
            if (chrome.runtime.lastError) {
                console.error("❌ Fel vid sparande till Chrome Storage:", chrome.runtime.lastError);
            } else {
                console.log(`✅ ${storageKey.toUpperCase()} - '${shortcut}' har nu använts ${shortcuts[shortcut]} gånger.`);
            }
        });
    });
}














  
/** 

 * ifall muskordinater inte är undefined ska inte alt ← / alt → skrivas ut
 * CTRL R skrivs ut 4 gånger typ
 * Hur ska man hantera ifall användaren går till newtab
 * Se till så man inte blir promtar ifall man använder kortkommando
 * ctrl w, ctrl t och ctrl tab fungerar inte
 * om man bokmärker en ny sida skrivs ctrl d och l ut samtidigt, dessa reggar även både gui och keyboard
 * ifall man bokmärker något som redan är bokmärkt skrivs ctrl l ut
 * markering av text saknar funktionalitet
 * inspectorn har ignet atm för kortkommandon vs gui
 *  
 */
  





