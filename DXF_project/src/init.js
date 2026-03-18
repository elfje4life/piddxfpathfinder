 let currentLanguage = 'en';
document.addEventListener("DOMContentLoaded", () => {
    //canvas init
    // Stel een achtergrondkleur in voor de body of html om het canvas goed te zien
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden"; // Voorkom scrollbalken door canvas
    document.body.style.backgroundColor = "#222"; // Donkere achtergrond voor contrast

    // Creëer een canvas element dynamisch als het nog niet bestaat
    let myCanvas = document.getElementById("svg-container");


    // Initialiseer de CanvasHandler
      //const handler = new SVG("myCanvas");
    // Of gebruik je eigen lokale afbeelding:
    // const handler = new CanvasHandler('myCanvas', './path/to/your/image.jpg');


    // document.body.appendChild(resetButton);

    // resetButton.addEventListener("click", () => {
    //     handler.resetView();
    // });
//menu hover
    // document.addEventListener("mousemove", function (event) {
    //     const menu = document.querySelector(".transparent-menu");
    //
    //     if (event.clientY < 50) {
    //         menu.style.top = "10px"; // Show menu
    //     } else {
    //         menu.style.top = "-80px"; // Hide menu
    //     }
   // });


//hints
    // Set an initial language (e.g., from user preferences or browser language)
    // For this example, we start with English.

    setHintLanguage('en');

    // Add event listeners to the language switcher buttons
   // document.getElementById('lang-en').addEventListener('click', () => setHintLanguage('en'));
   // document.getElementById('lang-es').addEventListener('click', () => setHintLanguage('es'));
   // document.getElementById('lang-nl').addEventListener('click', () => setHintLanguage('nl'));
   // document.getElementById('lang-fr').addEventListener('click', () => setHintLanguage('fr'));
    const FileInput = document.getElementById('actual-search');
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.getElementById('actual-search');

    // Keep active when input has focus or content
    searchInput.addEventListener('focus', () => {
        searchContainer.classList.add('active');
    });

    searchInput.addEventListener('blur', () => {
        if (searchInput.value === '') {
            searchContainer.classList.remove('active');
        }
    });

    // Also add active class on hover if no content
    searchContainer.addEventListener('mouseenter', () => {
        // Only add 'active' class on hover if the input is currently empty and not focused
        if (searchInput.value === '' && document.activeElement !== searchInput) {
            searchContainer.classList.add('active');
        }
    });

    // Remove active class on mouse leave only if no content and not focused
    searchContainer.addEventListener('mouseleave', () => {
        if (searchInput.value === '' && document.activeElement !== searchInput) {
            searchContainer.classList.remove('active');
        }
    });

    // Initial check in case of autofill or pre-filled value
    if (searchInput.value !== '') {
        searchContainer.classList.add('active');
    }



});
