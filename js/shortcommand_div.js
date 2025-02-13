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
    document.addEventListener("selectionchange", () => {
      if (!this.isPromptVisible) {
        const selectedText = this.normalizeText(window.getSelection().toString());
        // Kontrollera om all text på sidan är markerad
        if (selectedText.length > 0) {
          this.isPromptVisible = true;
          this.setTextInDiv(`${this.platformCommand} + A: For all text, trippel click for 1 row, for 1 word double click`);

          setTimeout(() => {
            this.isPromptVisible = false;
          }, 5000);
        }
      }
    });
  }
    // Funktion för att normalisera text
   normalizeText(text) {

    return text
        .replace(/\s+/g, " ") // Ersätt flera mellanrum med ett enda
        .trim(); // Ta bort ledande och efterföljande mellanrum
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
      let shortcommand = "CTRL + L";
      this.setTextInDiv(shortcommand);
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
        console.log("Pasting"); 
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
