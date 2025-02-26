class ShortCommandNotifier {
    /**
     * Contructor för shortcommandnotifier klassen
     */
    constructor() {
        this.devtoolsOpen = false;
        this.shortcutUsed = false; 
        this.os = this.detectOS();

        // Skapa en div för att visa texten
        this.SCDiv = new ShortcommandDiv(this.os);

        // Kontrollera och spara värde i chrome storage
        this.checkAndSaveId();
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

    /**
     * Genererar en slumpmässig sträng med 5 bokstäver
     * @returns {String} - Slumpmässig sträng med 5 bokstäver
     */
    generateRandomString() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }

    /**
     * Kontrollera om "id" finns i chrome storage, om inte, skapa och spara det
     */
    checkAndSaveId() {
        chrome.storage.local.get(['id'], (result) => {
            if (!result.id) {
                const timestamp = Date.now(); // Använd millisekunder
                const randomString = this.generateRandomString();
                const id = `${timestamp}-${randomString}`;
                chrome.storage.local.set({ id: id }, () => {
                    console.log(`Sparade id i chrome storage: ${id}`);
                });
            } else {
                console.log(`Id finns redan i chrome storage: ${result.id}`);
            }
        });
    }
}

// Skapa en instans av ShortCommandNotifier
new ShortCommandNotifier();