import httpx
from app.config import settings


GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


async def generate_content(prompt: str) -> str:
    """
    Sends a prompt to the Groq API and returns the generated text.
    Groq hosts open source models like LLaMA 3.3 and returns
    responses extremely fast.

    Args:
        prompt: The fully assembled prompt string from the prompt builder

    Returns:
        The generated text content from the AI model

    Raises:
        httpx.HTTPStatusError: If the API returns an error response
        ValueError: If the response structure is unexpected
    """
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
    }

    # Groq uses the OpenAI-compatible messages format
    
    payload = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 1024,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            GROQ_API_URL,
            headers=headers,
            json=payload,
            timeout=30.0
        )

        # Raise an exception if the API returned an error status
        response.raise_for_status()

        data = response.json()

        # Extract the generated text from Groq's response structure
        try:
            generated_text = (
                data["choices"][0]["message"]["content"]
            )
            return generated_text.strip()

        except (KeyError, IndexError) as e:
            raise ValueError(
                f"Unexpected response structure from Groq API: {e}\n"
                f"Full response: {data}"
            )