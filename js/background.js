let flagForWebbsiteForAlt = false; // Flytta utanför och gör den global
let flagForWebbsiteForCTRLR = false; // Flytta utanför och gör den global
/**
 * Lyssnar på när en ny flik skapas och omdirigerar till Google OCH skriver ut CTRL + T
 */
const tabsToRedirect = new Set(); // Håller koll på flikar som eventuellt ska omdirigeras

chrome.tabs.onCreated.addListener((tab) => {
    // this.isCtrlTVisible = false;
    // this.isCtrlWVisible = false;
    flagForWebbsiteForCTRLR = false;

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
                    // this.isCtrlTVisible = true;

                    // chrome.tabs.sendMessage(tabId, {
                    //     action: "show_message",
                    //     text: "CTRL + T"
                    // }, () => {
                    //     if (chrome.runtime.lastError) {
                    //         // console.warn("⚠️ Kunde inte skicka meddelande. Content-script kanske inte är laddat?");
                    //     }
                    // });

                    // Ta bort event listenern för att undvika att det körs flera gånger
                    chrome.tabs.onUpdated.removeListener(listener);
                }
            });

            tabsToRedirect.delete(tabId); // Ta bort fliken från listan efter omdirigering
        }
    }
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
        console.log("ctrlRPressed");
        ctrlRPressed = true;
    }
    if (message.action === 'alt_arrow_pressed') {
        altArrowPressed = true;
    }
});

let previousUrls = {}; // Sparar senaste URL per flik

// Håller koll på historiken för varje flik
let tabHistory = {};

// Lyssna på flikuppdateringar
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        
        // Om fliken inte har någon historik, skapa en ny array för den
        if (!tabHistory[tabId]) {
            tabHistory[tabId] = [];
        }

        // Hämta historik för just denna flik
        let history = tabHistory[tabId];

            // Om den nya URL:en är samma som den senaste, ignorera
            if (history.length > 0 && history[history.length - 1] === tab.url) {

                console.log("🔄 Sidan laddades om! Möjligtvis via CTRL + R");
                if(!ctrlRPressed){
            chrome.tabs.sendMessage(tabId, {
                action: "show_message",
                text: "CTRL + R"
            }, () => {
                if (chrome.runtime.lastError) {}
            });
            return; 
                } else {  
                    ctrlRPressed = false;
                    return; 
                }
            }
            console.log(history.length); 
            console.log(history[history.length - 2]);
            console.log(tab.url);
        // Kolla om den nya URL:en är samma som den näst senaste i historiken
        if (history.length >= 2 && history[history.length - 2] === tab.url) {
            console.log("⬅️➡️ Navigering via ALT + ← / ALT + → detekterad!");
            if(!altArrowPressed){  
                chrome.tabs.sendMessage(tabId, {
                action: "show_message",
                text: "ALT + ← / ALT + →"
            }, () => {
                if (chrome.runtime.lastError) {}
            });}
         
        }

        // Om den nya URL:en är samma som den senaste, betyder det att sidan laddades om (CTRL + R)
      
        // Uppdatera historiken för fliken
        history.push(tab.url);

        // Begränsa historiken till de senaste 10 URL:erna för att spara minne
        if (history.length > 10) {
            history.shift();
        }
    }
});

// Ta bort flikens historik när fliken stängs
chrome.tabs.onRemoved.addListener((tabId) => {
    delete tabHistory[tabId];
});


// chrome.runtime.onMessage.addListener((message, sender) => {
//     if (message.action === "mouse_moved") {
//         this.x = message.x;
//         this.y = message.y;
//     }
   
// });


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



/**
 * Lyssna efter att användaren bokmärker en sida 
 */

let ctrlDPressed = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ctrl_d_pressed') {
        ctrlDPressed = true;
    }
});

let ctrlLPressed = false;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'ctrl_l_pressed') {
        // console.log("ctrlLPressed");
        ctrlLPressed = true;
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
            // console.log("Det är en sökning");
            
            // Det är en sökning
        } else {
            // console.log("sDet är en direkt navigering till en webbplats");
            // Det är en direkt navigering till en webbplats
            flagForWebbsiteForCTRLR = true;
            flagForWebbsiteForAlt = true;
        }
      }
    }
);


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
                //  console.log(`Senaste tangenttryck sparad: ${value}`);
                resolve();
            }
        });
    });
}






//**
//DATABASHANDLER
//  */








// Funktion för att hämta gui_actions och keyboard_shortcuts från Chrome Storage och returnera som JSON
function fetchStoredDataAsJson() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['gui_actions', 'keyboard_shortcuts', 'id'], function (result) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError));
                return;
            }

            const guiActions = result.gui_actions || {};
            const keyboardShortcuts = result.keyboard_shortcuts || {};
            const userId = result.id || {};

            const data = {
                gui_actions: guiActions,
                keyboard_shortcuts: keyboardShortcuts,
                id: userId
            };

            const isEmpty = Object.keys(guiActions).length === 0 && Object.keys(keyboardShortcuts).length === 0 && Object.keys(result.id).length === 0;

            resolve({ data, isEmpty });
        });
    });
}

// Funktion för att skicka data till PHP-filen

function sendDataToServer(data) {
    // console.log("Skickar data:", JSON.stringify(data));

    fetch('./database.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
       

        // Konvertera JSON-svaret
        return response.json().then(result => ({ result }));
    })
    .then(({ result }) => {
        // console.log("Server response:", result);
        // Skicka en ping till frontend beroende på status
        if (result.status === "success") {
            // console.log("✅ Insättning lyckades! Pingar frontend...");
            
            removeLocalData(data);
            // Exempel: skicka event till en popup eller UI
        } else {
             console.log(" Insättning misslyckades! Pingar frontend...");
        }
    })
    .catch(error => console.error('Fetch error:', error));
}


function removeLocalData(sentData) {
    chrome.storage.local.get(['gui_actions', 'keyboard_shortcuts'], function (result) {
        if (chrome.runtime.lastError) {
            console.error("❌ Fel vid hämtning av Chrome Storage:", chrome.runtime.lastError);
            return;
        }

        let currentGuiActions = result.gui_actions || {};
        let currentKeyboardShortcuts = result.keyboard_shortcuts || {};

        // Skapa en ny version av datan där vi tar bort endast den skickade datan
        Object.keys(sentData.gui_actions).forEach(key => {
            if (currentGuiActions[key] !== undefined) {
                currentGuiActions[key] -= sentData.gui_actions[key]; // Minska räkningen
                if (currentGuiActions[key] <= 0) delete currentGuiActions[key]; // Ta bort om 0
            }
        });

        Object.keys(sentData.keyboard_shortcuts).forEach(key => {
            if (currentKeyboardShortcuts[key] !== undefined) {
                currentKeyboardShortcuts[key] -= sentData.keyboard_shortcuts[key]; // Minska räkningen
                if (currentKeyboardShortcuts[key] <= 0) delete currentKeyboardShortcuts[key]; // Ta bort om 0
            }
        });

        // Uppdatera Chrome Storage med den kvarvarande datan
        chrome.storage.local.set({
            gui_actions: currentGuiActions,
            keyboard_shortcuts: currentKeyboardShortcuts
        }, function () {
            if (chrome.runtime.lastError) {
                console.error("❌ Fel vid uppdatering av Chrome Storage:", chrome.runtime.lastError);
            } else {
                // console.log("✅ Lokal data uppdaterad, endast nya poster finns kvar.");
            }
        });
    });
}


// Funktion för att logga data som JSON och skicka till servern om det inte är tomt
function logAndSendStoredData() {
    fetchStoredDataAsJson().then(result => {
        if (!result.isEmpty) {
            // console.log("Hämtade data som JSON:", JSON.stringify(result.data, null, 2));
            sendDataToServer(result.data);
        } else {
            // console.log("Ingen data att logga.");
        }
    }).catch(error => {
        console.error("Fel vid hämtning av data:", error);
    });
}

// Anropa logAndSendStoredData var 10:e sekund
// Kör logAndSendStoredData endast om det finns något att skicka
setInterval(() => {
    fetchStoredDataAsJson().then(result => {
        if (!result.isEmpty) {
            logAndSendStoredData();
        } else {
            console.log("⏳ Väntar, ingen ny data att skicka.");
        }
    });
}, 20000); // Kör var 100 sekunder
// Exempel: Anropa funktionen direkt vid start
 logAndSendStoredData();

  
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
 * 
 * alt knapparna visas inte 
 * 
 * Dessa kommer kunna mätas utan problem med säkerhet 
 * CTRL + R:
 * CTRL + S:
 * CTRL + D:
 * CTRL + P:
 * CTRL + C:
 * CTRL + V :
 * CTRL + X:
 * Markeing av ord :
 * 
 * Dessa kommer kunna mätas med keyboard shortcuts men inte via GUI
 * CTRL + F:
 * CTRL + Z
 * CTRL + Y
 * CTRL + A
 * CTRL + +
 * CTRL + -
 * CTRL + 0
 * CTRL + L
 * CTRL + shift i
 * 
 * 
 * 
 * 
 *vad behöver fortsätta att kolals på
*
* om insättningarna i databasen stämmer som det ska 
* ctrl shift i - behöver nog tas bort 
* ifall man kan kontrollera ifall

UNDER TESTNING: 
ALT PILARNA 
 */
  




//shortcut för dubbelklick loggas inte
