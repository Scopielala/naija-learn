/**
 * components.js
 *
 * Reusable UI building blocks for Naija Learn.
 * Each function takes data and returns an HTML string.
 *
 * Think of these as LEGO pieces — small, self-contained,
 * and assembled together to build full screens.
 *
 * Rules for components:
 * - They ONLY build HTML — no DOM manipulation here
 * - They NEVER make API calls
 * - They NEVER modify state
 * - They receive data as parameters and return HTML strings
 *
 * This keeps components predictable — same input always
 * produces the same output. Easy to test, easy to reuse.
 */


/**
 * LoadingSpinner()
 *
 * Displayed while waiting for API responses.
 * Gives students immediate feedback that something
 * is happening — prevents the "is the app broken?" feeling.
 *
 * @param {string} message - Optional message below the spinner
 * @returns {string} - HTML string
 */
function LoadingSpinner(message = "Loading...") {
    return `
        <div class="loading-spinner-container">
            <div class="loading-spinner"></div>
            <p class="loading-message">${sanitizeText(message)}</p>
        </div>
    `
}


/**
 * ErrorMessage()
 *
 * Displayed when an API call fails.
 * Shows a human-readable message and a retry button
 * so students are never stuck on a broken screen.
 *
 * @param {string} message    - The error message to display
 * @param {string} retryPath  - The path to navigate to on retry
 * @returns {string} - HTML string
 */
function ErrorMessage(message, retryPath = "/subjects") {
    return `
        <div class="error-container">
            <div class="error-icon">⚠️</div>
            <p class="error-message">${sanitizeText(message)}</p>
            <button
                class="retry-button"
                data-navigate="${sanitizeText(retryPath)}"
            >
                Try Again
            </button>
        </div>
    `
}


/**
 * BackButton()
 *
 * Navigation component shown at the top of every screen
 * except the landing screen.
 * Allows students to go back without using the browser button.
 *
 * @param {string} destination - The path to navigate to on click
 * @param {string} label       - The screen name to show after the arrow
 * @returns {string} - HTML string
 */
function BackButton(destination, label) {
    return `
        <button
            class="back-button"
            data-navigate="${sanitizeText(destination)}"
            aria-label="Go back to ${sanitizeText(label)}"
        >
            ← ${sanitizeText(label)}
        </button>
    `
}


/**
 * SubjectCard()
 *
 * Displays a single subject as a tappable card.
 * Used on the subjects screen.
 *
 * @param {Object} subject         - Subject data from the API
 * @param {string} subject.id      - Subject UUID
 * @param {string} subject.name    - Subject name e.g. "Economics"
 * @returns {string} - HTML string
 */
function SubjectCard(subject) {
    return `
        <div
            class="subject-card"
            data-navigate="/topics/${sanitizeText(subject.id)}"
            role="button"
            tabindex="0"
            aria-label="Study ${sanitizeText(subject.name)}"
        >
            <div class="subject-card-icon">📘</div>
            <div class="subject-card-body">
                <h2 class="subject-card-name">
                    ${sanitizeText(subject.name)}
                </h2>
                <p class="subject-card-label">WAEC Syllabus</p>
            </div>
            <span class="subject-card-chevron">›</span>
        </div>
    `
}


/**
 * TopicCard()
 *
 * Displays a single topic as a tappable card.
 * Shows the topic order, title, and how many subtopics it has.
 * Used on the topics screen.
 *
 * @param {Object} topic               - Topic data from the API
 * @param {string} topic.id            - Topic UUID
 * @param {string} topic.title         - Topic title
 * @param {number} topic.order         - Topic position in syllabus
 * @param {number} topic.subtopic_count - Number of subtopics
 * @returns {string} - HTML string
 */
function TopicCard(topic) {
    return `
        <div
            class="topic-card"
            data-navigate="/subtopics/${sanitizeText(topic.id)}"
            role="button"
            tabindex="0"
            aria-label="${sanitizeText(topic.title)}, ${topic.subtopic_count} subtopics"
        >
            <span class="topic-order">${topic.order}</span>
            <div class="topic-card-body">
                <h3 class="topic-title">
                    ${sanitizeText(topic.title)}
                </h3>
                <span class="topic-subtopic-count">
                    ${topic.subtopic_count} subtopics
                </span>
            </div>
            <span class="topic-card-chevron">›</span>
        </div>
    `
}


/**
 * SubtopicCard()
 *
 * Displays a single subtopic as a tappable card.
 * Shows the subtopic title and keyword tags so students
 * know what will be covered before they tap.
 * Used on the subtopics screen.
 *
 * @param {Object}   subtopic          - Subtopic data from the API
 * @param {string}   subtopic.id       - Subtopic UUID
 * @param {string}   subtopic.title    - Subtopic title
 * @param {string[]} subtopic.keywords - Array of keyword strings
 * @returns {string} - HTML string
 */
function SubtopicCard(subtopic) {
    // Build keyword tags — show max 3 to avoid overcrowding
    const visibleKeywords = (subtopic.keywords || []).slice(0, 3)

    const keywordTagsHTML = visibleKeywords
        .map(keyword => `
            <span class="keyword-tag">
                ${sanitizeText(keyword)}
            </span>
        `)
        .join("")

    return `
        <div
            class="subtopic-card"
            data-navigate="/content/${sanitizeText(subtopic.id)}"
            role="button"
            tabindex="0"
            aria-label="Study ${sanitizeText(subtopic.title)}"
        >
            <div class="subtopic-card-body">
                <h3 class="subtopic-title">
                    ${sanitizeText(subtopic.title)}
                </h3>
                <div class="keyword-tags">
                    ${keywordTagsHTML}
                </div>
            </div>
            <span class="subtopic-card-chevron">›</span>
        </div>
    `
}


/**
 * ContentTabs()
 *
 * The three tab buttons on the content screen.
 * Notes, Summary, and Questions.
 * The active tab is visually highlighted.
 *
 * @param {string} activeTab - The currently active tab name
 * @returns {string} - HTML string
 */
function ContentTabs(activeTab) {
    const tabs = [
        {
            id:    NaijaLearnConfig.CONTENT_TABS.NOTES,
            label: "📖 Notes"
        },
        {
            id:    NaijaLearnConfig.CONTENT_TABS.SUMMARY,
            label: "⚡ Summary"
        },
        {
            id:    NaijaLearnConfig.CONTENT_TABS.QUESTIONS,
            label: "✏️ Questions"
        },
    ]

    const tabButtonsHTML = tabs
        .map(tab => `
            <button
                class="content-tab ${tab.id === activeTab ? "content-tab--active" : ""}"
                data-tab="${tab.id}"
                aria-selected="${tab.id === activeTab}"
            >
                ${tab.label}
            </button>
        `)
        .join("")

    return `
        <div class="content-tabs" role="tablist">
            ${tabButtonsHTML}
        </div>
    `
}


/**
 * ContentBody()
 *
 * Displays the AI-generated content text.
 * Formats the content with proper line breaks
 * so it is easy to read on mobile.
 *
 * Security note: content comes from the Groq AI API.
 * We use sanitizeText() on the full content before
 * injecting it to prevent any XSS vulnerabilities.
 *
 * @param {string} content - The AI-generated text content
 * @returns {string} - HTML string
 */
function ContentBody(content) {
    // Convert newlines to <br> tags for proper display
    // First sanitize the raw content, then add line breaks
    const formattedContent = sanitizeText(content)
        .replace(/\n\n/g, "</p><p>")
        .replace(/\n/g, "<br>")

    return `
        <div class="content-body">
            <p>${formattedContent}</p>
        </div>
    `
}


/**
 * sanitizeText()
 *
 * Converts potentially dangerous characters into safe
 * HTML entities before injecting into the DOM.
 *
 * This prevents XSS attacks — if the AI-generated content
 * or any API data contains HTML tags or script tags,
 * they will be displayed as plain text, never executed.
 *
 * Example:
 *   sanitizeText("<script>alert('hacked')</script>")
 *   returns: "&lt;script&gt;alert('hacked')&lt;/script&gt;"
 *
 * @param {any} value - The value to sanitize
 * @returns {string} - Safe string for DOM injection
 */
function sanitizeText(value) {
    // Convert to string first in case a number or
    // other type is passed accidentally
    const str = String(value)

    return str
        .replace(/&/g,  "&amp;")
        .replace(/</g,  "&lt;")
        .replace(/>/g,  "&gt;")
        .replace(/"/g,  "&quot;")
        .replace(/'/g,  "&#039;")
}