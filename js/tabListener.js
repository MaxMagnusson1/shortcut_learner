// class TabHandler {
//     constructor(SCDiv) {
//         this.SCDiv = SCDiv;
//         console.log("TabListener.js laddat");

//         // Starta direkt när klassen instansieras
//         this.listenForTabChange();
//     }

//     listenForTabChange() {

//      document.addEventListener("visibilitychange", () => {
//             if (document.visibilityState === "hidden") {
//                 console.log("Användaren bytte bort från fliken.");
//                 this.SCDiv.setTextInDiv("CTRL + T, ny flik, CTRL + TAB, byt flik"); 
//             } else if (document.visibilityState === "visible") {
//                 console.log("Användaren kom tillbaka till fliken.");
//             }
//         });
//     };
//     // listenForTabCount() {
//     //     // Lyssna på meddelanden från `background.js`
//     //     chrome.runtime.onMessage.addListener((message) => {
//     //         if (message.action === "update_tab_count") {
//     //             console.log(`📊 Antal öppna flikar: ${message.tabCount}`);
//     //             this.SCDiv.setTextInDiv(`Antal flikar: ${message.tabCount}`);
//     //         }
//     //     });
//     // }
    
//     }

// // Gör klassen globalt tillgänglig
// window.TabHandler = TabHandler;








