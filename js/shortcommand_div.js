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
    // this.detectIfdimensionIsOpen(); 
    document.addEventListener("DOMContentLoaded", () => {
      this.createDivContainer(); // Skapa container efter att DOM är redo
      this.setupSelectAllListener();
      this.setupEventListenersForShortcuts();
      
    }
   );   
  }

  
  createDivContainer() {
    if (!this.divContainer) {
      this.divContainer = document.createElement("div");
      this.divContainer.id = "shortcommandDivContainer";
      this.divContainer.classList.add("move-up");
      document.body.appendChild(this.divContainer);
      document.addEventListener("mousemove", (event) => {
        // console.log("mouse moved");
        if (!event.y || !event.x) {return}

        else {
        //     this.divContainer.style.left = `${event.pageX + 10}px`;
        //  this.divContainer.style.top = `${event.pageY + 10}px`;
        }
       
      });
    }
  }

  /**
   * Sätter text i div elementet och gör det synligt
   */

setTextInDiv(text) {
  const newDiv = document.createElement("div");
  newDiv.className = "shortcommandDiv";
  newDiv.classList.add("move-up");
  newDiv.textContent = text;

 
  // Lägg till den nya div:en i containern
  this.divContainer.appendChild(newDiv);

  // Ta bort div:en efter 5 sekunder
  setTimeout(() => {
    newDiv.style.opacity = "0"; 
    setTimeout(() => {
      newDiv.remove(); 
    }, 500); 
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

  /**
   * Lyssnar efter ifall någon markerar text på sidan
   */

  setupSelectAllListener() {
    let timeoutId = null;
    let lastClickTime = 0;
    let clickCount = 0;

    document.addEventListener("mousedown", (event) => {
        const now = Date.now();
        
        if (now - lastClickTime < 400) {
            clickCount++; 
        } else {
            clickCount = 1; 
        }
        
        lastClickTime = now;
    });

    /**
     * Eventlyssnare för om det är en dubbelklick eller trippelklick eller om texten är markerad genom att dra, kollar om det är mer än 1 ord som är markerat
     */
    document.addEventListener("selectionchange", () => {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
          let message = "";

            if (!this.isPromptVisible) {
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;

                const selectedText = selection.toString().trim();
                if (selectedText.length === 0) return; 

                if (clickCount == 2) {
                    message = "Shortcut: Dubbelklick"
                    this.sendToStorageForKeyboard(message);
                    return; 
                }
                else if (clickCount >= 3) {
                    message = "Shortcut: Trippelklick";
                    this.sendToStorageForKeyboard(message);
                    return;
                }


                if (selectedText.split(" ").length === 1) {
                    message = "Dubbelklicka för ett ord.";
                } else {
                    message = "Trippelklicka för en paragraf.";
                }

                this.isPromptVisible = true;
                this.sendToStorage(message);
                this.controlIfToPromt(message);

                setTimeout(() => {
                    this.isPromptVisible = false;
                }, 2000);
            }
        }, 300);
    });
}


/**
 * Funktion för att logga ifall använder går in i responsivitets läge 
 */
// detectIfdimensionIsOpen(){
//   var checkFlag = true;
//   window.addEventListener("resize", () => {

//     if(navigator.userAgent.includes("Windows") && window.addEventListener("mousemove", (event) => {})){
//       console.log("retuerning");
//       return; 
//     }
//     else {

//       if (!checkFlag) {
//         return;
//       }
//       checkFlag = false;

//       console.log("prompting");
//       this.shortcommandForJson = "CTRL/CMD + SHIFT + M";
//       this.controlIfToPromt(`${this.platformCommand} + SHIFT + M`);
//       this.sendToStorage(this.shortcommandForJson);
      
//     }
//     setTimeout(() => {
//       checkFlag = true;
//     }, 5000); // <-- Stängande parentes är tillagd här!
    
//   }

// );
// }
  /**
   * Kontrollerar ifall inspectorn öppnas, baseras på om fönstret ändras i storlek
   */
  detectDevTools() {
    // window.addEventListener("resize", () => {
    //   console.log("Fönsterstorlek ändrad");
    //     console.log(this.isCtrlShiftPressed); 
    //     console.log(navigator.userAgentData);
    //     console.log(navigator.userAgent);
    //     if (this.isCtrlShiftPressed) {
    //         this.isCtrlShiftPressed = false;
    //         console.log("Återställer flaggan till false", this.isCtrlShiftPressed);
    //         return;
    //     }

    //     if (this.firstRun) {
    //         this.firstRun = false;
    //         return;
    //     }

    //     const devToolsNowOpen = window.outerWidth - window.innerWidth > 200;
        
    //     // console.log(this.isDevToolsOpen);
    //     if (devToolsNowOpen && !this.isCtrlShiftPressed) {
    //       console.log("DevTools öppnade");
    //         // this.devToolsOpen = true;
    //         this.controlIfToPromt(this.platformCommand + " + SHIFT + I");
    //         this.sendToStorage("CTRL/CMD + SHIFT + I");
    //     } 
    //     else if (!devToolsNowOpen && !this.isCtrlShiftPressed) {
    //       console.log("DevTools stängda");
    //         // this.devToolsOpen = false;
    //         this.controlIfToPromt(this.platformCommand + " + SHIFT + II");
    //         this.sendToStorage("CTRL/CMD + SHIFT + I");
    //     }
    // });
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
          let shortcommand = "";
          let shortcommandForJson = "";
        

          switch (message.text) {
     
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
            this.sendToStorage(shortcommandForJson);

      }
    });
  }


  // setUpListnersForTabAndW(){
  //   document.addEventListener("keydown", (event) => {
  //     // let isMac = this.platformCommand === "CMD";
  //     // let ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey; // ⌘ för Mac, Ctrl för Windows/Linux
  //     // console.log("Key pressed: " + event.key);
  //       chrome.runtime.sendMessage({
  //         action: 'latest_key_pressed',
  //         message: event.key
  //       });
  //     // console.log("CTRL/CMD + key pressed");  
      
  //   });
  // }


  /**
   * Funktion för att lyssna efter kortkommandon från tangentbordet, använder keydown, lyssnar efter ctrl och sen matchar det med en annan tangent 
   */
  setupEventListenersForShortcuts() {
    let keysPressed = {}; 

    document.addEventListener("keydown", (event) => {
        keysPressed[event.key] = true;
        let isMac = this.platformCommand === "CMD";
        let ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey; 
        let shortcommandForJson = "";

        // Hantera vanliga Ctrl/Cmd-kortkommandon (utan Shift)
        if (ctrlOrCmd && !event.shiftKey) {
      
            switch (event.key.toLowerCase()) {

                case "r":
                  console.log("r pressed");
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

/**
 * Funktion som kontrollerar ifall en prompt ska visas eller inte, kollar en boolean i chrome storage
 */
controlIfToPromt(text) {

  chrome.storage.local.get("isPromptsVisible", (data) => {
    if (data.isPromptsVisible) {

          this.createDivContainer();
          this.setTextInDiv(text)    
    } 
  })
}

// Skickar GUI data till background.js
  sendToStorage(shortcommandForJson) {
     chrome.runtime.sendMessage({
      action: "save_action_for_GUI",
      shortcut: shortcommandForJson
    }, function(response) {
    });
  }

//skickar keyboardshortdata till background.js
  sendToStorageForKeyboard(shortcommandForJson) {
     chrome.runtime.sendMessage({
      action: "save_shortcut_from_keyboard",
      shortcut: shortcommandForJson
    }, function(response) {
    });
  }
}

window.ShortcommandDiv = ShortcommandDiv;
