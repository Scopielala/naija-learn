/**
 * router.js
 *
 * Handles client-side navigation using the History API.
 * Maps URL paths to application screens without page reloads.
 *
 * How it works:
 * - When a student navigates, we push a new URL to the browser
 *   history using pushState() — no page reload happens
 * - When the browser back/forward buttons are pressed,
 *   popstate fires and we read the URL to restore the right screen
 * - On direct URL visits or page refresh, we parse the current
 *   URL and navigate to the correct screen
 *
 * URL structure:
 *   /                           → landing screen
 *   /subjects                   → subject selection screen
 *   /topics/:subjectId          → topics for a subject
 *   /subtopics/:topicId         → subtopics for a topic
 *   /content/:subtopicId        → content for a subtopic
 */


/**
 * navigateTo()
 *
 * The ONLY function used to navigate between screens.
 * Updates the browser URL and triggers a state change.
 *
 * Usage:
 *   navigateTo("/subjects")
 *   navigateTo(`/topics/${subjectId}`)
 *
 * @param {string} path - The URL path to navigate to
 */
function navigateTo(path) {
    // Push the new path to browser history
    // This updates the URL bar without reloading the page
    window.history.pushState({}, "", path)

    // Parse the new path and update app state accordingly
    handleRouteChange(path)
}


/**
 * handleRouteChange()
 *
 * Reads a URL path and updates AppState to match.
 * Called both when navigating programmatically and
 * when the browser back/forward buttons are used.
 *
 * @param {string} path - The URL path to handle
 */
function handleRouteChange(path) {
    // Split the path into segments for easy matching
    // "/topics/abc-123" becomes ["", "topics", "abc-123"]
    const segments = path.split("/")

    // Segment 0 is always empty string (before the first /)
    // Segment 1 is the screen name
    // Segment 2 is the ID (if present)
    const screenName = segments[1] || ""
    const resourceId = segments[2] || null

    // Match the path to the correct screen
    switch (screenName) {

        case "":
            // Root path "/" — show the landing screen
            setState({
                currentScreen: NaijaLearnConfig.SCREENS.LANDING,
            })
            break

        case "subjects":
            // "/subjects" — show the subject selection screen
            setState({
                currentScreen: NaijaLearnConfig.SCREENS.SUBJECTS,
            })
            break

        case "topics":
            // "/topics/:subjectId" — show topics for a subject
            if (!resourceId) {
                // No subject ID in URL — go back to subjects
                navigateTo("/subjects")
                return
            }
            setState({
                currentScreen:    NaijaLearnConfig.SCREENS.TOPICS,
                currentSubjectId: resourceId,
            })
            break

        case "subtopics":
            // "/subtopics/:topicId" — show subtopics for a topic
            if (!resourceId) {
                navigateTo("/subjects")
                return
            }
            setState({
                currentScreen:  NaijaLearnConfig.SCREENS.SUBTOPICS,
                currentTopicId: resourceId,
            })
            break

        case "content":
            // "/content/:subtopicId" — show content for a subtopic
            if (!resourceId) {
                navigateTo("/subjects")
                return
            }
            setState({
                currentScreen:     NaijaLearnConfig.SCREENS.CONTENT,
                currentSubtopicId: resourceId,
            })
            break

        default:
            // Unknown path — redirect to landing screen
            navigateTo("/")
            break
    }
}


/**
 * initializeRouter()
 *
 * Sets up the router when the app first loads.
 * Must be called once during app initialization.
 *
 * Does two things:
 * 1. Listens for browser back/forward button presses
 * 2. Handles the initial URL when the page first loads
 */
function initializeRouter() {
    // Listen for browser back/forward button presses
    // When the student presses back, popstate fires with
    // the previous URL — we handle it like any route change
    window.addEventListener("popstate", () => {
        handleRouteChange(window.location.pathname)
    })

    // Handle the current URL when the page first loads
    // This supports direct URL visits and page refreshes
    handleRouteChange(window.location.pathname)
}