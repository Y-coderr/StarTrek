'use client'
// pages/index.js
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function VideoToText() {
        const [isRecording, setIsRecording] = useState(false);
        const [transcribedText, setTranscribedText] = useState('');
        const videoRef = useRef(null);
        const mediaRecorderRef = useRef(null);
        const chunksRef = useRef([]);

        useEffect(() => {
                // Clean up function to stop all media streams when component unmounts
                return () => {
                        if (videoRef.current && videoRef.current.srcObject) {
                                const tracks = videoRef.current.srcObject.getTracks();
                                tracks.forEach(track => track.stop());
                        }
                };
        }, []);

        const startCapture = async () => {
                try {
                        const stream = await navigator.mediaDevices.getUserMedia({
                                video: true,
                                audio: true
                        });

                        videoRef.current.srcObject = stream;

                        // Create MediaRecorder instance
                        mediaRecorderRef.current = new MediaRecorder(stream);

                        mediaRecorderRef.current.ondataavailable = (event) => {
                                if (event.data.size > 0) {
                                        chunksRef.current.push(event.data);
                                }
                        };

                        mediaRecorderRef.current.onstop = async () => {
                                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                                await processAudio(audioBlob);
                                chunksRef.current = [];
                        };

                        mediaRecorderRef.current.start();
                        setIsRecording(true);
                } catch (err) {
                        console.error("Error accessing media devices:", err);
                }
        };

        const stopCapture = () => {
                if (mediaRecorderRef.current && isRecording) {
                        mediaRecorderRef.current.stop();
                        const tracks = videoRef.current.srcObject.getTracks();
                        tracks.forEach(track => track.stop());
                        setIsRecording(false);
                }
        };

        const processAudio = async (audioBlob) => {
                try {
                        // Create a FormData object to send the audio file
                        const formData = new FormData();
                        formData.append('audio', audioBlob);

                        // Send the audio file to your API endpoint for processing
                        const response = await fetch('/api/process-audio', {
                                method: 'POST',
                                body: formData
                        });

                        const data = await response.json();
                        setTranscribedText(prevText => prevText + ' ' + data.text);
                } catch (err) {
                        console.error("Error processing audio:", err);
                }
        };

        return (
                <div className="container mx-auto p-4">
                        <Card className="mb-4">
                                <CardHeader>
                                        <CardTitle>Real-time Video to Text Converter</CardTitle>
                                </CardHeader>
                                <CardContent>
                                        <div className="space-y-4">
                                                <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                                        <video
                                                                ref={videoRef}
                                                                autoPlay
                                                                playsInline
                                                                muted
                                                                className="w-full h-full object-cover"
                                                        />
                                                </div>

                                                <div className="flex gap-4 justify-center">
                                                        {!isRecording ? (
                                                                <Button onClick={startCapture}>
                                                                        Start Recording
                                                                </Button>
                                                        ) : (
                                                                <Button onClick={stopCapture} variant="destructive">
                                                                        Stop Recording
                                                                </Button>
                                                        )}
                                                </div>

                                                <div className="mt-4">
                                                        <h3 className="text-lg font-semibold mb-2">Transcribed Text:</h3>
                                                        <div className="p-4 bg-gray-50 rounded-lg min-h-[100px] max-h-[300px] overflow-y-auto">
                                                                {transcribedText || 'No transcription yet...'}
                                                        </div>
                                                </div>
                                        </div>
                                </CardContent>
                        </Card>
                </div>
        );
}