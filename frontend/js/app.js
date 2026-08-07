/**
 * app.js
 *
 * The entry point of the Naija Learn frontend.
 * This is the first file that runs when the app loads.
 *
 * Responsibilities:
 * 1. Define the render() function — the central UI orchestrator
 * 2. Initialize the router
 * 3. Initialize event listeners
 * 4. Start the app
 *
 * Every other file serves this one.
 * If you want to understand how the app works,
 * start reading here.
 *
 * Load order in index.html (important):
 * 1. config.js    — constants and configuration
 * 2. state.js     — app state and setState()
 * 3. router.js    — navigation
 * 4. api.js       — backend communication
 * 5. components.js — UI building blocks
 * 6. screens.js   — screen render functions
 * 7. events.js    — user interaction handlers
 * 8. app.js       — entry point (this file, loaded last)
 */


/**
 * render()
 *
 * The central UI orchestrator.
 * Called every time state changes via setState().
 * Reads AppState.currentScreen and calls the
 * matching screen render function.
 *
 * This is the bridge between state and UI.
 * State says what screen to show.
 * render() makes it happen.
 */
function render() {
    const { currentScreen } = AppState

    if (NaijaLearnConfig.DEBUG_MODE) {
        console.log(`[Render] Screen: ${currentScreen}`)
    }

    switch (currentScreen) {
        case NaijaLearnConfig.SCREENS.LANDING:
            renderLandingScreen()
            break

        case NaijaLearnConfig.SCREENS.SUBJECTS:
            renderSubjectsScreen()
            break

        case NaijaLearnConfig.SCREENS.TOPICS:
            renderTopicsScreen()
            break

        case NaijaLearnConfig.SCREENS.SUBTOPICS:
            renderSubtopicsScreen()
            break

        case NaijaLearnConfig.SCREENS.CONTENT:
            renderContentScreen()
            break

        default:
            // Unknown screen — fall back to landing
            // This should never happen but we handle it
            // gracefully just in case
            console.warn(`[Render] Unknown screen: ${currentScreen}`)
            renderLandingScreen()
            break
    }
}


/**
 * initializeApp()
 *
 * Bootstraps the entire application.
 * Called once when the DOM is fully loaded.
 *
 * Order matters here:
 * 1. Initialize event listeners first — so they are
 *    ready to catch interactions immediately
 * 2. Initialize router last — it triggers the first
 *    render based on the current URL
 */
function initializeApp() {
    if (NaijaLearnConfig.DEBUG_MODE) {
        console.log(`[App] Initializing ${NaijaLearnConfig.APP_NAME}...`)
    }

    // Step 1 — Set up all event listeners
    // Must happen before router initialization so
    // any interactions during the initial render
    // are captured correctly
    initializeEventListeners()

    // Step 2 — Initialize the router
    // This reads the current URL and triggers the
    // first render — starting the app
    initializeRouter()

    if (NaijaLearnConfig.DEBUG_MODE) {
        console.log(`[App] ${NaijaLearnConfig.APP_NAME} initialized successfully`)
        console.log(`[App] Initial state:`, { ...AppState })
    }
}


// --- App Bootstrap ---
// Wait for the DOM to be fully loaded before initializing.
// If we ran initializeApp() immediately the DOM elements
// we need — like #app — might not exist yet.
document.addEventListener("DOMContentLoaded", initializeApp)