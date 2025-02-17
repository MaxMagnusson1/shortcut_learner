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

                console.log("Markerad text:", selectedText); // Debugging

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
      } else if (!devToolsNowOpen && this.devToolsOpen) {
        this.devToolsOpen = false;
        this.setTextInDiv(this.platformCommand + " + SHIFT + I");
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
      let shortcommand = "CTRL + P";
      this.setTextInDiv(shortcommand);
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
          let shortcommand = "CTRL + L";
          this.setTextInDiv(shortcommand);
        }
        else return;
     
    });
  }

/**
 * Lyssnar efter ifall någon kopierar text från en sida
 */
  setupCopyListener() {
    document.addEventListener("copy", (event) => {
      this.setTextInDiv(`${this.platformCommand} + C`);
    });
  }

  /**
   * Lyssnar efter ifall någon klistrar in text på en sida
   */
  setupPasteListener() {
    document.addEventListener("paste", (event) => {
      this.setTextInDiv(`${this.platformCommand} + V`);
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

          // Dynamisk hantering av kortkommandon
          switch (message.text) {
            case "CTRL + W":
              shortcommand = `${this.platformCommand} + W`;
              break;

            case "CTRL + TAB":
              shortcommand = `${this.platformCommand} + TAB`;
              break;

            case "CTRL + T":
              shortcommand = `${this.platformCommand} + T`;
              break;

            case "CTRL + R":
              shortcommand = `${this.platformCommand} + R`;
              break;

            case "ALT + ← / ALT + →":
              shortcommand = "ALT + ← / ALT + →"; // ALT ändras inte beroende på plattform
              break;

            case "CTRL + D":
              shortcommand = `${this.platformCommand} + D`;
              break;

            case "CTRL + S":
              shortcommand = `${this.platformCommand} + S`;
              break;
            default:
              console.warn("🤷 Okänt meddelande:", message.text);
              return;
          }

          // Visa kortkommandot
          this.setTextInDiv(shortcommand);
        
      }
    });
  }
}

window.ShortcommandDiv = ShortcommandDiv;
