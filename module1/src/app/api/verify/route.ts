import { NextResponse } from "next/server"
import createFaceClient from "@azure-rest/ai-vision-face"
import { AzureKeyCredential } from "@azure/core-auth"

const PERSON_GROUP_ID = "auth-group"
const endpoint = process.env.AZURE_FACE_ENDPOINT || ""
const apiKey = process.env.AZURE_FACE_KEY || ""
const client = createFaceClient(endpoint, new AzureKeyCredential(apiKey))

export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    const detectResponse = await client.path("/detect").post({
      contentType: "application/json",
      queryParameters: {
        detectionModel: "detection_03",
        recognitionModel: "recognition_04",
        returnFaceId: true,
      },
      body: { url: image },
    })

    if (!detectResponse.body || detectResponse.body.length === 0) {
      return NextResponse.json({ message: "No face detected in the image" }, { status: 400 })
    }

    const faceId = detectResponse.body[0].faceId

    const verifyResponse = await client.path("/verify").post({
      body: {
        faceId: faceId,
        largePersonGroupId: PERSON_GROUP_ID,
      },
    })

    if (verifyResponse.body.isIdentical) {
      return NextResponse.json({
        message: `Authentication successful! Confidence: ${verifyResponse.body.confidence}`,
      })
    } else {
      return NextResponse.json({
        message: "Authentication failed. Face does not match.",
      })
    }
  } catch (error) {
    console.error("Error in verification:", error)
    return NextResponse.json({ message: "Error processing verification request" }, { status: 500 })
  }
}

