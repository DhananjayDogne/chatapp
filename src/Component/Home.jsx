import { Link } from "react-router-dom";
import './Home.css';

const Home = () => {
    return (
        <div className="home ">
            <div className="home_container">
                <Link to={'/chat'} >
                    <div className="world1">
                        <h1 className="m-auto">Chat</h1>
                    </div>
                </Link>
            
                <Link to={'/call'} >
                    <div className="world1">
                        <h1 className="m-auto">Call</h1>
                    </div>
                </Link>
            </div>
        </div>
    )
}
export default Home;