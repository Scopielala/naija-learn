/**
 * events.js
 *
 * Handles all user interactions in the app.
 * Every click, tap, and keyboard interaction is
 * captured and responded to here.
 *
 * Architecture decision — Event Delegation:
 * Instead of adding a click listener to every single
 * card and button individually, we add ONE listener
 * to the app container and let clicks bubble up to it.
 *
 * Why this matters:
 * - Cards are created and destroyed dynamically as
 *   screens change. Listeners attached directly to
 *   cards would be lost every time the screen rebuilds.
 * - One listener is more memory efficient than hundreds.
 * - New clickable elements work automatically without
 *   adding new listeners.
 *
 * How it works:
 * - Student clicks a topic card
 * - Click event bubbles up through the DOM to #app
 * - Our listener on #app catches it
 * - We inspect the clicked element to determine action
 */


/**
 * handleNavigationClick()
 *
 * Handles clicks on any element with a data-navigate attribute.
 * This covers subject cards, topic cards, subtopic cards,
 * back buttons, retry buttons, and the start button.
 *
 * @param {HTMLElement} clickedElement - The element that was clicked
 * @returns {boolean} - True if navigation was handled, false if not
 */
function handleNavigationClick(clickedElement) {
    // Walk up the DOM tree from the clicked element
    // looking for the nearest ancestor with data-navigate
    // This handles clicks on child elements inside a card
    // e.g. clicking the title text inside a topic card
    const navigatableElement = clickedElement.closest("[data-navigate]")

    if (!navigatableElement) return false

    const destination = navigatableElement.dataset.navigate

    if (destination) {
        navigateTo(destination)
        return true
    }

    return false
}


/**
 * handleTabClick()
 *
 * Handles clicks on the content tab buttons.
 * Notes, Summary, and Questions tabs.
 *
 * When a tab is clicked:
 * 1. Update the active tab in state
 * 2. Update the visual active state on the tabs
 * 3. Load the content for the newly selected tab
 *
 * Only the content body updates — not the full screen.
 * This is the clean DOM update principle in action.
 *
 * @param {HTMLElement} clickedElement - The element that was clicked
 * @returns {boolean} - True if tab click was handled, false if not
 */
function handleTabClick(clickedElement) {
    // Check if a tab button was clicked
    const tabButton = clickedElement.closest(".content-tab")

    if (!tabButton) return false

    const selectedTab = tabButton.dataset.tab

    // Guard — do nothing if the student clicks
    // the tab that is already active
    if (selectedTab === AppState.activeContentTab) return true

    // Update which tab is active in state
    // Note: we do NOT call setState() here because that would
    // trigger a full render() and rebuild the entire screen.
    // Instead we update state directly and handle the UI
    // update manually for this specific case.
    AppState.activeContentTab = selectedTab

    // Manually update the visual active state on tab buttons
    // Remove active class from all tabs
    document.querySelectorAll(".content-tab").forEach(tab => {
        tab.classList.remove("content-tab--active")
        tab.setAttribute("aria-selected", "false")
    })

    // Add active class to the clicked tab only
    tabButton.classList.add("content-tab--active")
    tabButton.setAttribute("aria-selected", "true")

    // Load content for the newly selected tab
    // This only updates the content body — not the full screen
    loadContentForActiveTab()

    return true
}


/**
 * handleKeyboardNavigation()
 *
 * Makes the app keyboard accessible.
 * Elements with tabindex="0" can be focused with Tab key.
 * Pressing Enter or Space on a focused card triggers a click.
 *
 * This is important for accessibility — some users
 * navigate entirely with a keyboard.
 *
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyboardNavigation(event) {
    // Only handle Enter and Space keys
    if (event.key !== "Enter" && event.key !== " ") return

    const focusedElement = document.activeElement

    // If a navigatable element is focused trigger a click
    if (focusedElement && focusedElement.closest("[data-navigate]")) {
        event.preventDefault()
        focusedElement.click()
    }

    // If a tab button is focused trigger a click
    if (focusedElement && focusedElement.closest(".content-tab")) {
        event.preventDefault()
        focusedElement.click()
    }
}


/**
 * initializeEventListeners()
 *
 * Sets up all event listeners for the app.
 * Called once during app initialization.
 *
 * Uses event delegation — one listener on #app
 * handles all click interactions in the entire app.
 */
function initializeEventListeners() {
    const appContainer = document.getElementById("app")

    // --- Primary Click Handler ---
    // One listener handles ALL clicks in the entire app
    appContainer.addEventListener("click", (event) => {
        const clickedElement = event.target

        // Try tab click first — more specific check
        if (handleTabClick(clickedElement)) return

        // Try navigation click — covers all cards and buttons
        if (handleNavigationClick(clickedElement)) return
    })

    // --- Keyboard Navigation ---
    // Makes the app usable with keyboard only
    document.addEventListener("keydown", handleKeyboardNavigation)

    // --- App Logo Click ---
    // Clicking the logo on any screen returns to landing
    document.addEventListener("click", (event) => {
        const logoClicked = event.target.closest(".app-logo")
        if (logoClicked) {
            resetNavigationState()
            navigateTo("/")
        }
    })
}