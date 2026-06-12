/**
 * screens.js
 *
 * Contains the render function for each screen in the app.
 * Each function reads from AppState, fetches data if needed,
 * builds the UI using components, and injects it into the DOM.
 *
 * Screen render functions are called by app.js render()
 * whenever AppState.currentScreen changes.
 *
 * Screens in this file:
 * - renderLandingScreen()   → the welcome screen
 * - renderSubjectsScreen()  → subject selection
 * - renderTopicsScreen()    → topic list for a subject
 * - renderSubtopicsScreen() → subtopic list for a topic
 * - renderContentScreen()   → AI-generated content viewer
 */


/**
 * getAppContainer()
 *
 * Returns the main app DOM element.
 * Cached once here so we never query for it repeatedly.
 * Every screen injects its HTML into this container.
 */
function getAppContainer() {
    return document.getElementById("app")
}


/**
 * renderLandingScreen()
 *
 * The first screen a student sees when they open Naija Learn.
 * Clean, welcoming, one clear call to action.
 * No API call needed — purely static content.
 */
function renderLandingScreen() {
    const appContainer = getAppContainer()

    appContainer.innerHTML = `
        <div class="landing-screen">

            <div class="landing-hero">
                <div class="landing-logo">📚</div>
                <h1 class="landing-title">
                    ${NaijaLearnConfig.APP_NAME}
                </h1>
                <p class="landing-tagline">
                    ${NaijaLearnConfig.APP_TAGLINE}
                </p>
            </div>

            <div class="landing-body">
                <p class="landing-description">
                    AI-powered notes, summaries, and practice questions
                    organized around the official WAEC syllabus.
                    Built for Nigerian students.
                </p>
            </div>

            <div class="landing-footer">
                <button
                    class="start-button"
                    data-navigate="/subjects"
                >
                    Start Learning
                </button>
            </div>

        </div>
    `
}


/**
 * renderSubjectsScreen()
 *
 * Fetches all available subjects from the API and
 * displays them as tappable cards.
 *
 * Flow:
 * 1. Show loading spinner immediately
 * 2. Fetch subjects from API
 * 3. Save subjects to state
 * 4. Render subject cards
 */
async function renderSubjectsScreen() {
    console.log("renderSubjectsScreen called", new Date().toISOString())
    const appContainer = getAppContainer()

    // Show loading spinner immediately so the student
    // knows something is happening
    appContainer.innerHTML = `
        <div class="subjects-screen">
            <div class="screen-header">
                <h1 class="screen-title">Choose a Subject</h1>
            </div>
            <div class="screen-body">
                ${LoadingSpinner("Loading subjects...")}
            </div>
        </div>
    `

    try {
        // Fetch subjects from the backend API
        const subjects = await fetchAllSubjects()

        // Save to state for potential future use
        AppState.subjects = subjects

        // Build subject cards from the fetched data
        const subjectCardsHTML = subjects
            .map(subject => SubjectCard(subject))
            .join("")

        // Update only the screen body — not the entire screen
        // The header stays unchanged
        const screenBody = appContainer.querySelector(".screen-body")
        screenBody.innerHTML = subjectCardsHTML

    } catch (error) {
        // Show error message if the API call fails
        const screenBody = appContainer.querySelector(".screen-body")
        screenBody.innerHTML = ErrorMessage(
            error.message,
            "/"
        )
    }
}


/**
 * renderTopicsScreen()
 *
 * Fetches all topics for the currently selected subject
 * and displays them as tappable cards in syllabus order.
 *
 * Reads currentSubjectId from AppState.
 */
async function renderTopicsScreen() {
    const appContainer = getAppContainer()

    // Guard — if no subject is selected something went wrong
    // Send the student back to subject selection
    if (!AppState.currentSubjectId) {
        navigateTo("/subjects")
        return
    }

    // Find the subject name from state for the screen header
    // Falls back to "Economics" if not found
    const currentSubject = AppState.subjects
        .find(subject => subject.id === AppState.currentSubjectId)
    const subjectName = currentSubject ? currentSubject.name : "Economics"

    appContainer.innerHTML = `
        <div class="topics-screen">
            <div class="screen-header">
                ${BackButton("/subjects", "Subjects")}
                <h1 class="screen-title">${sanitizeText(subjectName)}</h1>
                <p class="screen-subtitle">Select a topic to study</p>
            </div>
            <div class="screen-body">
                ${LoadingSpinner("Loading topics...")}
            </div>
        </div>
    `

    try {
        const topics = await fetchTopicsBySubject(AppState.currentSubjectId)

        AppState.topics = topics

        const topicCardsHTML = topics
            .map(topic => TopicCard(topic))
            .join("")

        const screenBody = appContainer.querySelector(".screen-body")
        screenBody.innerHTML = topicCardsHTML

    } catch (error) {
        const screenBody = appContainer.querySelector(".screen-body")
        screenBody.innerHTML = ErrorMessage(
            error.message,
            "/subjects"
        )
    }
}


/**
 * renderSubtopicsScreen()
 *
 * Fetches all subtopics for the currently selected topic
 * and displays them as tappable cards with keyword previews.
 *
 * Reads currentTopicId from AppState.
 */
async function renderSubtopicsScreen() {
    const appContainer = getAppContainer()

    if (!AppState.currentTopicId) {
        navigateTo("/subjects")
        return
    }

    // Find the topic name from state for the screen header
    const currentTopic = AppState.topics
        .find(topic => topic.id === AppState.currentTopicId)
    const topicName = currentTopic ? currentTopic.title : "Topic"

    appContainer.innerHTML = `
        <div class="subtopics-screen">
            <div class="screen-header">
                ${BackButton(
                    `/topics/${AppState.currentSubjectId}`,
                    "Topics"
                )}
                <h1 class="screen-title">
                    ${sanitizeText(topicName)}
                </h1>
                <p class="screen-subtitle">Select a subtopic to study</p>
            </div>
            <div class="screen-body">
                ${LoadingSpinner("Loading subtopics...")}
            </div>
        </div>
    `

    try {
        const subtopics = await fetchSubtopicsByTopic(AppState.currentTopicId)

        AppState.subtopics = subtopics

        const subtopicCardsHTML = subtopics
            .map(subtopic => SubtopicCard(subtopic))
            .join("")

        const screenBody = appContainer.querySelector(".screen-body")
        screenBody.innerHTML = subtopicCardsHTML

    } catch (error) {
        const screenBody = appContainer.querySelector(".screen-body")
        screenBody.innerHTML = ErrorMessage(
            error.message,
            `/topics/${AppState.currentSubjectId}`
        )
    }
}


/**
 * renderContentScreen()
 *
 * The most important screen in the app.
 * Fetches AI-generated content for the selected subtopic.
 *
 * Handles three content types via tabs:
 * - Notes     → full structured explanation
 * - Summary   → brief revision summary
 * - Questions → 5 WAEC-style practice questions
 *
 * First request generates and caches content.
 * Subsequent requests for the same subtopic load instantly.
 *
 * Reads currentSubtopicId and activeContentTab from AppState.
 */
async function renderContentScreen() {
    const appContainer = getAppContainer()

    if (!AppState.currentSubtopicId) {
        navigateTo("/subjects")
        return
    }

    // Find the subtopic name from state for the header
    const currentSubtopic = AppState.subtopics
        .find(subtopic => subtopic.id === AppState.currentSubtopicId)
    const subtopicName = currentSubtopic
        ? currentSubtopic.title
        : "Content"

    // Render the full screen structure with the loading state
    // The tabs are rendered immediately — only the body loads
    appContainer.innerHTML = `
        <div class="content-screen">

            <div class="screen-header">
                ${BackButton(
                    `/subtopics/${AppState.currentTopicId}`,
                    "Subtopics"
                )}
                <h1 class="screen-title">
                    ${sanitizeText(subtopicName)}
                </h1>
            </div>

            <div class="content-tabs-container">
                ${ContentTabs(AppState.activeContentTab)}
            </div>

            <div class="screen-body" id="content-body">
                ${LoadingSpinner("Generating your content...")}
            </div>

        </div>
    `

    await loadContentForActiveTab()
}


/**
 * loadContentForActiveTab()
 *
 * Fetches and renders content for the currently active tab.
 * Separated from renderContentScreen() so it can be called
 * independently when the student switches tabs — without
 * rebuilding the entire screen.
 *
 * This is the clean DOM update principle in action —
 * only the content body updates when tabs switch,
 * not the header or the tabs themselves.
 */
async function loadContentForActiveTab() {
    // Get only the content body element — not the full screen
    // This avoids unnecessary re-renders of the header and tabs
    const contentBody = document.getElementById("content-body")

    if (!contentBody) return

    // Show loading spinner in content area only
    contentBody.innerHTML = LoadingSpinner(
        "Generating your content..."
    )

    try {
        const contentData = await fetchSubtopicContent(
            AppState.currentSubtopicId,
            AppState.activeContentTab
        )

        // Render the generated content text
        contentBody.innerHTML = ContentBody(contentData.content)

    } catch (error) {
        contentBody.innerHTML = ErrorMessage(
            error.message,
            `/subtopics/${AppState.currentTopicId}`
        )
    }
}