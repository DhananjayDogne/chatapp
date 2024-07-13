import {useState, useEffect} from 'react';

import FlyCanvas from './Model';
import {motion } from 'framer-motion';  

import './Cursore.css';

const Cursore = () => {

    const [mousePointer, setMousePointer] = useState({x: 0, y: 0});
    
    useEffect(() => { 
        const MouseMove = (e) => {
            setMousePointer({ x: e.clientX, y: e.clientY});
        }
        window.addEventListener('mousemove', MouseMove);

        return () => {
            window.removeEventListener('mousemove', MouseMove);
        }

    }, []);
    
    const varients = {
        default: {
            x: mousePointer.x-120,
            y: mousePointer.y+10
        }
    }

    return (
        <div className='container'>
            <motion.div
                className='cursore'
                variants={varients}
                animate="default"
            ><FlyCanvas /></motion.div>
        </div>
    )
    
}

export default Cursore;