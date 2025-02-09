// class ReloadHandler {
//     constructor(SCDiv) {
//         this.SCDiv = SCDiv;
//         this.lastInteractionWasKeyboard = false; // Spårar senaste interaktionen

//         console.log("reloadListener.js laddat");

//         // Starta lyssnare
//         this.listenForReload();
//     }

//     listenForReload() {
//         // Lyssna på tangenttryckningar (F5, Ctrl+R, Cmd+R)
//         window.addEventListener("keydown", (event) => {
//             if (event.key === "F5" || 
//                 (event.ctrlKey && event.key === "r") || 
//                 (event.metaKey && event.key === "r")) { 
//                 this.lastInteractionWasKeyboard = true; // Tangentbordet användes
//                 console.log("⌨️ Kortkommando användes för omladdning!");
//             }
//         });

//         // Lyssna på `beforeunload` (sidan laddas om eller byter sida)
//         window.addEventListener("beforeunload", () => {
//             console.log("🔄 Användaren är på väg att lämna sidan...");
//             sessionStorage.setItem("reloaded", this.lastInteractionWasKeyboard ? "keyboard" : "mouse");
//             sessionStorage.setItem("lastUrl", window.location.href); // Spara sidans URL
//             sessionStorage.setItem("lastHistoryLength", history.length); // Spara historik-längden
//         });

//         // När sidan laddas in igen, kolla om det var en omladdning eller navigering
//         window.addEventListener("load", () => {
//             const reloadType = sessionStorage.getItem("reloaded");
//             const lastUrl = sessionStorage.getItem("lastUrl");
//             const lastHistoryLength = sessionStorage.getItem("lastHistoryLength");

//             // Rensa lagrad data efter användning
//             sessionStorage.removeItem("reloaded");
//             sessionStorage.removeItem("lastUrl");
//             sessionStorage.removeItem("lastHistoryLength");

//             if (lastHistoryLength) {
//                 const currentHistoryLength = history.length;

//                 if (currentHistoryLength < lastHistoryLength) {
//                     console.log("⬅️ Användaren gick bakåt i historiken!");
//                     this.SCDiv.setTextInDiv("ALT + ← (Gå bakåt)");
//                     return;
//                 } else if (currentHistoryLength > lastHistoryLength) {
//                     console.log("➡️ Användaren gick framåt i historiken!");
//                     this.SCDiv.setTextInDiv("ALT + → (Gå framåt)");
//                     return;
//                 }
//             }

//             // Kontrollera om det var en omladdning via snurrhjulet
//             if (reloadType === "mouse" && lastUrl === window.location.href) {
//                 console.log("✅ Sidan har laddats om via snurrhjulet!");
//                 this.SCDiv.setTextInDiv("CTRL + R");
//             } else {
//                 console.log("🟢 Sidan laddades om via kortkommando ELLER navigering – ignorerar.");
//             }

//             // Återställ flaggan
//             this.lastInteractionWasKeyboard = false;
//         });
//     }
// }

// // Gör klassen globalt tillgänglig
// window.ReloadHandler = ReloadHandler;
