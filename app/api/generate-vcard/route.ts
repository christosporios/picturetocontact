import { NextResponse } from "next/server"
import vCardsJS from "vcards-js"
import { extractContactDetails } from "../../lib/anthropic"

export async function POST(request: Request) {
  const { image } = await request.json()

  try {
    const contactDetails = await extractContactDetails(image.split(",")[1]) // Remove the "data:image/jpeg;base64," prefix

    const vCard = vCardsJS()
    vCard.firstName = contactDetails.name?.split(" ")[0] || ""
    vCard.lastName = contactDetails.name?.split(" ").slice(1).join(" ") || ""
    vCard.organization = contactDetails.company || ""
    vCard.workPhone = contactDetails.phone || ""
    vCard.email = contactDetails.email || ""
    vCard.title = contactDetails.jobTitle || ""
    vCard.workAddress = contactDetails.address || ""

    // Add the image to the vCard
    vCard.photo.attachFromUrl(image, "JPEG")

    const vCardString = vCard.getFormattedString()

    return new NextResponse(JSON.stringify({ vcard: vCardString, details: contactDetails }), {
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error processing image:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to process image" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    })
  }
}

