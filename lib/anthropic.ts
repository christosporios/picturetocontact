import { Anthropic } from "@anthropic-ai/sdk"

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const client = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
})

type ContactDetails = {
  name?: string
  phone?: string
  email?: string
  company?: string
  jobTitle?: string
  address?: string
  error?: string
}

export async function extractContactDetails(imageBase64: string): Promise<ContactDetails> {
  const prompt = `
    You are an AI assistant that extracts contact information from images of business cards.
    Please extract the following information if available:
    - Name
    - Phone number
    - Email address
    - Company name
    - Job title
    - Address

    Provide the information in a JSON format.
    If any information isonot available or unclear, leave the field empty.
    If you're unable to extract any information (e.g. card unreadable, or no card at all), extract the reason in a field "error".
    Reply only in JSON format.
  `
  try {
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    })

    if (response.content[0].type === "text") {
      console.log(response.content[0].text)
      return JSON.parse(response.content[0].text)
    } else {
      throw new Error("Unexpected response format")
    }
  } catch (error) {
    console.error("Error calling Anthropic API:", error)
    throw error
  }
}

