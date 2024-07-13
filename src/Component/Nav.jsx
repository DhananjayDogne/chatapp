import { Link } from "react-router-dom";

const Nav = () => {
    return (
        <>
            <nav className="w-[100%] flex bg-black text-white">
                <div className="flex m-auto">
                    <Link to={'/'} >

                        <h1 className="my-2 mx-8  hover:text-gray-500">Chat</h1>

                    </Link>
                    
                    <Link to={'/call'} >
                        
                        <h1 className="my-2 mx-8  hover:text-gray-500">Call</h1>
                    
                    </Link>
                   
                </div>
            </nav>
        </>
    )
}

export default Nav;