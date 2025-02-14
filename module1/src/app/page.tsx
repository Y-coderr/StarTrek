"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"

export default function Home() {
        const [capturedImage, setCapturedImage] = useState<string | null>(null)
        const [result, setResult] = useState<string>("")
        const [personName, setPersonName] = useState<string>("")
        const [imageUrl, setImageUrl] = useState<string>("")
        const videoRef = useRef<HTMLVideoElement>(null)
        const canvasRef = useRef<HTMLCanvasElement>(null)

        useEffect(() => {
                initCamera()
        }, [])

        async function initCamera() {
                try {
                        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
                        if (videoRef.current) {
                                videoRef.current.srcObject = stream
                        }
                } catch (err) {
                        setResult("Error accessing camera: " + (err as Error).message)
                }
        }

        function captureImage() {
                if (videoRef.current && canvasRef.current) {
                        const context = canvasRef.current.getContext("2d")
                        if (context) {
                                canvasRef.current.width = videoRef.current.videoWidth
                                canvasRef.current.height = videoRef.current.videoHeight
                                context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
                                const capturedDataUrl = canvasRef.current.toDataURL("image/jpeg")
                                setCapturedImage(capturedDataUrl)
                                setResult("Image captured successfully!")
                        }
                }
        }

        async function verifyFace() {
                if (!capturedImage) {
                        setResult("Please capture an image first")
                        return
                }

                try {
                        const response = await fetch("/api/verify", {
                                method: "POST",
                                headers: {
                                        "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ image: capturedImage }),
                        })

                        const data = await response.json()
                        setResult(data.message)
                } catch (err) {
                        setResult("Error verifying face: " + (err as Error).message)
                }
        }

        async function addPerson() {
                if (!personName) {
                        setResult("Please enter your name")
                        return
                }

                try {
                        const response = await fetch("/api/addPerson", {
                                method: "POST",
                                headers: {
                                        "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ name: personName }),
                        })

                        const data = await response.json()
                        setResult(data.message)
                        if (data.personId) {
                                localStorage.setItem("personId", data.personId)
                        }
                } catch (err) {
                        setResult("Error adding person: " + (err as Error).message)
                }
        }

        async function addFace() {
                const personId = localStorage.getItem("personId")

                if (!personId || !imageUrl) {
                        setResult("Please add a person first and provide an image URL")
                        return
                }

                try {
                        const response = await fetch("/api/addFace", {
                                method: "POST",
                                headers: {
                                        "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ personId, imageUrl }),
                        })

                        const data = await response.json()
                        setResult(data.message)
                } catch (err) {
                        setResult("Error adding face: " + (err as Error).message)
                }
        }

        async function trainModel() {
                try {
                        const response = await fetch("/api/train", {
                                method: "POST",
                        })

                        const data = await response.json()
                        setResult(data.message)
                } catch (err) {
                        setResult("Error training model: " + (err as Error).message)
                }
        }

        return (
                <main className="flex min-h-screen flex-col items-center justify-between p-24">
                        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
                                <h1 className="text-4xl font-bold mb-8">Face Authentication</h1>
                                <div className="mb-8">
                                        <video ref={videoRef} autoPlay className="mb-4 border border-gray-300"></video>
                                        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                                        <div className="flex gap-4">
                                                <Button onClick={captureImage}>Capture Image</Button>
                                                <Button onClick={verifyFace}>Verify Face</Button>
                                        </div>
                                </div>

                                <div className="mb-8">
                                        <h2 className="text-2xl font-semibold mb-4">Training Section</h2>
                                        <div className="flex gap-4 mb-4">
                                                <Input
                                                        type="text"
                                                        placeholder="Enter your name"
                                                        value={personName}
                                                        onChange={(e) => setPersonName(e.target.value)}
                                                />
                                                <Button onClick={addPerson}>Add Person</Button>
                                        </div>
                                        <div className="flex gap-4 mb-4">
                                                <Input
                                                        type="text"
                                                        placeholder="Enter image URL"
                                                        value={imageUrl}
                                                        onChange={(e) => setImageUrl(e.target.value)}
                                                />
                                                <Button onClick={addFace}>Add Face</Button>
                                        </div>
                                        <Button onClick={trainModel}>Train Model</Button>
                                </div>

                                <div className="mt-8">
                                        <h3 className="text-xl font-semibold mb-2">Result:</h3>
                                        <p>{result}</p>
                                </div>
                        </div>
                </main>
        )
}

