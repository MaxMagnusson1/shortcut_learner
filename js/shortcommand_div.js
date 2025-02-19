

class ShortcommandDiv {

  /**
   * Konstruktor som tar emot operativsystemet som argument
   * Kallar på funktioner
   */
  constructor(os) {
    this.platformCommand = os;
    this.div = null;
    this.devToolsOpen = false; 
    this.firstRun = true; 
    this.detectDevTools();
    this.setupEventListeners();
    this.setupMessageListener();
    this.setupCopyListener(); 
    this.setupPasteListener(); 
    this.divContainer = null; 
    this.isPromptVisible = false; // Flytta initialiseringen hit

    document.addEventListener("DOMContentLoaded", () => {
      this.createDivContainer(); // Skapa container efter att DOM är redo
      this.setupSelectAllListener();
      this.setupEventListenersForShortcuts();
      
    });   

  
  }


  createDivContainer() {
    if (!this.divContainer) {
      this.divContainer = document.createElement("div");
      this.divContainer.id = "shortcommandDivContainer";
      document.body.appendChild(this.divContainer);
    }
  }

  /**
   * Sätter text i div elementet och gör det synligt
   */

setTextInDiv(text) {
  const newDiv = document.createElement("div");
  newDiv.className = "shortcommandDiv";
  newDiv.textContent = text;


  // Lägg till den nya div:en i containern
  this.divContainer.appendChild(newDiv);

  // Ta bort div:en efter 5 sekunder
  setTimeout(() => {
    newDiv.style.opacity = "0"; // Gör div:en osynlig
    setTimeout(() => {
      newDiv.remove(); // Ta bort div:en från DOM
    }, 500); // Vänta tills transition är klar
  }, 5000);
}

  /**
   * Gömmer elementet efter 5 sekunder
   */
  hideDiv() {
    setTimeout(() => {
      this.div.style.visibility = "hidden";
    }, 5000);
  }


  setupSelectAllListener() {
    let timeoutId = null;

    document.addEventListener("selectionchange", () => {
        // Rensa eventuell tidigare timeout för att undvika onödig körning
        clearTimeout(timeoutId);

        // Vänta 300ms innan vi hanterar markeringen för att ge användaren tid att markera färdigt
        timeoutId = setTimeout(() => {
            if (!this.isPromptVisible) {
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;

                const selectedText = selection.toString().trim();
                if (selectedText.length === 0) return; // Undvik att köra på tom markering

                let message = `${this.platformCommand} + A: For all text, triple click for 1 row, double click for 1 word`;


                if (selectedText.includes("\n")) {
                    // Om det finns en radbrytning, antar vi att en hel rad är markerad
                    message = "CTRL A for all text";
                } else if (selectedText.split(" ").length > 1) {
                    // Om det finns fler än ett ord (minst ett mellanslag)
                    message = "Double-click selects one word. Click and drag to select multiple words.";
                } else {
                    // Om endast ett ord är markerat
                    message = "Double-click to select a word.";
                }

                this.isPromptVisible = true;
                this.setTextInDiv(message);
                this.sendToStorage(message);

                setTimeout(() => {
                    this.isPromptVisible = false;
                }, 5000);
            }
        }, 300); // Väntar 300ms innan den kör logiken
    });
}

  
    
  
  /**
   * Kontrollerar ifall inspectorn öppnas, baseras på om fönstret ändras i storlek
   */
  detectDevTools() {
    const checkDevTools = () => {

         if (this.firstRun) {
        this.firstRun = false; 
        return;
      }

      const devToolsNowOpen =
        window.outerWidth - window.innerWidth > 150 || 
        window.outerHeight - window.innerHeight > 150; 

      if (devToolsNowOpen && !this.devToolsOpen) {
        this.devToolsOpen = true;
        this.setTextInDiv(this.platformCommand + " + SHIFT + I");
        this.sendToStorage("CTRL/CMD + SHIFT + I");
      } else if (!devToolsNowOpen && this.devToolsOpen) {
        this.devToolsOpen = false;
        this.setTextInDiv(this.platformCommand + " + SHIFT + I");
        this.sendToStorage("CTRL/CMD + SHIFT + I");
      }
     
    };

    /**
     * Kollar ifall devtools är öppna var 2:e sekund
     */
    setInterval(checkDevTools, 2000);
  }


  /**
   * Controllerar ifall någon är påväg ut att skriva ut något 
   */
  setupEventListeners() {
    window.addEventListener("beforeprint", () => {

      if (!this.isCtrlPPressed){
        let shortcommand = "CTRL + P";
        let shortcommandForJson = "CTRL/CMD + P";
        this.setTextInDiv(shortcommand);
        this.sendToStorage(shortcommandForJson);
      }

      else {
        this.isCtrlPPressed = false
      }
    });

    /**
     *Kontrollerar ifall något trycker på adressfältet, fungerar inte som det ska 
     */
    window.addEventListener("blur", () => {
      document.addEventListener("click", function(event) {
        this.X_axis = event.clientX;
        this.Y_axis = event.clientY;
      });

        if (!this.X_axis && !this.Y_axis) {
          let shortcommandForJson ="CTRL/CMD + L";
          let shortcommand = "CTRL + L";
          this.setTextInDiv(shortcommand);
          this.sendToStorage(shortcommandForJson);
        }
        else return;
     
    });
  }

/**
 * Lyssnar efter ifall någon kopierar text från en sida
 */
  setupCopyListener() {
    document.addEventListener("copy", (event) => {

      if(!this.isCtrlCPressed){
          this.shortcommandForJson = "CTRL/CMD + C";
          this.setTextInDiv(`${this.platformCommand} + C`);
          this.sendToStorage(this.shortcommandForJson);
      }
      else {
        this.isCtrlCPressed = false;
      }
     
    });
  }

  /**
   * Lyssnar efter ifall någon klistrar in text på en sida
   */
  setupPasteListener() {
    document.addEventListener("paste", (event) => {

      if(!this.isCtrlVPressed){
        this.shortcommandForJson = "CTRL/CMD + V";
      this.setTextInDiv(`${this.platformCommand} + V`);
      this.sendToStorage(this.shortcommandForJson);
      }
       else {
        this.isCtrlVPressed = false;
       }

    });
  }
  

/**
 * Switch case som hanterar olika meddelanden som skickas från background.js
 */

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "show_message") {
        // Vänta på att `platformCommand` laddas innan användning
          let shortcommand = "";
          let shortcommandForJson = "";
          // Dynamisk hantering av kortkommandon
          switch (message.text) {
            case "CTRL + W":
              shortcommand = `${this.platformCommand} + W`;
              
              shortcommandForJson = "CTRL/CMD + W";
              break;

            case "CTRL + TAB":
              shortcommand = `${this.platformCommand} + TAB`;
              shortcommandForJson = "CTRL/CMD + TAB";

              break;

            case "CTRL + T":
              shortcommand = `${this.platformCommand} + T`;
              shortcommandForJson = "CTRL/CMD + T";
              break;

            case "CTRL + R":
              shortcommand = `${this.platformCommand} + R`;
              shortcommandForJson = "CTRL/CMD + R";
              break;

            case "ALT + ← / ALT + →":
              shortcommand = "ALT + ← / ALT + →"; // ALT ändras inte beroende på plattform
              shortcommandForJson = "ALT + ← / ALT + →";
              break;

            case "CTRL + D":
              shortcommand = `${this.platformCommand} + D`;
              shortcommandForJson = "CTRL/CMD + D";
              break;

            case "CTRL + S":
              shortcommand = `${this.platformCommand} + S`;
              shortcommandForJson = "CTRL/CMD + S";
              break;
            default:
              console.warn("🤷 Okänt meddelande:", message.text);
              return;
          }

          // Visa kortkommandot
          this.setTextInDiv(shortcommand);
        
          // Skicka data till storage.js för att spara det i chrome.storage.local
          this.sendToStorage(shortcommandForJson);

        
      }
    });
  }

  setupEventListenersForShortcuts() {
    let keysPressed = {}; // Håller koll på vilka tangenter som är nere

    document.addEventListener("keydown", (event) => {

        // Lagra vilka tangenter som är nedtryckta
        keysPressed[event.key] = true;

        let isMac = this.platformCommand === "CMD";
        let ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey; // ⌘ för Mac, Ctrl för Windows/Linux
        let shortcommandForJson = "";

        // Hantera Ctrl + Tab manuellt

      setTimeout(() => {
        if (keysPressed["Control"] && event.key === "Tab") {
            shortcommandForJson = "Shortcut: CTRL/CMD + TAB";
        }

      }, 2000);

        

        // Hantera vanliga Ctrl/Cmd-kortkommandon (utan Shift)
        if (ctrlOrCmd && !event.shiftKey) {
            switch (event.key.toLowerCase()) {
                case "w":
                    shortcommandForJson = "Shortcut: CTRL/CMD + W";//funkar inte
                    break;
                case "t":
                    shortcommandForJson = "Shortcut: CTRL/CMD + T";//funkar inte 
                    break;
                case "r":
                    shortcommandForJson = "Shortcut: CTRL/CMD + R"; //funkar
                    chrome.runtime.sendMessage({
                      action: 'ctrl_r_pressed'
                  });
                    break;
                case "s":
                    shortcommandForJson = "Shortcut: CTRL/CMD + S";//funkar
                    chrome.runtime.sendMessage({
                      action: 'ctrl_s_pressed'
                  });
                    break;
                case "d":
                    shortcommandForJson = "Shortcut: CTRL/CMD + D";//funkar 
                    chrome.runtime.sendMessage({
                      action: 'ctrl_d_pressed'
                  });
                    break;
                case "p":
                    shortcommandForJson = "Shortcut: CTRL/CMD + P";//funkar
                    this.isCtrlPPressed = true;
                    break;
                case "l":
                    shortcommandForJson = "Shortcut: CTRL/CMD + L";//funkar 
                    break;
                case "c":
                    shortcommandForJson = "Shortcut: CTRL/CMD + C";//funkar
                    this.isCtrlCPressed = true;
                    break;
                case "v":
                    shortcommandForJson = "Shortcut: CTRL/CMD + V";//funkar 
                    this.isCtrlVPressed = true;
                    break;
            }
        }

        // Hantera Alt + Pil
        if (event.altKey) {
            switch (event.key) {
                case "ArrowLeft":
                    shortcommandForJson = "Shortcut: ALT + ←"; //funkar
                    chrome.runtime.sendMessage({
                      action: 'alt_arrow_pressed'
                  });
                    break;
                case "ArrowRight":
                    shortcommandForJson = "Shortcut: ALT + →";//funkar
                    chrome.runtime.sendMessage({
                      action: 'alt_arrow_pressed'
                  });
                    break;
            }
        }

        // Hantera Ctrl + Shift-kortkommandon
        if (ctrlOrCmd && event.shiftKey) {
            switch (event.key.toLowerCase()) {
                case "i":
                    this.ctrlShiftI = true;
                    shortcommandForJson = "Shortcut: CTRL/CMD + SHIFT + I";//funkar
                    break;
            }
        }

        // Skicka data om ett kortkommando upptäcktes
        if (shortcommandForJson) {
            this.sendToStorageForKeyboard(shortcommandForJson);
        }
    });

    // Ta bort tangenter från `keysPressed` när de släpps
    document.addEventListener("keyup", (event) => {
        delete keysPressed[event.key];
    });
}





// Starta lyssnaren



  sendToStorage(shortcommandForJson) {
     // Skicka data till storage.js för att spara det i chrome.storage.local
     chrome.runtime.sendMessage({
      action: "save_action_for_GUI",
      shortcut: shortcommandForJson
    }, function(response) {
    });
  }

  sendToStorageForKeyboard(shortcommandForJson) {
     // Skicka data till storage.js för att spara det i chrome.storage.local
     chrome.runtime.sendMessage({
      action: "save_shortcut_from_keyboard",
      shortcut: shortcommandForJson
    }, function(response) {
    });
  }
}

window.ShortcommandDiv = ShortcommandDiv;
