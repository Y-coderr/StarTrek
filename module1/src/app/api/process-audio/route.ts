import { NextRequest, NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

export const dynamic = "force-dynamic"; // Ensure API route is dynamic
export const config = { api: { bodyParser: false } }; // Disable built-in body parser

export async function POST(req: NextRequest) {
  try {
    if (req.method !== "POST") {
      return NextResponse.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    // Convert request body into a readable stream
    const stream = Readable.from(req.body as any);

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // Initialize formidable with upload directory
    const form = formidable({ multiples: false, uploadDir });

    // Parse the form data from the stream
    const parseForm = () =>
      new Promise<{ fields: formidable.Fields; files: formidable.Files }>(
        (resolve, reject) => {
          form.parse(stream, (err, fields, files) => {
            if (err) reject(err);
            else resolve({ fields, files });
          });
        }
      );

    const { files } = await parseForm();

    if (!files.audio) {
      return NextResponse.json(
        { error: "No audio file uploaded" },
        { status: 400 }
      );
    }

    // Get uploaded file path
    const audioFile = files.audio as formidable.File;
    const tempPath = audioFile.filepath;
    const newFilePath = path.join(
      uploadDir,
      audioFile.originalFilename || "uploaded_audio.mp3"
    );

    // Move file to permanent location
    fs.renameSync(tempPath, newFilePath);

    return NextResponse.json({
      message: "Audio uploaded successfully!",
      filePath: newFilePath,
    });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Error processing audio file" },
      { status: 500 }
    );
  }
}
