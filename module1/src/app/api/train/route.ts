import { NextResponse } from "next/server"
import createFaceClient from "@azure-rest/ai-vision-face"
import { AzureKeyCredential } from "@azure/core-auth"

const PERSON_GROUP_ID = "auth-group"
const endpoint = process.env.AZURE_FACE_ENDPOINT || ""
const apiKey = process.env.AZURE_FACE_KEY || ""
const client = createFaceClient(endpoint, new AzureKeyCredential(apiKey))

export async function POST() {
  try {
    await client.path("/largepersongroups/{largePersonGroupId}/train", PERSON_GROUP_ID).post()

    return NextResponse.json({ message: "Training started successfully" })
  } catch (error) {
    console.error("Error starting training:", error)
    return NextResponse.json({ message: "Error starting training" }, { status: 500 })
  }
}

