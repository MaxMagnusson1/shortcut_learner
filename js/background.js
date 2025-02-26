
/**
 * Lyssnar på när en ny flik skapas och omdirigerar till Google OCH skriver ut CTRL + T
 */
const tabsToRedirect = new Set(); // Håller koll på flikar som eventuellt ska omdirigeras

chrome.tabs.onCreated.addListener((tab) => {
    this.isCtrlTVisible = false;
    this.isCtrlWVisible = false;
    this.flagForWebbsiteForCTRLR = false;

    // Om det är en ny tom flik (chrome://newtab), markera den för eventuell omdirigering
    if (!tab.url || tab.url.startsWith("chrome://newtab")) {
        // console.warn("🚫 Upptäckte en ny tom flik, markerar den för eventuell omdirigering...");
        tabsToRedirect.add(tab.id);
    }
});

// Lyssna på när en flik uppdateras (URL ändras eller laddas klart)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tabsToRedirect.has(tabId)) {
        if (changeInfo.url && !changeInfo.url.startsWith("chrome://newtab")) {
            // Om fliken går till en RIKTIG webbsida, ta bort den från listan
            console.warn(`✅ Fliken (${tabId}) laddar en annan sida: ${changeInfo.url}, ingen omdirigering behövs.`);
            tabsToRedirect.delete(tabId);
        } else if (changeInfo.status === "complete" && (!tab.url || tab.url.startsWith("chrome://newtab"))) {
            // Om fliken fortfarande är "chrome://newtab/" efter att den har laddats klart → omdirigera till Google
            // console.warn(`➡️ Fliken (${tabId}) är fortfarande tom, omdirigerar till Google...`);
            chrome.tabs.update(tabId, { url: "https://www.google.com" });

            // När Google laddas klart, visa "CTRL + T"
            chrome.tabs.onUpdated.addListener(function listener(updatedTabId, updatedChangeInfo, updatedTab) {
                if (updatedTabId === tabId && updatedChangeInfo.status === "complete" && updatedTab.url.includes("https://www.google.com")) {
                    this.isCtrlTVisible = true;

                    chrome.tabs.sendMessage(tabId, {
                        action: "show_message",
                        text: "CTRL + T"
                    }, () => {
                        if (chrome.runtime.lastError) {
                            // console.warn("⚠️ Kunde inte skicka meddelande. Content-script kanske inte är laddat?");
                        }
                    });

                    // Ta bort event listenern för att undvika att det körs flera gånger
                    chrome.tabs.onUpdated.removeListener(listener);
                }
            });

            tabsToRedirect.delete(tabId); // Ta bort fliken från listan efter omdirigering
        }
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
        if(!this.isCtrlWVisible){
            console.log(ctrl_pressed);
            if (!ctrl_pressed){
                console.log("HEJSAN");
            chrome.tabs.sendMessage(tab.id, {
            action: "show_message",
            text: "CTRL + TAB"
        }, () => {
            if (chrome.runtime.lastError) {
                // console.warn("⚠️ Inga mottagare för meddelandet. Content-script kanske inte är laddat?");
            }
        });
            }else {
                ctrl_pressed = false;
            }
       
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

let previousUrls = {}; // Sparar senaste URL per flik


// Lyssna efter siduppdateringar
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        
        if (previousUrls[tabId] === tab.url) {
            // CTRL + R logik (om sidan laddades om)
            if (!ctrlRPressed) {
                if (!this.flagForWebbsiteForCTRLR) {
                    chrome.tabs.sendMessage(tabId, {
                        action: "show_message",
                        text: "CTRL + R"
                    }, () => {
                        if (chrome.runtime.lastError) {}
                    });
                }
            } else {
                ctrlRPressed = false;
            }
            this.flagForWebbsiteForCTRLR = false;
        } else {
         
            // Annars, om en sidnavigering skett på annat sätt (t.ex. ALT + ←)
            if(this.y >=10){
                  if (!altArrowPressed) {
                setTimeout(() => {
                    if (!this.isCtrlTVisible && !this.flagForWebbsiteForAlt) {
                        chrome.tabs.sendMessage(tabId, {
                            action: "show_message",
                            text: "ALT + ← / ALT + →"
                        }, () => {
                            if (chrome.runtime.lastError) {}
                        });
                    }
                    this.isCtrlTVisible = false;
                    this.flagForWebbsiteForAlt = false;
                }, 1);
            } else {
                altArrowPressed = false;
            }
            }
        }

        // Uppdatera sparad URL för fliken
        previousUrls[tabId] = tab.url;
    }
});

chrome.runtime.onMessage.addListener((message, sender) => {
    if (message.action === "mouse_moved") {
        this.x = message.x;
        this.y = message.y;
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

let ctrl_pressed = false;   

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    
        // Hämta senaste sparade nyckeln från storage
        chrome.storage.local.get("saved_key", (result) => {
            let lastKey = result.saved_key; // Senast lagrade tangent
            
            if (lastKey === "Tab" || lastKey === "Control") {
                ctrl_pressed = true;
                console.log("Bakgrundsskriptet mottog och validerade: CTRL + key pressed");
            } else {
                console.log("Senast sparade nyckeln är inte Tab eller Control. Ingen åtgärd.");
            }
        });
    
});



chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {

    // Om den stängda fliken var den aktiva, visa "CTRL + W"
    if (tabId === activeTabId) {

        // Hitta en annan öppen flik att skicka meddelandet till
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                this.isCtrlWVisible = true;
                
                if (!ctrl_pressed){
                     chrome.tabs.sendMessage(tabs[0].id, {
                    action: "show_message",
                    text: "CTRL + W"
                }, () => {
                    if (chrome.runtime.lastError) {
                        // console.warn("⚠️ Kunde inte skicka meddelande. Content-script kanske inte är laddat?");
                    }
                });
                } else 
                {
                    ctrl_pressed = false;
                }

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
}
);

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
    }
);


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
        } else {
            // Det är en direkt navigering till en webbplats
            this.flagForWebbsiteForCTRLR = true;
            this.flagForWebbsiteForAlt = true;
        }
      }
    }
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "latest_key_pressed") {
        // console.log("Mottog tangent:", message.message); // Fixat: Läser nu message.key istället för message.shortcut

        saveLatestPressedKey(message.message, "saved_key").then(() => {
            sendResponse({ status: "Key saved!", latestKey: message.message });
        }).catch((error) => {
            sendResponse({ status: "Error saving key!", error: error.message });
        });
    } else {
        sendResponse({ status: "Key not saved!" });
    }
    return true; // Låter Chrome vänta på asynkron lagring
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
    }
);

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
                  }
                }
            );
        }
    );
}

function saveLatestPressedKey(value, storageKey) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [storageKey]: value }, () => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
            } else {
                 console.log(`Senaste tangenttryck sparad: ${value}`);
                resolve();
            }
        });
    });
}





  
/** 

 * ifall muskordinater inte är undefined ska inte alt ← / alt → skrivas ut
 * CTRL R skrivs ut 4 gånger typ
 * Se till så man inte blir promtar ifall man använder kortkommando - funkar till mkt men två som inte fungerar
 * ctrl w,  och ctrl tab fungerar inte för den övre
 * markering av text saknar funktionalitet
 * inspectorn har ignet atm för kortkommandon vs gui
 * 
 * 
 *  CTRL W + CTRL T fungerar halvt typ när de gäller shortcutsen
 * Vet inte hur man kan föra data över att markera text 
 * stängt av det för google docs för det skapar mycket problem
 * CTRL N 
 * 
 */
  





