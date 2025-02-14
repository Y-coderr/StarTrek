import { NextResponse } from "next/server"
import createFaceClient from "@azure-rest/ai-vision-face"
import { AzureKeyCredential } from "@azure/core-auth"

const PERSON_GROUP_ID = "auth-group"
const endpoint = process.env.AZURE_FACE_ENDPOINT || ""
const apiKey = process.env.AZURE_FACE_KEY || ""
const client = createFaceClient(endpoint, new AzureKeyCredential(apiKey))

export async function POST(request: Request) {
  try {
    const { personId, imageUrl } = await request.json()
    if (!personId || !imageUrl) {
      return NextResponse.json({ message: "personId and imageUrl are required" }, { status: 400 })
    }

    const response = await client
      .path("/largepersongroups/{largePersonGroupId}/persons/{personId}/persistedfaces", PERSON_GROUP_ID, personId)
      .post({
        queryParameters: { detectionModel: "detection_03" },
        body: { url: imageUrl },
      })

    return NextResponse.json({
      message: "Face added successfully",
      persistedFaceId: response.body.persistedFaceId,
    })
  } catch (error) {
    console.error("Error adding face:", error)
    return NextResponse.json({ message: "Error adding face" }, { status: 500 })
  }
}

