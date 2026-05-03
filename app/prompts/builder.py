def build_notes_prompt(
        subject: str,
        topic: str,
        subtopic: str,
        exam_body: str,
        keywords: list[str]
) -> str:
    """
    Builds a prompt that instructs the AI to generate structured notes for a given subtopic
    The keywords pulled from the database ensure the AI covers exactly what the syllabus requires
    """
    keywords_str = ", ".join(keywords) if keywords else subtopic
    return f"""You are an expert {subject} tutor helping Nigerian secondary school students
prepare for {exam_body} examinations.

Generate comprehensive and well-structured notes on the following:

Subject: {subject}
Topic: {topic}
Subtopic: {subtopic}
Keywords to cover: {keywords_str}

Instructions:
- Write clearly and simply for a secondary school student
- Use Nigerian market examples and real-life scenarios where possible
- Structure your response with these exact sections:
  1. Definition
  2. Explanation
  3. Nigerian Example
  4. Key Points (bullet points)
- Cover all the keywords listed above
- Keep the tone educational but conversational
- Do not include an introduction or conclusion outside the sections above
""".strip()

def build_summary_prompt(
        subject: str,
        topic: str,
        subtopic: str,
        exam_body: str,
        keywords: list[str]
) -> str:
    """
    Builds a prompt that instructs the AI to generate a brief,
    exam-focused summary. Ideal for quick revision before an exam.
    """
    keywords_str = ", ".join(keywords) if keywords else subtopic
    return f"""You are an expert {subject} tutor helping Nigerian secondary school students
prepare for {exam_body} examinations.

Generate a concise revision summary on the following:

Subject: {subject}
Topic: {topic}
Subtopic: {subtopic}
Keywords to cover: {keywords_str}

Instructions:
- Write 4 to 6 clear sentences maximum
- Focus only on the most important points a {exam_body} student must know
- Use simple, direct language
- Cover all the keywords listed above
- This summary will be used for last-minute exam revision so make every
  sentence count
"""

def build_questions_prompt(
    subject: str,
    topic: str,
    subtopic: str,
    exam_body: str,
    keywords: list[str]
) -> str:
    """
    Builds a prompt that instructs the AI to generate practice questions
    in the style of real WAEC past questions with full explanations.
    """
    keywords_str = ", ".join(keywords) if keywords else subtopic

    return f"""
You are an expert {subject} tutor helping Nigerian secondary school students
prepare for {exam_body} examinations.

Generate 5 practice questions on the following:

Subject: {subject}
Topic: {topic}
Subtopic: {subtopic}
Keywords to cover: {keywords_str}

Instructions:
- Write questions in the style of real {exam_body} past questions
- Each question must be multiple choice with 4 options (A, B, C, D)
- After all 5 questions provide an Answers section
- In the Answers section explain WHY each correct answer is right
- Questions must test understanding not just memorization
- Cover the keywords listed above across the 5 questions
- Number each question clearly: 1, 2, 3, 4, 5
""".strip()

def build_prompt(
    content_type: str,
    subject: str,
    topic: str,
    subtopic: str,
    exam_body: str,
    keywords: list[str]
) -> str:
    """
    Master function — selects the right prompt builder based on
    the content type requested. This is the only function the
    service layer needs to call.

    content_type options: "notes", "summary", "questions"
    """
    builders = {
        "notes": build_notes_prompt,
        "summary": build_summary_prompt,
        "questions": build_questions_prompt,
    }

    builder = builders.get(content_type)

    if not builder:
        raise ValueError(
            f"Invalid content_type '{content_type}'. "
            f"Must be one of: {list(builders.keys())}"
        )

    return builder(
        subject=subject,
        topic=topic,
        subtopic=subtopic,
        exam_body=exam_body,
        keywords=keywords
    )