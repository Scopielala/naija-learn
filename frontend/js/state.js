/**
 * state.js
 *
 * The single source of truth for the entire application.
 * Every piece of data the app needs to remember lives here.
 *
 * The golden rule:
 * - NEVER modify state directly from outside this file
 * - ALWAYS use setState() to make changes
 * - State changes automatically trigger a UI re-render
 *
 * This pattern makes the app predictable — if something
 * looks wrong on screen, you check state first.
 */


/**
 * The initial state of the application.
 * This is exactly what the app looks like when it
 * first loads — before any user interaction.
 */
const AppState = {

    // --- Navigation ---
    // Tracks which screen the student is currently on
    currentScreen: NaijaLearnConfig.SCREENS.LANDING,

    // --- Selected Items ---
    // Tracks what the student has selected as they navigate
    // null means nothing selected yet
    currentSubjectId:  null,
    currentTopicId:    null,
    currentSubtopicId: null,

    // --- Content ---
    // Tracks which content tab is active on the content screen
    activeContentTab: NaijaLearnConfig.CONTENT_TABS.NOTES,

    // --- UI Feedback ---
    // Tracks loading and error states so the UI can
    // show spinners and error messages appropriately
    isLoading: false,
    errorMessage: null,

    // --- API Data ---
    // Stores data fetched from the backend
    // Starts empty — populated as the student navigates
    subjects:  [],
    topics:    [],
    subtopics: [],
    content:   null,
}


/**
 * setState()
 *
 * The ONLY way to update the application state.
 * Accepts a partial state object and merges it with
 * the current state, then triggers a UI re-render.
 *
 * Usage:
 *   setState({ currentScreen: "topics", isLoading: false })
 *
 * This pattern is inspired by React's setState() —
 * you only pass what changed, not the entire state.
 *
 * @param {Object} newPartialState - The state properties to update
 */
function setState(newPartialState) {
    // Merge the new values into the existing state
    // Object.assign copies properties from newPartialState
    // into AppState, overwriting only what changed
    Object.assign(AppState, newPartialState)

    // Log state changes in development so developers
    // can trace exactly what changed and when
    if (NaijaLearnConfig.DEBUG_MODE) {
        console.log("[State Update]", newPartialState)
        console.log("[Current State]", { ...AppState })
    }

    // Every state change triggers a UI re-render
    // The render function lives in app.js and knows
    // how to read state and show the right screen
    render()
}


/**
 * resetNavigationState()
 *
 * Clears all navigation-related state when the student
 * goes back to the beginning. Keeps config values intact.
 *
 * Called when the student taps the app logo or
 * navigates back to the landing screen.
 */
function resetNavigationState() {
    setState({
        currentScreen:    NaijaLearnConfig.SCREENS.LANDING,
        currentSubjectId:  null,
        currentTopicId:    null,
        currentSubtopicId: null,
        activeContentTab:  NaijaLearnConfig.CONTENT_TABS.NOTES,
        isLoading:         false,
        errorMessage:      null,
        subjects:          [],
        topics:            [],
        subtopics:         [],
        content:           null,
    })
}