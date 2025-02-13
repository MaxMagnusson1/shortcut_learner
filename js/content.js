
class ShortCommandNotifier {
    /**
     * Contructor för shortcommandnotifier klassen
     */

    constructor() {
        this.devtoolsOpen = false;
        // this.previousHeight = window.innerHeight;
        this.shortcutUsed = false; 


        this.os = this.detectOS();

        // // Skapa en div för att visa texten
        this.SCDiv = new ShortcommandDiv(this.os);
        // this.SCDiv.createDiv();

        // this.URL = new UrlHandler(this.SCDiv);
        // this.URL.setupEventListeners();

        // this.tabListner = new TabHandler(this.SCDiv);
        // this.tabListner.listenForTabChange();

        // this.reloadListner = new ReloadHandler(this.SCDiv);
        // this.reloadListner.listenForReload();


        
        // Dölj div efter 5 sekunder


        // Lyssna på events
        //this.setupEventListeners();
    }

    /**
     * Kontrollerar vilket operativsystem användaren använder
     * @returns {String} - Returnerar vilket operativsystem använd
     */
    detectOS() {
        const platform = navigator.userAgent.toLowerCase();
        if (platform.includes('win')) return 'CTRL';
        if (platform.includes('mac')) return 'CMD';
        return 'CTRL/CMD';
    }

    // setupEventListeners() {
    //     // window.addEventListener("blur", this.handleBlur.bind(this));
    //     // document.addEventListener("visibilitychange", this.handleVisibilityChange.bind(this));
    //     // window.addEventListener("resize", this.detectDevTools.bind(this));
    //     // window.addEventListener("keydown", this.handleKeyDown.bind(this));
    //     // window.addEventListener("keyup", this.handleKeyUp.bind(this));
    // }

    // detectDevTools() {
    //     if (window.innerHeight < this.previousHeight) {
    //         this.devtoolsOpen = true;

    //         } else {
    //         this.devtoolsOpen = false;
    //     }
    //     this.previousHeight = window.innerHeight;
    // }

    // handleKeyDown(event) {
    //     if (event.ctrlKey && (event.key === "l" || event.key === "i")) {
    //         this.shortcutUsed = true; // Markera att Ctrl + L eller Ctrl + I användes
    //         console.log(`Användaren tryckte ${event.key.toUpperCase()} – ingen varning behövs.`);
    //     }
    // }

    // handleKeyUp(event) {
    //     if (event.key === "Control" || event.key === "l" || event.key === "i") {
    //         this.shortcutUsed = false; // Återställ flaggan när tangenten släpps
    //     }
    // }

    // handleBlur() {
    //     setTimeout(() => {
    //         if (this.shortcutUsed) {
    //             console.log("Kortkommandot användes – visar ingen ruta.");
    //         } else if (document.visibilityState === "visible" && !this.devtoolsOpen) {
    //             console.log("Användaren klickade troligen i adressfältet.");
    //             this.SCDiv.setTextInDiv("CTRL +L");
                
    //         } else {
    //             console.log("Ignorerar blur-händelse (utvecklarverktyg eller flikbyte upptäckt).");
    //         }

    //         // Återställ flaggan EFTER att blur har hanterats
    //         this.shortcutUsed = false;
    //     }, 100);
    // }

    // handleVisibilityChange() {
    //     if (document.visibilityState === "hidden") {
    //         console.log("Flikbyte eller utvecklarverktyg upptäckt – ignorerar.");
    //     }
    // }
}



// Skapa en instans av ShortCommandNotifier
new ShortCommandNotifier();
