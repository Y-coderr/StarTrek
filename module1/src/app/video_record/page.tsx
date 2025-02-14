'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function VideoToText() {
        const [isRecording, setIsRecording] = useState(false);
        const [transcribedText, setTranscribedText] = useState('');
        const [uploadStatus, setUploadStatus] = useState('');
        const videoRef = useRef(null);
        const mediaRecorderRef = useRef(null);
        const videoChunksRef = useRef([]);
        const audioChunksRef = useRef([]);

        useEffect(() => {
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

                        // Create video recorder
                        const videoRecorder = new MediaRecorder(stream, {
                                mimeType: 'video/webm'
                        });

                        // Create audio recorder from the same stream
                        const audioStream = new MediaStream(stream.getAudioTracks());
                        const audioRecorder = new MediaRecorder(audioStream, {
                                mimeType: 'audio/webm'
                        });

                        videoRecorder.ondataavailable = (event) => {
                                if (event.data.size > 0) {
                                        videoChunksRef.current.push(event.data);
                                }
                        };

                        audioRecorder.ondataavailable = (event) => {
                                if (event.data.size > 0) {
                                        audioChunksRef.current.push(event.data);
                                }
                        };

                        mediaRecorderRef.current = {
                                videoRecorder,
                                audioRecorder
                        };

                        videoRecorder.start(1000);
                        audioRecorder.start(1000);
                        setIsRecording(true);
                        setUploadStatus('');
                } catch (err) {
                        console.error("Error accessing media devices:", err);
                        setUploadStatus('Error accessing media devices');
                }
        };

        const stopCapture = () => {
                if (mediaRecorderRef.current && isRecording) {
                        const { videoRecorder, audioRecorder } = mediaRecorderRef.current;

                        videoRecorder.onstop = async () => {
                                await saveVideo();
                        };

                        audioRecorder.onstop = async () => {
                                await processAudioAndTranscribe();
                        };

                        videoRecorder.stop();
                        audioRecorder.stop();

                        const tracks = videoRef.current.srcObject.getTracks();
                        tracks.forEach(track => track.stop());
                        setIsRecording(false);
                }
        };

        const saveVideo = async () => {
                try {
                        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });

                        const response = await fetch('/api/save-video', {
                                method: 'POST',
                                body: videoBlob,
                                headers: {
                                        'Content-Type': 'video/webm',
                                },
                        });

                        if (!response.ok) {
                                throw new Error('Failed to save video');
                        }

                        setUploadStatus('Video saved successfully!');
                        videoChunksRef.current = [];
                } catch (err) {
                        console.error("Error saving video:", err);
                        setUploadStatus('Error saving video');
                }
        };

        const processAudioAndTranscribe = async () => {
                try {
                        setUploadStatus('Processing audio...');
                        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                        const response = await fetch('/api/process-audio', {
                                method: 'POST',
                                body: audioBlob,
                                headers: {
                                        'Content-Type': 'audio/webm',
                                },
                        });

                        const data = await response.json();

                        if (response.ok) {
                                setUploadStatus('Audio processed and transcribed successfully!');
                                setTranscribedText(prevText => prevText + ' ' + (data.text || ''));
                        } else {
                                throw new Error(data.error || 'Processing failed');
                        }

                        audioChunksRef.current = [];
                } catch (err) {
                        console.error("Error processing audio:", err);
                        setUploadStatus('Error processing audio');
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

                                                <div className="flex flex-col items-center gap-4">
                                                        <div className="flex gap-4">
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
                                                        {uploadStatus && (
                                                                <p className={`text-sm ${uploadStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
                                                                        {uploadStatus}
                                                                </p>
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