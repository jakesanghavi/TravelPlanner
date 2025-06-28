import { useEffect, useRef, useState, useCallback } from 'react';
import { jwtDecode } from "jwt-decode";
import '../component_styles/login-styles.css';

// Login button 
const Login = ({ onLoginSuccess, uid, openLoginModal }) => {
  const modalRef = useRef(null);
  const forgotModalRef = useRef(null);
  const [logForm, setLogForm] = useState({ username: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [googleSignin, setGoogleSignin] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false)
  const signUpEmail = useRef(null);
  const signUpUsername = useRef(null);
  const [forgotEmail, setForgotEmail] = useState('');

  const loginForm = document.querySelector("form.login");

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLogForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpForm((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const signUpSelect = () => {
    loginForm.style.marginLeft = "-50%";
  };

  const loginSelect = () => {
    loginForm.style.marginLeft = "0%";
  };

  const loginModal = useCallback(email => {
    document.getElementById('sign-in-modal').style.display = 'block';
    document.getElementById('signUpEmail').value = email;
    openLoginModal(email);
  }, [openLoginModal]);

  const checkLogin = async (event) => {
    event.preventDefault();
    const { username, password } = logForm

    if (username === '' || !username || password === '' || !password) {
      if (username === '' || !username) {
        alert("Please input your email address.")
      }
      if (password === '' || !password) {
        alert("Please input your password.")
      }
      return;
    }

    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + 'users/username/' + username);
      if (response.status === 400) {
        alert("User does not exist!")
      }
      else {
        // dev
        const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/passwordlogin/?username=${username}&password=${password}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });
        const respJson = await resp.json();

        // If the response is {0}, handle it as an incorrect login
        if (respJson.hasOwnProperty('0')) {
          alert("Password is incorrect or user not found.");
        } else {
          onLoginSuccess(respJson.email_address, respJson.username);
          // Optionally, you can handle the user object here
          closeModal();
          setGoogleSignin(false)
        }
      }
    }
    catch (error) {
      alert(error);
    }
  }

  const checkSignup = async (event) => {
    event.preventDefault();
    const { email, username, password, confirmPassword } = signUpForm

    const emailRegex = /^[a-zA-Z0-9.!#$%&*+\-/=?^_{|}~]+@[a-zA-Z0-9!#$%&*+\-/=?^_{|}~]+\.[a-zA-Z0-9.!#$%&*+\-/=?^_{|}~]{2,}$/
    if (email === '' || !email || password === '' || !password || confirmPassword === '' ||
      !confirmPassword || username === '' || !username || !emailRegex.test(email)) {
      if (email === '' | !email) {
        alert("Please input your email address.")
      }
      if (username === '' || !username) {
        alert("Please input your username.")
      }
      if (password === '' || !password) {
        alert("Please input your password.")
      }
      if (confirmPassword === '' || !confirmPassword) {
        alert("Please confirm password.")
      }
      if (!emailRegex.test(email)) {
        alert("Please input a valid email address.")
      }
      return;
    }


    try {
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/users/email/' + email);
      if (response.status === 200) {
        alert("Email Address already in use!")
        return;
      }

      const response2 = await fetch(import.meta.env.VITE_BACKEND_URL + '/users/username/' + username);
      if (response2.status === 200) {
        alert("Username already in use!")
        return;
      }

      else {
        if (password !== confirmPassword) {
          alert("Passwords must match!")
          return;
        }

        if (password.length < 8) {
          alert("Password must contain at least 8 characters!")
          return;
        }

        const passwordRegex = /^[a-zA-Z0-9!#$^*]+$/;
        if (!passwordRegex.test(password)) {
          alert("Password can only contain letters, numbers, !, #, $, ^, and *.")
          return;
        }
        // dev
        const newUser = await fetch(import.meta.env.VITE_BACKEND_URL + '/users/' + email, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "email_address": email, "username": username, "password": password })
        });
        const newUserJSON = await newUser.json();
        onLoginSuccess(newUserJSON.email_address, newUserJSON.username);
        closeModal();
      }
    }
    catch (error) {
      alert(error);
    }
  }

  const checkGoogleSignup = async () => {
    // In the future, we should pass email_address from navbar into login. This prevents unforseen tampering.
    const email_address = signUpEmail.current.value;
    const username = signUpUsername.current.value;
    // In the future, we should change this regex so it doesn't coincide with auto-generated cookie usernames
    // const usernameRegex = /^[a-zA-Z0-9]*$/;
    if (email_address === '' || !email_address || username === '' || !username) {
      if (email_address === '' | !email_address) {
        alert("Please input your email address.")
      }
      if (username === '' || !username) {
        alert("Please input your username.")
      }
      // if (!usernameRegex.test(username)) {
      //   alert("Username may only include letters and numbers.")
      // }
      return;
    }
    try {
      // Check if the user's email is already registered
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/users/email/' + email_address);
      if (response.status === 200) {
        alert("Email Address already in use!")
        return;
      }
      // Check if the user's username already exists
      const response2 = await fetch(import.meta.env.VITE_BACKEND_URL + '/users/username/' + username);
      if (response2.status === 200) {
        alert("Username already in use!")
        return;
      }
      // If the email and username are new and valid ...
      else {
        // Get the user's userID
        const userID = uid()
        // Add their email to their cookie user
        fetch(import.meta.env.VITE_BACKEND_URL + '/users/' + userID, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "email_address": email_address, "username": username, "uid": userID })
        });
        // Log in the user and close the login modal
        onLoginSuccess(email_address, username);
        closeModal();
      }
    }
    catch (error) {
        console.log(error)
    }
  }

  const closeModal = () => {
    if (forgotModalRef.current) {
      forgotModalRef.current.style.display = 'none';
    }
    if (modalRef.current) {
      modalRef.current.style.display = 'none';
    }
    // forgotModalRef.current.style.display = 'none';
    setGoogleSignin(false)
    setForgotPassword(false)
  };

  const resetMode = () => {
    // modalRef.current.style.display = 'none';
    setForgotPassword(true)
    if (forgotModalRef.current) {
      forgotModalRef.current.style.display = 'block';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && event.target === modalRef.current) {
        closeModal();
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleLoginResponse = useCallback(async (response) => {
    setGoogleSignin(true)
    try {
      // Get the user's google credentials. We only use their email
      var userToken = jwtDecode(response.credential);
      var email = userToken.email;

      // Check if the user is already registered
      const userCheckResponse = await fetch(import.meta.env.VITE_BACKEND_URL + '/users/email/' + email);

      // If the user doesn't exist yet, prompt them to create an account
      if (userCheckResponse.status !== 200) {
        loginModal(email);
      }
      // If the user does exist, this means that they have an account but haven't logged in
      // on this browser before. So, get their current userID (cookie ID) with the uid() function
      // That was passed from App.js. Then, get their user info from the API using their email.
      // Finally, replace the cookie user email from null to their email, and log in the user.
      else {
        const userID = uid()
        const userDataResponse = await fetch(import.meta.env.VITE_BACKEND_URL + '/users/email/' + email);
        const respJson = await userDataResponse.json();
        await fetch(import.meta.env.VITE_BACKEND_URL + '/users/patchcookie/' + userID, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ "email_address": respJson.email_address, "username": respJson.username, "uid": userID })
        });

        // After fixing the database, log in the user.
        onLoginSuccess(respJson.email_address, respJson.username);
        closeModal();
      }
    } catch (error) {
      console.log(error)
    }
  }, [loginModal, onLoginSuccess, uid]);

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: "561683711530-j01e8tatbc9nhbljrnbh0m8caj4hgfck.apps.googleusercontent.com",
      callback: handleLoginResponse
    });

    google.accounts.id.renderButton(
      document.getElementById('signInDiv'),
      { theme: 'outline', size: 'large', ux_mode: 'popup' }
    )
  }, [handleLoginResponse]);


  const handleRequestReset = async () => {
    try {
      const response = await fetch('/request-password-reset/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forgotEmail }),
      });
      if (response.ok) {
        alert('Password reset email sent.');
      } else {
        console.log(response)
        alert('Failed to send password reset email.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while sending the email.');
    }
  };

  return (
    <>
      {!googleSignin && !forgotPassword &&
        <div id="sign-in-modal" ref={modalRef}>
          <div className="sign-in">
            <span className="close" onClick={closeModal}>&times;</span>
            <div className="form-container">
              <div className="slide-controls">
                <input type="radio" name="slide" id="login" defaultChecked />
                <input type="radio" name="slide" id="signup" />
                <label htmlFor="login" className="slide login" onClick={loginSelect}>Login</label>
                <label htmlFor="signup" className="slide signup" onClick={signUpSelect}>Register</label>
                <div className="slider-tab"></div>
              </div>
              <div id='signInDiv' style={{ justifyContent: 'center', paddingBottom: '15px' }}></div>
              <div style={{ textAlign: 'center', fontSize: '20px' }}>OR</div>
              <div className="form-inner">
                <form className="login" onSubmit={checkLogin}>
                  <div className="field">
                    <input
                      type="text"
                      placeholder="Username"
                      name="username"
                      value={logForm.username}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <input
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={logForm.password}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                  <div className="pass-link">
                    <span onClick={resetMode}>Forgot password?</span>
                  </div>
                  <div className="field btn">
                    <div className="btn-layer"></div>
                    <input type="submit" value="Login" />
                  </div>
                </form>
                <form className="signup" onSubmit={checkSignup}>
                  <div className="field">
                    <input
                      type="text"
                      placeholder="Email"
                      name="email"
                      value={signUpForm.email}
                      onChange={handleSignUpChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <input
                      type="text"
                      placeholder="Username"
                      name="username"
                      value={signUpForm.username}
                      onChange={handleSignUpChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <input
                      type="password"
                      placeholder="Password"
                      name="password"
                      value={signUpForm.password}
                      onChange={handleSignUpChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <input
                      type="password"
                      placeholder="Confirm password"
                      name="confirmPassword"
                      value={signUpForm.confirmPassword}
                      onChange={handleSignUpChange}
                      required
                    />
                  </div>
                  <div className="field btn">
                    <div className="btn-layer"></div>
                    <input type="submit" value="Signup" />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      }
      {googleSignin && !forgotPassword &&
        <div id="sign-in-modal" ref={modalRef}>
          <div className="sign-in">
            <span className="close" onClick={closeModal}>&times;</span>
            <div className="form-container">
              <div className="form-inner gsignin">
                <div className="signup">
                  <div className="field">
                    <input type="text" id="signUpEmail" placeholder="Email Address" required ref={signUpEmail} disabled />
                  </div>
                  <div className="field">
                    <input type="text" id="signUpUsername" placeholder="Set Username" required ref={signUpUsername} />
                  </div>
                  <div className="field btn">
                    <div className="btn-layer"></div>
                    <input type="button" style={{ width: "100%" }} value="Sign Up" onClick={checkGoogleSignup} />
                  </div>
                </div>
              </div>
            </div>
            <div id='signInDiv'>
            </div>
          </div>
        </div>
      }
      {forgotPassword === true &&
        <div id="forgot-modal" ref={forgotModalRef}>
          <div className="sign-in">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2 className="title">Reset Password</h2>
            <div className="input-field">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="Email"
                name="forgotEmail"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            <button type="button" className="btn" onClick={handleRequestReset}>Submit</button>
          </div>
        </div >
      }
    </>
  );
};

export default Login;