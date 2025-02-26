
class ShortCommandNotifier {
    /**
     * Contructor för shortcommandnotifier klassen
     */
    constructor() {
        this.devtoolsOpen = false;
        this.shortcutUsed = false; 
        this.os = this.detectOS();

        // // Skapa en div för att visa texten
        this.SCDiv = new ShortcommandDiv(this.os);
        // this.popup = new Popup();
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
}

// Skapa en instans av ShortCommandNotifier
new ShortCommandNotifier();
