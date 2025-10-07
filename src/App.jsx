import HomePage from "./pages/HomePage";
import './master.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useCallback } from "react";

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  const generateUserID = () => {
    return 'user_' + Math.random().toString(36).substring(2, 15);
  };

  const getUserID = useCallback(() => {
    let userID = localStorage.getItem('userID');

    // If the user ID is not found in localStorage, generate a new one
    if (!userID) {
      userID = generateUserID();
      localStorage.setItem('userID', userID);
    }

    return userID;
  }, []);

  const handleLoginSuccess = async (email, username) => {
    const element = document.getElementById('signInDiv')?.firstChild?.firstChild;
    if (element) {
      element.remove();
    }

    const userID = getUserID();
    // Update the loggedInUser state
    await fetch(import.meta.env.VITE_BACKEND_URL + '/users/userID/patch/' + userID, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "userID": userID, "email_address": email })
    });

    setLoggedInUser({ email: email, username: username });

    // const user = await fetch(ROUTE + '/api/users/email/' + email);
    // const user_resp = await user.json();
    // setLoggedInUser({ email: user_resp.email_address, username: user_resp.username });
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage getUserID={getUserID}
          handleLoginSuccess={handleLoginSuccess} loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
