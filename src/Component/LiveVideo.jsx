import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

// for icon
import { FaCopy } from "react-icons/fa";
import { MdCallEnd } from "react-icons/md";

const socket = io('http://localhost:8000');

const LiveVideo = () => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const [room, setRoom] = useState('');
    const [isScreen, setIsScreen] = useState(true);

    const peerConnectionConfig = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    };

    useEffect(() => {
        if (room) {
            const constraints = isScreen 
                ? { video: { mediaSource: 'screen' }, audio: { echoCancellation: true, noiseSuppression: true } }
                : { video: true, audio: { echoCancellation: true } };

            const getMedia = isScreen ? 'getDisplayMedia' : 'getUserMedia';

            navigator.mediaDevices[getMedia](constraints)
                .then(stream => {
                    handleMediaStream(stream);
                })
                .catch(error => {
                    console.error('Error accessing media devices:', error);
                });

            return () => {
                if (peerConnectionRef.current) {
                    peerConnectionRef.current.close();
                }
            };
        }
    }, [room, isScreen]);

    useEffect(() => {
        const handleOffer = ({ offer }) => {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
                peerConnectionRef.current.createAnswer()
                    .then(answer => {
                        peerConnectionRef.current.setLocalDescription(answer);
                        socket.emit('answer', { answer, room });
                    });
            }
        };

        const handleAnswer = ({ answer }) => {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        };

        const handleCandidate = ({ candidate }) => {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        };

        socket.on('offer', handleOffer);
        socket.on('answer', handleAnswer);
        socket.on('candidate', handleCandidate);

        return () => {
            socket.off('offer', handleOffer);
            socket.off('answer', handleAnswer);
            socket.off('candidate', handleCandidate);
        };
    }, [room]);

    const handleMediaStream = (stream) => {
        localVideoRef.current.srcObject = stream;

        const peerConnection = new RTCPeerConnection(peerConnectionConfig);
        stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
        });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('candidate', { candidate: event.candidate, room });
            }
        };

        peerConnection.ontrack = (event) => {
            remoteVideoRef.current.srcObject = event.streams[0];
        };

        peerConnection.createOffer()
            .then(offer => {
                peerConnection.setLocalDescription(offer);
                socket.emit('offer', { offer, room });
            });

        peerConnectionRef.current = peerConnection;
    };

    const joinRoom = () => {
        const roomId = prompt('Enter room ID:');
        setRoom(roomId);
        socket.emit('join-room', roomId);
    };

    const createRoom = () => {
        const roomId = Math.random().toString(16).substring(2);
        setRoom(roomId);
        socket.emit('create-room', roomId);
    };

    const handleCopyRoomId = () => {
        navigator.clipboard.writeText(room);
    };

    const endCall = () => {
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        if (localVideoRef.current.srcObject) {
            const tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
        }

        if (remoteVideoRef.current.srcObject) {
            remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
            remoteVideoRef.current.srcObject = null;
        }

        setRoom('');
    };

    return (
        <div className="my-10 flex flex-col items-center justify-center text-black bg-gray-100 min-h-screen">
            {room.length === 0 && (
                <div className="lg:flex max-w-xl w-full mx-auto my-4">
                    <label htmlFor="shareToggle" className="block my-auto font-medium text-gray-700">
                        Select Media Source:
                    </label>
                    <div className="flex ml-4 bg-green-100 p-1 rounded-full">
                        <span
                            className={`text-sm text-gray-500 m-auto cursor-pointer rounded-full p-2 ${
                                !isScreen ? "text-gray-600 font-bold bg-green-300" : ""
                            }`}
                            onClick={() => setIsScreen(false)}
                        >
                            Camera
                        </span>
                        <div className="w-[2rem] mx-2 text-green-400 p-3">
                            <input
                                type="range"
                                id="shareToggle"
                                min="0"
                                max="1"
                                step="1"
                                value={isScreen ? '1' : '0'}
                                onChange={(e) => setIsScreen(e.target.value === '1')}
                                style={{ width: "2rem", color: "green" }}
                                className="cursor-pointer"
                            />
                        </div>
                        <span
                            className={`text-sm text-gray-500 m-auto cursor-pointer rounded-full p-2 ${
                                isScreen ? "text-gray-600 font-bold bg-green-300" : ""
                            }`}
                            onClick={() => setIsScreen(true)}
                        >
                            Screen Sharing
                        </span>
                    </div>
                </div>
            )}
            <div className="max-w-xl w-full mx-auto">
                {room.length === 0 ? (
                    <div className="space-y-4">
                        <button
                            onClick={joinRoom}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300 ease-in-out"
                        >
                            Join Room
                        </button>
                        <button
                            onClick={createRoom}
                            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300 ease-in-out"
                        >
                            Create Room
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-md shadow-md">
                            <div className="text-lg font-medium text-gray-700 mb-2">Your Room ID:</div>
                            <div className="flex items-center space-x-2">
                                <div className="flex-1 bg-gray-100 p-2 rounded-md">{room}</div>
                                <button
                                    onClick={handleCopyRoomId}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300 ease-in-out"
                                >
                                    <FaCopy />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {room.length > 0 && (
                <>
                <div className="max-w-4xl w-full mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <video ref={localVideoRef} controls autoPlay className="w-full p-2 border rounded-md" />
                    <video ref={remoteVideoRef} controls autoPlay className="w-full p-2 border rounded-md" />
                   
                </div>
                 <button
                        onClick={endCall}
                        className=" m-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition duration-300 ease-in-out mt-4"
                    >
                        <MdCallEnd/>
                 </button>
                </>
            )}
        </div>
    );
};

export default LiveVideo;
