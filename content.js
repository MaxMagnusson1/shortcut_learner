// Funktion för att skapa och visa popup
function showPopup(message) {
    // Skapa en div för popupen
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.bottom = '10px';
    popup.style.right = '10px';
    popup.style.backgroundColor = 'white';
    popup.style.border = '1px solid black';
    popup.style.padding = '10px';
    popup.style.zIndex = '1000';
    popup.innerHTML = `<h2>${message}</h2>`;

    // Lägg till popupen till dokumentet
    document.body.appendChild(popup);

    // Ta bort popupen efter 5 sekunder
    setTimeout(() => {
        popup.remove();
    }, 5000);
}

// Lägg till en event listener för klick på element med klassen 'menu-button goog-control goog-inline-block'
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('menu-button') &&
        event.target.classList.contains('goog-control') &&
        event.target.classList.contains('goog-inline-block')) {
    }
});

// Lägg till en event listener för klick på element med ID 'docs-edit-menu'
document.addEventListener('click', (event) => {
    if (event.target.id === 'docs-edit-menu') {
        showPopup('Kopiera-knappen tryckt på');
    }
});
//&& event.target.getAttribute('aria-activedescendant') === ':6v'