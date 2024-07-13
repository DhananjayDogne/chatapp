import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload, useGLTF } from '@react-three/drei';

import CanvasLoader from './Loader';

import './Model.css';

const Fly = ({ isMobile }) => {
    const fly = useGLTF("/model/hardhead.glb");
    const [dir, setDir] = useState({
        x: -0.2, y: 0.9, z: -0.2
    });
    const [pos, setPos] = useState({
        x: 0, y: 0
    });
    
    useEffect(() => {
        const dirPath = (e) => {
            const newx = e.clientX;
            const newy = e.clientY;
            // console.log(newx, pos);
            const difx = newx > pos.x ? 1 :-1;
            const dify = newy > pos.y ? 1 : -1;
            if (difx>0 && dify<0) {
                setDir({ x: -0.2, y: 1.5, z: -0.2 });
                // console.log("r-u");
            }
            else if (difx >0 && dify >0) {
                setDir({ x: -1.8, y: 2.5, z: 1 });
                // console.log("r-d");
            }
            else if (difx < 0 && dify > 0) {
                setDir({ x: 1.2, y: -0.3, z: 1 });
                // console.log("l-d");

            }
            else if (difx < 0 && dify < 0) {
                setDir({ x: -0.2, y: 0.2, z: -0.2 });
                // console.log("l-u");
            } else {
                setDir({ x: -0.2, y: 0.9, z: -0.2 });
            }
            setPos({ x: newx, y: newy });
            
        }
        window.addEventListener("mousemove", dirPath);
        return () => {
            window.removeEventListener("mousemove", dirPath);
        }

        
    }, [dir,setDir]);
    return (
        
        <mesh>
            <hemisphereLight intensity={0.75} groundColor="white" />
            <pointLight intensity={1} />
            <spotLight
                position={[-20, 50, 10]}
                angle={0.12}
                penumbra={1}
                intensity={1}
                castshadow
                shadow-mapSize={1024}
            />
            <primitive
                object={fly.scene}
                scale={isMobile ? 4 : 6}
                position={isMobile ? [-4, -2, -2.2] : [-4, -2, -1.5]}
                rotation={[dir.x, dir.y, dir.z]}
            />
        </mesh>
    )
}

const FlyCanvas = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width:500px)');
        setIsMobile(mediaQuery.matches);

        const handleMediaQueryChange = (event) => {
            setIsMobile(event.matches);
        }

        mediaQuery.addEventListener('change', handleMediaQueryChange);

        return () => {
            mediaQuery.removeEventListener('change', handleMediaQueryChange);
        }
    }, [])
    return (
        <div className='canva' >
        <Canvas
            frameloop='demand'
            shadows
            dpr={[1, 2]}
            camera={{ position: [20, 3, 5], fov: 25 }}
            gl={{ preserveDrawingBuffer: true }}
        >
            <Suspense fallback={<CanvasLoader />}>
                <OrbitControls
                    enableZoom={false}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI /2}
                />
                <Fly isMobile={isMobile} />
            </Suspense>

            <Preload all />
            </Canvas>
        </div>
    );
};

export default FlyCanvas;