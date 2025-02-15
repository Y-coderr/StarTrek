'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2, Mic, MicOff, Video, VideoOff } from 'lucide-react';

export default function VideoToText() {
        const [isRecording, setIsRecording] = useState(false);
        const [transcribedText, setTranscribedText] = useState('');
        const [uploadStatus, setUploadStatus] = useState('');
        const [isFullscreen, setIsFullscreen] = useState(false);
        const videoRef = useRef(null);
        const mediaRecorderRef = useRef(null);
        const videoChunksRef = useRef([]);
        const audioChunksRef = useRef([]);
        const recognitionRef = useRef(null);

        useEffect(() => {
                if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
                        const SpeechRecognition = window.webkitSpeechRecognition;
                        recognitionRef.current = new SpeechRecognition();
                        recognitionRef.current.continuous = true;
                        recognitionRef.current.interimResults = true;

                        recognitionRef.current.onresult = (event) => {
                                let interimTranscript = '';
                                let finalTranscript = '';

                                for (let i = event.resultIndex; i < event.results.length; i++) {
                                        const transcript = event.results[i][0].transcript;
                                        if (event.results[i].isFinal) {
                                                finalTranscript += transcript + ' ';
                                        } else {
                                                interimTranscript += transcript;
                                        }
                                }

                                if (finalTranscript) {
                                        setTranscribedText(prev => prev + finalTranscript);
                                }
                        };

                        recognitionRef.current.onerror = (event) => {
                                console.error('Speech recognition error:', event.error);
                                setUploadStatus('Error in speech recognition');
                        };
                }

                return () => {
                        if (videoRef.current?.srcObject) {
                                const tracks = videoRef.current.srcObject.getTracks();
                                tracks.forEach(track => track.stop());
                        }
                        if (recognitionRef.current) {
                                recognitionRef.current.stop();
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

                        const videoRecorder = new MediaRecorder(stream, {
                                mimeType: 'video/webm'
                        });

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

                        if (recognitionRef.current) {
                                recognitionRef.current.start();
                        }

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
                                await saveAudio();
                        };

                        if (recognitionRef.current) {
                                recognitionRef.current.stop();
                        }

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

                        if (!response.ok) throw new Error('Failed to save video');

                        setUploadStatus('Video saved successfully!');
                        videoChunksRef.current = [];
                } catch (err) {
                        console.error("Error saving video:", err);
                        setUploadStatus('Error saving video');
                }
        };

        const saveAudio = async () => {
                try {
                        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                        const response = await fetch('/api/process-audio', {
                                method: 'POST',
                                body: audioBlob,
                                headers: {
                                        'Content-Type': 'audio/webm',
                                },
                        });

                        if (!response.ok) throw new Error('Failed to save audio');

                        audioChunksRef.current = [];
                        if (transcribedText) {
                                alert('Transcribed Text:\n\n' + transcribedText);
                        }
                } catch (err) {
                        console.error("Error saving audio:", err);
                        setUploadStatus('Error saving audio');
                }
        };

        const toggleFullscreen = () => {
                setIsFullscreen(!isFullscreen);
        };

        return (
                <div className="container mx-auto p-4 min-h-screen flex items-center justify-center">
                        <Card className="w-full max-w-4xl transition-all duration-300 ease-in-out">
                                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600">
                                        <CardTitle className="text-white flex items-center justify-between">
                                                <span>Real-time Video to Text Converter</span>
                                                {isRecording && (
                                                        <div className="flex items-center gap-2">
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                <span className="text-sm">Recording...</span>
                                                        </div>
                                                )}
                                        </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                        <div className="space-y-6">
                                                <div
                                                        className={`relative transition-all duration-300 ease-in-out 
                ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full aspect-video bg-gray-100 rounded-lg overflow-hidden'}`}
                                                        onClick={toggleFullscreen}
                                                >
                                                        <video
                                                                ref={videoRef}
                                                                autoPlay
                                                                playsInline
                                                                muted
                                                                className={`w-full h-full object-cover transition-transform duration-300 
                  ${isFullscreen ? 'max-h-screen' : 'max-h-full'}`}
                                                        />
                                                        {!isRecording && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                                                                        <Video className="w-12 h-12 opacity-50" />
                                                                </div>
                                                        )}
                                                </div>

                                                <div className="flex flex-col items-center gap-4">
                                                        <div className="flex gap-4">
                                                                <Button
                                                                        onClick={isRecording ? stopCapture : startCapture}
                                                                        className={`transition-all duration-300 transform hover:scale-105 ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                                                                                }`}
                                                                >
                                                                        {isRecording ? (
                                                                                <div className="flex items-center gap-2">
                                                                                        <VideoOff className="w-4 h-4" />
                                                                                        <span>Stop Recording</span>
                                                                                </div>
                                                                        ) : (
                                                                                <div className="flex items-center gap-2">
                                                                                        <Video className="w-4 h-4" />
                                                                                        <span>Start Recording</span>
                                                                                </div>
                                                                        )}
                                                                </Button>
                                                        </div>
                                                        {uploadStatus && (
                                                                <p className={`text-sm animate-fade-in ${uploadStatus.includes('Error') ? 'text-red-500' : 'text-green-500'
                                                                        }`}>
                                                                        {uploadStatus}
                                                                </p>
                                                        )}
                                                </div>

                                                <div className="mt-4">
                                                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                                                <Mic className="w-4 h-4" />
                                                                Transcribed Text:
                                                        </h3>
                                                        <div className="p-4 bg-gray-50 rounded-lg min-h-[100px] max-h-[300px] overflow-y-auto transition-all duration-300 hover:shadow-md">
                                                                {transcribedText || (
                                                                        <div className="text-gray-400 flex items-center gap-2">
                                                                                <MicOff className="w-4 h-4" />
                                                                                <span>No transcription yet...</span>
                                                                        </div>
                                                                )}
                                                        </div>
                                                </div>
                                        </div>
                                </CardContent>
                        </Card>
                </div>
        );
}