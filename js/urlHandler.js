// class UrlHandler{
//     constructor(SCDiv){
//         this.SCDiv = SCDiv;
//         this.lastInteractionWasMouse = false;
//     }

//     setupEventListeners() {
//         window.addEventListener("blur", this.handleBlur.bind(this));
//         document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this));
//         window.addEventListener("resize", this.detectDevTools.bind(this));
//         window.addEventListener("keydown", this.handleKeyDown.bind(this));
//         window.addEventListener("keyup", this.handleKeyUp.bind(this));
//         document.addEventListener("mousedown", this.handleMouseDown.bind(this)); // ✅ Fixat: Korrekt metodbindning

//     }

//     handleMouseDown(event) {
//         this.lastInteractionWasMouse = true; // 🖱️ Musen användes
//     }

//     handleKeyDown(event) {
//         this.lastInteractionWasMouse = false; // ⌨️ Tangentbordet användes
//     }

//     handleKeyUp(event) {
//         this.lastInteractionWasMouse = false; // Säkerhetskopiera flaggan
//     }

//     detectDevTools() {
//         if (window.innerHeight < this.previousHeight) {
//             this.devtoolsOpen = true;
//            // console.log("Utvecklarverktyg öppnades!");
//         } else {
//             this.devtoolsOpen = false;
//         }
//         this.previousHeight = window.innerHeight;
//     }

//     handleKeyDown(event) {
//         if (event.ctrlKey && (event.key === "l" || event.key === "i")) {
//             this.shortcutUsed = true; // Markera att Ctrl + L eller Ctrl + I användes
//         //    console.log(`Användaren tryckte ${event.key.toUpperCase()} – ingen varning behövs.`);
//         }
//     }

//     handleKeyUp(event) {
//         if (event.key === "Control" || event.key === "l" || event.key === "i") {
//             this.shortcutUsed = false; // Återställ flaggan när tangenten släpps
//         }
//      }

//      handleBlur() {
//         setTimeout(() => {
//             if (document.visibilityState === "hidden") {
//                 console.log("❌ Flikbyte eller annan applikation – ignorerar.");
//                 return;
//             }

//             if (this.lastInteractionWasMouse) {
//                 console.log("⚠️ Användaren klickade i adressfältet med musen!");
//                 this.SCDiv.setTextInDiv("CTRL + L");
//             } else {
//                 console.log("🟢 Ignorerar blur (kortkommando eller annan orsak).");
//             }

//             // Återställ flaggan
//             this.lastInteractionWasMouse = false;
//         }, 100);
//     }

//     handleVisibilityChange() {
//         if (document.visibilityState === "hidden") {
//             console.log("Flikbyte eller utvecklarverktyg upptäckt – ignorerar.");
//         }
//     }

// }
// window.UrlHandler = UrlHandler;
