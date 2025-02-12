class ShortcommandDiv {
  constructor() {
    
    this.div = null;
    this.devToolsOpen = false; // Håller koll på om DevTools är öppet
    this.firstRun = true; // För att ignorera första körningen
    this.detectDevTools();
    this.detectOS();
    this.platformCommand ="CTRL/CMD";
  }

  createDiv() {
    if (this.div) {
      this.removeDiv();
      this.div = null;
    }
  }

  setTextInDiv(text) {
    if (!this.div) {
      this.div = document.createElement("div");
      this.div.id = "shortcommandDiv";
      document.body.appendChild(this.div);
    }
    this.div.textContent = text;
    this.div.style.visibility = "visible";

    this.hideDiv();
  }

  hideDiv() {
    setTimeout(() => {
      this.div.style.visibility = "hidden";
    }, 5000);
  }

  detectDevTools() {
    const checkDevTools = () => {
      if (this.firstRun) {
        this.firstRun = false; // Ignorera första körningen
        return;
      }

      const devToolsNowOpen =
        window.outerWidth - window.innerWidth > 150 || // Kontrollera bredd
        window.outerHeight - window.innerHeight > 150; // Kontrollera höjd

      if (devToolsNowOpen && !this.devToolsOpen) {
        this.devToolsOpen = true;
        this.setTextInDiv(this.platformCommand + " + SHIFT + I");
      } else if (!devToolsNowOpen && this.devToolsOpen) {
        this.devToolsOpen = false;
        this.setTextInDiv(this.platformCommand+ " + SHIFT + I");
      }
    };

    // Kör DevTools-detektering med jämna mellanrum
    setInterval(checkDevTools, 3000);
  }

  detectOS() {
    // Fråga bakgrundsskriptet om plattform
    chrome.runtime.sendMessage({ action: "get_platform_command" }, (response) => {
      if (response && response.platformCommand) {
        this.platformCommand = response.platformCommand; // Spara plattformsdetekteringen
        console.log("Plattformskommandot är: " + this.platformCommand);
      } else {
        console.warn("Kunde inte hämta plattformskommandot, använder standard: CTRL");
      }
    });
  }
}


// 🛠 Lyssna på meddelanden och hantera dynamiska kortkommandon
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "show_message") {
    const shortcommandDiv = new ShortcommandDiv();

    // Vänta på att `platformCommand` laddas innan användning
    setTimeout(() => {
      let shortcommand = "";

      // Dynamisk hantering av kortkommandon
      switch (message.text) {
        case "CTRL + W":
          shortcommand = `${shortcommandDiv.platformCommand} + W`;
          break;

        case "CTRL + TAB":
          shortcommand = `${shortcommandDiv.platformCommand} + TAB`;
          break;

        case "CTRL + T":
          shortcommand = `${shortcommandDiv.platformCommand} + T`;
          break;

        case "CTRL + R":
          shortcommand = `${shortcommandDiv.platformCommand} + R`;
          break;

        case "ALT + ← / ALT + →":
          shortcommand = "ALT + ← / ALT + →"; // ALT ändras inte beroende på plattform
          break;

        case "CTRL + D":
          shortcommand = `${shortcommandDiv.platformCommand} + D`;
          break

        case "CTRL + S": 
          shortcommand = `${shortcommandDiv.platformCommand} + S`;
          break;
        default:
          console.warn("🤷 Okänt meddelande:", message.text);
          return;
      }

      // Visa kortkommandot
      shortcommandDiv.setTextInDiv(shortcommand);
    }, 1); // Ge lite tid för `detectOS` att hämta `platformCommand`
  }
});


window.addEventListener("beforeprint", () => {
  let shortcommandDiv = new ShortcommandDiv();
  let shortcommand = "CTRL + P";
  shortcommandDiv.setTextInDiv(shortcommand);
});





window.addEventListener("blur", () => {
  let shortcommandDiv = new ShortcommandDiv();
  let shortcommand = "CTRL + L";
  shortcommandDiv.setTextInDiv(shortcommand);
});

window.ShortcommandDiv = ShortcommandDiv;
