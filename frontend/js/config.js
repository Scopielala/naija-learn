/**
 * config.js
 *
 * Central configuration for the Naija Learn frontend.
 * Any value that might change between environments
 * (development, production) lives here.
 *
 * When deploying to production, only this file needs
 * to be updated — nothing else changes.
 */

const NaijaLearnConfig = {

    // Base URL for all API calls
    API_BASE_URL: "http://127.0.0.1:8000/api/v1",

    // API endpoints — named exactly what they do
    // so any developer can read these and understand immediately
    ENDPOINTS: {
        ALL_SUBJECTS:           "/subjects",
        SUBJECT_BY_ID:          (subjectId) => `/subjects/${subjectId}`,
        TOPICS_BY_SUBJECT:      (subjectId) => `/subjects/${subjectId}/topics`,
        SUBTOPICS_BY_TOPIC:     (topicId)   => `/topics/${topicId}/subtopics`,
        SUBTOPIC_NOTES:         (subtopicId) => `/subtopics/${subtopicId}/notes`,
        SUBTOPIC_SUMMARY:       (subtopicId) => `/subtopics/${subtopicId}/summary`,
        SUBTOPIC_QUESTIONS:     (subtopicId) => `/subtopics/${subtopicId}/questions`,
    },

    // Content tab identifiers
    // Used across screens.js, events.js, and state.js
    CONTENT_TABS: {
        NOTES:     "notes",
        SUMMARY:   "summary",
        QUESTIONS: "questions",
    },

    // Screen names — used by the router and state
    // to know which screen to render
    SCREENS: {
        LANDING:   "landing",
        SUBJECTS:  "subjects",
        TOPICS:    "topics",
        SUBTOPICS: "subtopics",
        CONTENT:   "content",
    },

    // Application metadata
    APP_NAME:    "Naija Learn",
    APP_TAGLINE: "Study smarter. Exam ready.",

    DEBUG_MODE: false, 
}

// Freeze the config so nothing can accidentally modify it
// at runtime — config should always be read-only
Object.freeze(NaijaLearnConfig)
Object.freeze(NaijaLearnConfig.ENDPOINTS)
Object.freeze(NaijaLearnConfig.CONTENT_TABS)
Object.freeze(NaijaLearnConfig.SCREENS)