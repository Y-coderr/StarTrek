// app/api/process-audio/route.js
import { mkdir } from "fs/promises";
import { writeFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Create audio directory if it doesn't exist
    const audioDir = join(process.cwd(), "public", "audio");
    try {
      await mkdir(audioDir, { recursive: true });
    } catch (err) {
      if (err.code !== "EEXIST") throw err;
    }

    const data = await req.blob();
    const fileName = `audio_${Date.now()}.webm`;
    const audioPath = join(audioDir, fileName);

    // Convert blob to buffer and save
    const buffer = Buffer.from(await data.arrayBuffer());
    await writeFile(audioPath, buffer);

    return NextResponse.json({
      success: true,
      path: `/audio/${fileName}`,
    });
  } catch (error) {
    console.error("Error processing audio:", error);
    return NextResponse.json(
      { error: "Error processing audio" },
      { status: 500 }
    );
  }
}
