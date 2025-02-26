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
    this.setupCutListener();
    this.divContainer = null; 
    this.isPromptVisible = false; // Flytta initialiseringen hit
    this.isCtrlShiftPressed = false;
    this.setUpListnersForTabAndW();
    this.testSomeListners(); 
    document.addEventListener("DOMContentLoaded", () => {
      this.createDivContainer(); // Skapa container efter att DOM är redo
      this.setupSelectAllListener();
      this.setupEventListenersForShortcuts();
      
    }
   );   
  }
  testSomeListners = () => {

  //   document.addEventListener("keydown", (event) => {
  //     if (event.ctrlKey) {

  //       switch (event.key.toLowerCase()) {
  //         case "f":
  //           console.log("ctrl +f "); //funkar 
  //           break;CTR
  //         case "z":
  //           console.log("ctrl + z"); //funkar 
  //           break;
  //         case "y":
  //           console.log("ctrl + y"); //funkar 
  //           break;
  //         case "a":
  //           console.log("ctrl + a"); //funkar 
  //           break;
  //         case "+":
  //           console.log("ctrl + +"); //funkar 
  //           break;
  //         case "-":
  //           console.log("ctrl - -"); //funkar 
  //           break;
  //         case "0":
  //           console.log("ctrl + 0"); //funkar 
  //           break;
  //       }
  //     }

    
  // });
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
    let lastClickTime = 0;
    let clickCount = 0;

    document.addEventListener("mousedown", (event) => {
        const now = Date.now();
        
        if (now - lastClickTime < 400) {
            clickCount++; // Räkna antal klick inom kort tid
        } else {
            clickCount = 1; // Om det gått för lång tid, börja om räkningen
        }
        
        lastClickTime = now;
    });

    document.addEventListener("selectionchange", () => {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            if (!this.isPromptVisible) {
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;

                const selectedText = selection.toString().trim();
                if (selectedText.length === 0) return; // Ingen text markerad

                // 🛑 Om det är dubbelklick eller trippelklick, gör ingenting
                if (clickCount >= 2) {
                    console.log("🔇 Ignorerar dubbel/trippelklick");
                    return;
                }

                let message = "";

                if (selectedText.split(" ").length === 1) {
                    // 🟢 Ett enda ord har markerats genom att dra
                    message = "Double-click to select a word.";
                } else {
                    // 🟢 Flera ord eller en hel rad har markerats genom att dra
                    message = "Triple-click for one line.";
                }

                this.isPromptVisible = true;
                console.log("📝 Meddelande:", message);
                this.sendToStorage(message);
                this.controlIfToPromt(message);

                setTimeout(() => {
                    this.isPromptVisible = false;
                }, 5000);
            }
        }, 300);
    });
}


  /**
   * Kontrollerar ifall inspectorn öppnas, baseras på om fönstret ändras i storlek
   */
  detectDevTools() {
    const checkDevTools = () => {

        if (this.isCtrlShiftPressed) {
            this.isCtrlShiftPressed = false;
            // Om flaggan är satt (dvs. användaren tryckte CTRL + SHIFT + I), gör ingenting
            return;
        }

        if (this.firstRun) {
            this.firstRun = false;
            return;
        }

        const devToolsNowOpen = window.outerWidth - window.innerWidth > 200;

        if (devToolsNowOpen && !this.devToolsOpen) {
            this.devToolsOpen = true;
            this.controlIfToPromt(this.platformCommand + " + SHIFT + I");
            this.sendToStorage("CTRL/CMD + SHIFT + I");
        } else if (!devToolsNowOpen && this.devToolsOpen) {
            this.devToolsOpen = false;
            this.controlIfToPromt(this.platformCommand + " + SHIFT + I");
            this.sendToStorage("CTRL/CMD + SHIFT + I");
        }
    };

    /**
     * Kollar ifall DevTools är öppna var 2:e sekund
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
        this.controlIfToPromt(shortcommand);
        this.sendToStorage(shortcommandForJson);
      }

      else {
        this.isCtrlPPressed = false
      }
    }
  );

    /**
     *Kontrollerar ifall något trycker på adressfältet, fungerar inte som det ska 
     *Använder timeout för att förhindra att denna promtar vid andra tillfällen, flaggan måste hinna registreras
     */

  //   window.addEventListener("blur", () => {
  //     document.addEventListener("mousemove", function(event) {
  //       this.X_axis = event.clientX;
  //       this.Y_axis = event.clientY;

  //       chrome.runtime.sendMessage({
  //         action: 'mouse_moved',
  //         x: this.X_axis,
  //         y: this.Y_axis
  //       }
  //     );
  //   }
  // );

  //     setTimeout(() => {

  //       if (this.Y_axis<=10 || !this.Y_axis) {
  //               if (!this.isCtrlDPressed && !this.ctrlLNotShow && !this.isCtrlLPressed) { 

  //               let shortcommandForJson ="CTRL/CMD + L";
  //               let shortcommand = "CTRL + L";
  //               this.controlIfToPromt(shortcommand);
  //               this.sendToStorage(shortcommandForJson);
  //               }
  //               else {
  //                 this.isCtrlDPressed = false;
  //                 this.ctrlLNotShow = false;
  //                 this.isCtrlLPressed = false;
  //               }
  //             }
  //             else return;
  //     }, 200);
  //   }
  //  );
  }

/**
 * Lyssnar efter ifall någon kopierar text från en sida
 */
  setupCopyListener() {
    document.addEventListener("copy", (event) => {

      if(!this.isCtrlCPressed){
          this.shortcommandForJson = "CTRL/CMD + C";
          this.controlIfToPromt(`${this.platformCommand} + C`);
          this.sendToStorage(this.shortcommandForJson);
      }
      else {
        this.isCtrlCPressed = false;
      }
     }
   );
  }
  

  /**
   * Lyssnar efter ifall någon klistrar in text på en sida
   */
  setupPasteListener() {
    document.addEventListener("paste", (event) => {

      if(!this.isCtrlVPressed){
        this.shortcommandForJson = "CTRL/CMD + V";
      this.controlIfToPromt(`${this.platformCommand} + V`);
      this.sendToStorage(this.shortcommandForJson);
      }
       else {
        this.isCtrlVPressed = false;
       }
     }
   );
  } 





  /**
   * Eventlyssnare för om någon cuttar något från textinmatning inte adressfältet dock
   */

  setupCutListener() {
    document.addEventListener("cut", (event) => {
        if (!this.isCtrlXPressed) {
            this.shortcommandForJson = "CTRL/CMD + X";
            this.controlIfToPromt(`${this.platformCommand} + X`);
            this.sendToStorage(this.shortcommandForJson);
        } else {
            this.isCtrlXPressed = false;
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
          console.log(message.text);

          switch (message.text) {
            // case "CTRL + W":
            //   shortcommand = `${this.platformCommand} + W`;
            //   shortcommandForJson = "CTRL/CMD + W";
            //   break;

            // case "CTRL + TAB":
            //   this.ctrlLNotShow = true; 
            //   shortcommand = `${this.platformCommand} + TAB`;
            //   shortcommandForJson = "CTRL/CMD + TAB";
            //   break;

            // case "CTRL + T":
            //   shortcommand = `${this.platformCommand} + T`;
            //   shortcommandForJson = "CTRL/CMD + T";
            //   break;

            case "CTRL + R":
              shortcommand = `${this.platformCommand} + R`;
              shortcommandForJson = "CTRL/CMD + R";
              break;

            case "ALT + ← / ALT + →":
              shortcommand = "ALT + ← / ALT + →"; 
              shortcommandForJson = "ALT + ← / ALT + →";
              break;

            case "CTRL + D":
              this.isCtrlDPressed = true;
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

      
                this.controlIfToPromt(shortcommand);
  // Visa kortkommandot
        
          // Skicka data till storage.js för att spara det i chrome.storage.local
          this.sendToStorage(shortcommandForJson);

      }
    });
  }

  setUpListnersForTabAndW(){
    document.addEventListener("keydown", (event) => {
      // let isMac = this.platformCommand === "CMD";
      // let ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey; // ⌘ för Mac, Ctrl för Windows/Linux
      // console.log("Key pressed: " + event.key);
        chrome.runtime.sendMessage({
          action: 'latest_key_pressed',
          message: event.key
        });
      // console.log("CTRL/CMD + key pressed");  
      
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
        //   console.log("CTRL/CMD + key pressed");
        //   chrome.runtime.sendMessage({
        //     action: 'ctrl_pressed'
        // });          
            // console.log(event.key);
            switch (event.key.toLowerCase()) {

                // case "tab":
                //     shortcommandForJson = "Shortcut: CTRL/CMD + TAB"; //funkar inte
                //     break;
                // case "w":
                //     shortcommandForJson = "Shortcut: CTRL/CMD + W";//funkar inte
                //     break;
                // case "t":
                //     shortcommandForJson = "Shortcut: CTRL/CMD + T";//funkar inte 
                //     console.log("tjenare")
                //     break;
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
                    this.isCtrlDPressed = true;
                    break;
                case "p":
                    shortcommandForJson = "Shortcut: CTRL/CMD + P";//funkar
                    this.isCtrlPPressed = true;
                    break;
            
                case "c":
                    shortcommandForJson = "Shortcut: CTRL/CMD + C";//funkar
                    this.isCtrlCPressed = true;
                    break;
                case "v":
                    shortcommandForJson = "Shortcut: CTRL/CMD + V";//funkar 
                    this.isCtrlVPressed = true;
                    break;

                case "x":
                    shortcommandForJson = "Shortcut: CTRL/CMD + X";//funkar
                    this.isCtrlXPressed = true;
                    break;

                /**
                 * nya kortkommandon som inte mäts via gui
                 */

                case "f":
                    shortcommandForJson = "Shortcut: CTRL/CMD + F";//funkar
                    break;
                case "z":
                    shortcommandForJson = "Shortcut: CTRL/CMD + Z";//funkar
                    break;
                case "y":
                    shortcommandForJson = "Shortcut: CTRL/CMD + Y";//funkar
                    break;
                case "a":
                    shortcommandForJson = "Shortcut: CTRL/CMD + A";//funkar
                    break;
                case "+":
                    shortcommandForJson = "Shortcut: CTRL/CMD + +";//funkar
                    break;
                case "-":
                    shortcommandForJson = "Shortcut: CTRL/CMD + -";//funkar
                    break;
                case "0":
                    shortcommandForJson = "Shortcut: CTRL/CMD + 0";//funkar
                    break;
                case "l":
                    shortcommandForJson = "Shortcut: CTRL/CMD + L";//funkar
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

       

        if (ctrlOrCmd && event.shiftKey && event.key.toLowerCase() === "i") {
          this.isCtrlShiftPressed = true; // Sätt flaggan
          shortcommandForJson = "Shortcut: CTRL/CMD + SHIFT + I"; //funkar

          // Återställ flaggan efter 1 sekund så att DevTools kan detekteras igen senare
          // setTimeout(() => {
          //     this.isCtrlShiftPressed = false;
          //     console.log("Återställer flaggan till false");
          // }, 3000);
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

controlIfToPromt(text) {
  chrome.storage.local.get("isPromptsVisible", (data) => {
    if (data.isPromptsVisible) {
        this.setTextInDiv(text)    
    } 
  })
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
