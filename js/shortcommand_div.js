class ShortcommandDiv {
  constructor() {
      this.div = null;
      console.log("ShortcommandDiv.js laddat");
  }

  createDiv() {
      if (this.div) {
          this.removeDiv();
          this.div = null;
      }
  }

  setTextInDiv(text) {     
    console.log("HEJSAN");
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

  // 🛑 Lyssna på när webbsidan tappar fokus (kan vara adressfältet)


}

// 🛠 Lyssna på meddelanden från background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📩 Meddelande mottaget:", message);

  if (message.action === "show_message" ) {
    
      let shortcommandDiv = new ShortcommandDiv();
      let shortcommand = "";

      switch (message.text) {
          case "CTRL + W":
              shortcommand = "CTRL + W";
              break;

          case "CTRL + TAB":
              shortcommand = "CTRL + TAB";
              break;

          case "CTRL + T":
              shortcommand = "CTRL + T";
              break;

          case "CTRL + R":
              shortcommand = "CTRL + R";
              break;

          case "ALT + ← / ALT + →":
              shortcommand = "ALT + ← / ALT + →";
              break;
          default:
              console.warn("🤷 Okänt meddelande:", message.text);
              return;
      }

      shortcommandDiv.setTextInDiv(shortcommand);
  }
});




window.addEventListener("blur", () => {
  let shortcommandDiv = new ShortcommandDiv();
  let shortcommand = "";
  console.log("🔍 Användaren tryckte förmodligen på adressfältet.");
  shortcommand = "CTRL + L";
  shortcommandDiv.setTextInDiv(shortcommand);
});









window.ShortcommandDiv = ShortcommandDiv;
