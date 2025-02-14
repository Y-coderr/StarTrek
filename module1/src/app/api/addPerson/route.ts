import { NextResponse } from "next/server"
import createFaceClient from "@azure-rest/ai-vision-face"
import { AzureKeyCredential } from "@azure/core-auth"

const PERSON_GROUP_ID = "auth-group"
const endpoint = process.env.AZURE_FACE_ENDPOINT || ""
const apiKey = process.env.AZURE_FACE_KEY || ""
const client = createFaceClient(endpoint, new AzureKeyCredential(apiKey))

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 })
    }

    const response = await client
      .path("/largepersongroups/{largePersonGroupId}/persons", PERSON_GROUP_ID)
      .post({ body: { name } })

    return NextResponse.json({
      message: "Person added successfully",
      personId: response.body.personId,
    })
  } catch (error) {
    console.error("Error adding person:", error)
    return NextResponse.json({ message: "Error adding person" }, { status: 500 })
  }
}

