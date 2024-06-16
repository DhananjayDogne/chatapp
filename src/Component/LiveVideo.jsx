import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8000');

const App = () => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const [room, setRoom] = useState('');

    useEffect(() => {
        if (room) {
            const constraints = { video: true, audio: { echoCancellation: true } };

            navigator.mediaDevices.getUserMedia(constraints)
                .then(stream => {
                    localVideoRef.current.srcObject = stream;

                    const peerConnection = new RTCPeerConnection();
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

                    socket.on('offer', ({ offer }) => {
                        peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
                        peerConnection.createAnswer()
                            .then(answer => {
                                peerConnection.setLocalDescription(answer);
                                socket.emit('answer', { answer, room });
                            });
                    });

                    socket.on('answer', ({ answer }) => {
                        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                    });

                    socket.on('candidate', ({ candidate }) => {
                        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                    });

                    peerConnectionRef.current = peerConnection;
                })
                .catch(error => {
                    console.error('Error accessing display media.', error);
                });
        }

        return () => {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, [room]);

    const joinRoom = () => {
        const roomId = prompt('Enter room ID:');
        setRoom(roomId);
        socket.emit('join-room', roomId);
    };

    return (
        <div className="my-10 flex flex-col items-center justify-center bg-gray-100">
            <button onClick={joinRoom} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
                Join Room
            </button>
            <div className="grid">
                <video ref={localVideoRef} controls autoPlay  className="w-[5rem] p-2 border rounded" />
                <video ref={remoteVideoRef} controls autoPlay className="w-[5rem] p-2 border rounded" />
            </div>
        </div>
    );
};

export default App;
