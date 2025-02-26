document.addEventListener("load", function () {
    // let hej = document.getElementById("hej");
    // console.log(hej);
    
    let startTime = new Date("2025-02-25T13:25:00").getTime(); // När det ska bli synligt
    let endTime = new Date("2026-02-25T11:48:00").getTime(); // När det ska bli osynligt igen
    var y= document.getElementById("hej"); 
    console.log(y);
    function checkTime() {
        let now = new Date().getTime();
        let isVisible = now >= startTime && now <= endTime; // true om inom tidsfönstret, annars false
  
        console.log("isPromptsVisible:", isVisible);
  
        // Spara värdet i chrome.storage.local
        chrome.storage.local.set({ isPromptsVisible: isVisible }, () => {
            console.log("🔄 Uppdaterade isPromptsVisible i storage:", isVisible);
        });
  
        let linkElement = document.getElementById("shortcutLink");
  
        if (isVisible) {
            if (!linkElement) {
                linkElement = document.createElement("a");
                linkElement.id = "shortcutLink";
                linkElement.textContent = "More shortcuts!";
                linkElement.href = "https://shortcutsbyshortcutlearner.netlify.app/shortcut.html";
                linkElement.target = "_blank";
                linkElement.rel = "noopener noreferrer";
                linkElement.style.color = "red";
                linkElement.style.display = "block";
  
                document.body.appendChild(linkElement);
            } else {
                linkElement.style.display = "block"; // Om länken redan finns, visa den
            }
        } else {
            if (linkElement) {
                linkElement.style.display = "none"; // Dölj länken när tiden gått ut
            }
        }
  
        // 🔍 Logga hur många länkelement som finns i DOM:en
        // let allLinks = document.querySelectorAll("#shortcutLink"); 
        // console.log(`🔗 Antal länkar i DOM: ${allLinks.length}`);

        // document.querySelectorAll("#shortcutLink").forEach(link => {
        //     link.style.display = "none";
        // });
        
    }
  
    checkTime(); // Kör direkt vid laddning
    setInterval(checkTime, 1000); // Uppdatera varje sekund
  });
  