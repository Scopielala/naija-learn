/**
 * api.js
 *
 * Handles all communication between the frontend and
 * the Naija Learn backend API.
 *
 * Every function in this file:
 * - Makes exactly one API call
 * - Returns the data on success
 * - Throws a clear error message on failure
 *
 * No other file makes fetch() calls directly.
 * All API communication goes through here.
 *
 * This means if the API URL or structure ever changes,
 * only this file needs to be updated.
 */


/**
 * apiRequest()
 *
 * The base function that all other API functions use.
 * Handles the fetch call, error checking, and JSON parsing
 * in one place so we never repeat that logic.
 *
 * @param {string} endpoint - The API endpoint path
 * @returns {Promise<any>} - The data from the API response
 * @throws {Error} - If the request fails for any reason
 */
async function apiRequest(endpoint) {
    // Build the full URL by combining base URL and endpoint
    const fullUrl = NaijaLearnConfig.API_BASE_URL + endpoint

    if (NaijaLearnConfig.DEBUG_MODE) {
        console.log(`[API Request] GET ${fullUrl}`)
    }

    try {
        const response = await fetch(fullUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
        })

        // fetch() does not throw on HTTP errors like 404 or 500
        // We must check response.ok manually
        // response.ok is true for status codes 200-299
        if (!response.ok) {
            throw new Error(
                `Request failed: ${response.status} ${response.statusText} — ${fullUrl}`
            )
        }

        // Parse the JSON response
        const jsonResponse = await response.json()

        if (NaijaLearnConfig.DEBUG_MODE) {
            console.log(`[API Response]`, jsonResponse)
        }

        // Our backend always wraps data in APIResponse:
        // { success: true, message: "...", data: [...] }
        // We return only the data field — callers get
        // clean data without the wrapper
        return jsonResponse.data

    } catch (error) {
        // Re-throw with a clear message so the calling
        // function knows exactly what went wrong
        if (NaijaLearnConfig.DEBUG_MODE) {
            console.error(`[API Error]`, error.message)
        }
        throw new Error(
            `Could not connect to Naija Learn server. 
             Please check your connection and try again.`
        )
    }
}


/**
 * fetchAllSubjects()
 *
 * Fetches all available subjects from the backend.
 * Called when the student reaches the subjects screen.
 *
 * @returns {Promise<Array>} - List of subject objects
 */
async function fetchAllSubjects() {
    return await apiRequest(
        NaijaLearnConfig.ENDPOINTS.ALL_SUBJECTS
    )
}


/**
 * fetchTopicsBySubject()
 *
 * Fetches all topics for a given subject.
 * Called when the student selects a subject.
 *
 * @param {string} subjectId - The UUID of the selected subject
 * @returns {Promise<Array>} - List of topic objects with subtopic counts
 */
async function fetchTopicsBySubject(subjectId) {
    return await apiRequest(
        NaijaLearnConfig.ENDPOINTS.TOPICS_BY_SUBJECT(subjectId)
    )
}


/**
 * fetchSubtopicsByTopic()
 *
 * Fetches all subtopics under a given topic.
 * Called when the student selects a topic.
 *
 * @param {string} topicId - The UUID of the selected topic
 * @returns {Promise<Array>} - List of subtopic objects with keywords
 */
async function fetchSubtopicsByTopic(topicId) {
    return await apiRequest(
        NaijaLearnConfig.ENDPOINTS.SUBTOPICS_BY_TOPIC(topicId)
    )
}


/**
 * fetchSubtopicContent()
 *
 * Fetches AI-generated content for a subtopic.
 * The contentType parameter determines what is generated:
 * - "notes"     → full structured explanation
 * - "summary"   → brief revision summary
 * - "questions" → 5 WAEC-style practice questions
 *
 * First request triggers AI generation and caching.
 * Subsequent requests return the cached version instantly.
 *
 * @param {string} subtopicId  - The UUID of the selected subtopic
 * @param {string} contentType - One of "notes", "summary", "questions"
 * @returns {Promise<Object>}  - Content object with generated text
 */
async function fetchSubtopicContent(subtopicId, contentType) {
    // Select the right endpoint based on content type
    const endpointBuilders = {
        [NaijaLearnConfig.CONTENT_TABS.NOTES]:
            NaijaLearnConfig.ENDPOINTS.SUBTOPIC_NOTES,
        [NaijaLearnConfig.CONTENT_TABS.SUMMARY]:
            NaijaLearnConfig.ENDPOINTS.SUBTOPIC_SUMMARY,
        [NaijaLearnConfig.CONTENT_TABS.QUESTIONS]:
            NaijaLearnConfig.ENDPOINTS.SUBTOPIC_QUESTIONS,
    }

    const endpointBuilder = endpointBuilders[contentType]

    // Guard — if an invalid contentType is passed, fail clearly
    if (!endpointBuilder) {
        throw new Error(
            `Invalid content type "${contentType}". ` +
            `Must be one of: ${Object.keys(endpointBuilders).join(", ")}`
        )
    }

    return await apiRequest(endpointBuilder(subtopicId))
}