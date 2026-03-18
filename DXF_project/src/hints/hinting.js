

// --- 2. Global Language State ---
// This variable keeps track of the currently active language for hints.
// It defaults to 'en' (English).


/**
 * Sets the active language for the hints.
 * When the language changes, it re-initializes hovers to update tooltips.
 * @param {string} langCode - The language code (e.g., 'en', 'es', 'nl', 'fr').
 */
function setHintLanguage(langCode) {
    currentLanguage = langCode;
    console.log("Current hint language set to:", currentLanguage);
    // Re-initialize to ensure all existing tooltips (if any are present,
    // though our current implementation creates them on first hover)
    // would reflect the new language if they were persistently displayed.
    // For our use case, `initializeHintingHovers` handles creating/updating
    // content on 'mouseenter'.
    initializeHintingHovers();
}

/**
 * Initializes the hinting hover functionality.
 * This function should be called after your DOM is loaded.
 * It finds all elements with the 'hinting-hover' class and attaches event listeners.
 * It also creates the tooltip element for each, which will be updated on hover.
 */
function initializeHintingHovers() {
    const hintElements = document.querySelectorAll('.hinting-hover');

    hintElements.forEach(element => {
        const hintKey = element.dataset.hintKey; // Get the hint key from 'data-hint-key' attribute

        // Check if a hint key is provided for the element
        if (!hintKey) {
            console.warn("Element with class 'hinting-hover' is missing 'data-hint-key' attribute:", element);
            return; // Skip this element if no key is found
        }

        // Check if a tooltip already exists for this element to avoid creating duplicates
        let tooltip = element.querySelector('.hinting-hover-tooltip');
        if (!tooltip) {
            // Create the tooltip element if it doesn't exist
            tooltip = document.createElement('div');
            tooltip.classList.add('hinting-hover-tooltip');
            element.appendChild(tooltip); // Append the tooltip as a child of the hint element
        }

        // Remove existing event listeners to prevent duplicates if `initializeHintingHovers`
        // is called multiple times (e.g., when changing language).
        // A more robust way might be to use `Event.isTrusted` or store references,
        // but for this example, recreating on language change is acceptable.
        const oldMouseEnterHandler = element.__hintMouseEnterHandler;
        const oldMouseLeaveHandler = element.__hintMouseLeaveHandler;
        if (oldMouseEnterHandler) {
            element.removeEventListener('mouseenter', oldMouseEnterHandler);
        }
        if (oldMouseLeaveHandler) {
            element.removeEventListener('mouseleave', oldMouseLeaveHandler);
        }


        // Define the event handler for mouse entering the element
        const mouseEnterHandler = () => {
            let hintText = "Hint not found."; // Default text if key or language is missing

            // Try to find the hint text:
            // 1. Check if the hint key exists in hintData.hints
            // 2. Check if the current language translation exists for that key
            if (hintData.hints && hintData.hints[hintKey] && hintData.hints[hintKey][currentLanguage]) {
                hintText = hintData.hints[hintKey][currentLanguage];
            } else if (hintData.hints && hintData.hints[hintKey] && hintData.hints[hintKey]['en']) {
                // 3. Fallback to 'en' (English) if the specific language is not available
                hintText = hintData.hints[hintKey]['en'];
                console.warn(`Hint for key '${hintKey}' not found in language '${currentLanguage}', falling back to 'en'.`);
            } else {
                // 4. If no hint found at all, log a warning
                console.warn(`No hint data found for key: '${hintKey}' or no English fallback.`);
            }

            tooltip.textContent = hintText; // Set the text content of the tooltip
            // The CSS handles showing/hiding the tooltip based on the :hover pseudo-class.
        };  // Set an initial language (e.g., from user preferences or browser language)

    // Define the event handler for mouse leaving the element
    const mouseLeaveHandler = () => {
        // The CSS handles hiding the tooltip based on the :hover pseudo-class.
        // No explicit JS action needed here for simple show/hide.
    };

    // Attach the event listeners
    element.addEventListener('mouseenter', mouseEnterHandler);
    element.addEventListener('mouseleave', mouseLeaveHandler);

    // Store references to handlers for potential removal/re-attachment
    element.__hintMouseEnterHandler = mouseEnterHandler;
    element.__hintMouseLeaveHandler = mouseLeaveHandler;
    });
}
