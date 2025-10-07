import roamioFull from '../assets/roamio_full.png';
import { Link } from 'react-router-dom'

const FlightSearchForm = () => {
    return (
        <div style={{
            width: "100%",
            height: "60px",
            backgroundColor: "#43a4ff",
            color: "white",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            fontWeight: "bold",
            fontSize: "18px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            zIndex: 100,
            position: "fixed"
        }}>
            <Link to='/'>
                <img src={roamioFull} alt='logo' style={{ "height": "60px" }}></img>
            </Link>
        </div>
    );
}

export default FlightSearchForm;