// components/Camera.jsx
import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, VideoOff, Camera as CameraIcon } from 'lucide-react';

const Camera = ({ isActive, onStart, onStop, onCapture }) => {
        const videoRef = useRef(null);

        useEffect(() => {
                return () => {
                        if (videoRef.current?.srcObject) {
                                videoRef.current.srcObject.getTracks().forEach(track => track.stop());
                        }
                };
        }, []);

        return (
                <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
                                <video
                                        ref={videoRef}
                                        className="w-full h-full object-cover"
                                        autoPlay
                                        playsInline
                                />
                                {!isActive && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 text-white">
                                                Camera is off
                                        </div>
                                )}
                        </div>

                        <div className="flex space-x-4">
                                <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onStart(videoRef)}
                                        disabled={isActive}
                                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg ${isActive
                                                        ? 'bg-gray-300 cursor-not-allowed'
                                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                                }`}
                                >
                                        <Video size={20} />
                                        <span>Start Camera</span>
                                </motion.button>

                                <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onCapture(videoRef)}
                                        disabled={!isActive}
                                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg ${!isActive
                                                        ? 'bg-gray-300 cursor-not-allowed'
                                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                }`}
                                >
                                        <CameraIcon size={20} />
                                        <span>Capture</span>
                                </motion.button>

                                <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => onStop(videoRef)}
                                        disabled={!isActive}
                                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg ${!isActive
                                                        ? 'bg-gray-300 cursor-not-allowed'
                                                        : 'bg-red-500 hover:bg-red-600 text-white'
                                                }`}
                                >
                                        <VideoOff size={20} />
                                        <span>Stop Camera</span>
                                </motion.button>
                        </div>
                </div>
        );
};

export default Camera;