import { useEffect, useState } from 'react';
import socketIO from 'socket.io-client';
import LiveVideo from './LiveVideo';
import { Link } from 'react-router-dom';

const socket = socketIO.connect('http://localhost:8000');

function Room() {
    const [type, setType] = useState('');
    const [message, setMessage] = useState([]);
    const [file, setFile] = useState(null);
    const [progress, setProgress] = useState(0);
    const [imageSrc, setImageSrc] = useState(null);

    const handleChange = (e) => {
        setType(e.target.value);
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        socket.emit('message', { id: socket.id, um: type });
        setType('');
    };

    const handleFileSubmit = (e) => {
        e.preventDefault();
        if (file) {
            const chunkSize = 64 * 1024; // 64KB per chunk
            const totalChunks = Math.ceil(file.size / chunkSize);
            let currentChunk = 0;
            const reader = new FileReader();

            reader.onload = () => {
                const chunk = reader.result;
                socket.emit('file-chunk', { id: socket.id, filename: file.name, chunk, currentChunk, totalChunks });
                currentChunk++;

                setProgress((currentChunk / totalChunks) * 100);

                if (currentChunk < totalChunks) {
                    loadNextChunk();
                } else {
                    console.log('File upload completed');
                    setFile(null);
                }
            };

            const loadNextChunk = () => {
                const start = currentChunk * chunkSize;
                const end = Math.min(start + chunkSize, file.size);
                const blob = file.slice(start, end);
                reader.readAsArrayBuffer(blob);
            };

            loadNextChunk();
        }
    };

    useEffect(() => {
        socket.on('helloback', (data) => {
            console.log(data);
        });

        socket.emit('hello');

        const handleGetMessage = (data) => {
            setMessage((prevMessages) => [...prevMessages, data]);
        };

        socket.on('getmessage', handleGetMessage);

        const handleGetFile = (data) => {
            console.log('File received:', data);
            const { base64Data, filename } = data;
            const fileSrc = `data:image/jpeg;base64,${base64Data}`; // Adjust MIME type if necessary
            setImageSrc(fileSrc);
        };

        socket.on('getfile', handleGetFile);

        return () => {
            socket.off('helloback');
            socket.off('getmessage', handleGetMessage);
            socket.off('getfile', handleGetFile);
        };
    }, []);

    return (
        <div className="w-3/4 p-4 m-auto flex flex-col  bg-white">
            <div className="flex ">
                <p className='text-2xl m-auto pl-10 flex text-center font-bold mb-4 text-gray-700'>Chat & File Sharing</p>
                <Link to={'/call'} style={{height:"fit-content"}} className=' bg-green-500  text-white py-2 px-4 rounded hover:bg-green-700 transition duration-300 ease-in-out'> call</Link>
            </div>

                <div style={{ height: "70vh", overflowY: "scroll"}} className="  mb-4 overflow-scroll bg-gray-50 p-4 rounded-md shadow-md">
                    {message.map((msg, index) => (
                        String(socket.id) === msg.id ? (
                            <div key={index} className="p-2  bg-green-100 rounded mb-2 ml-auto max-w-xs break-words">
                                {msg.um}
                            </div>
                        ) : (
                            <p key={index} className="p-2 text-blue-600 bg-gray-100 rounded mb-2 max-w-xs break-words">{msg.um}</p>
                        )
                    ))}
                </div>
                 <form onSubmit={handleSubmit} className="mb-4 w-full flex ">
                    <input
                        type="text"
                        value={type}
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded w-full "
                        placeholder="Enter your message"
                        />
                    <button type="submit" className="bg-blue-500  text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 ease-in-out">
                        Send
                    </button>
                   </form>
                <form onSubmit={handleFileSubmit} className="mb-4 w-full ">
                    <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-700 mb-2 transition duration-300 ease-in-out" />
                    <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 ease-in-out">
                        Send File
                    </button>
                </form>
                <progress value={progress} max="100" className="w-full mb-4"></progress>
                {imageSrc && <img src={imageSrc} alt="Received file" className="w-full  mt-4 border rounded shadow-md" />}
            </div>
    );
}

export default Room;
