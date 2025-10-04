import nodemailer from "nodemailer";
import crypto from "crypto";
import db from "../firebase-admin.js";

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.SUPPORT_EMAIL, // Use environment variables for security
    pass: process.env.SUPPORT_PASSWORD,
  },
});

// GET a specific user
const getUserByEmail = async (request, response) => {
  const email = request.params.id;

  try {
    const snapshot = await db.ref('/users').orderByChild('email_address').equalTo(email).once('value');
    const users = snapshot.val();

    if (!users) {
      return response.status(201).json({ error: 'User does not exist' });
    }

    // Return first matched user without password
    const user = Object.values(users)[0];
    delete user.password;

    return response.status(200).json(user);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};


// GET a specific user
const getUserByUsername = async (request, response) => {
  const username = request.params.id.toLowerCase();

  try {
    const snapshot = await db.ref('/users').once('value');
    const users = snapshot.val();

    if (!users) {
      return response.status(201).json({ error: 'User does not exist' });
    }

    // Find user by username case-insensitive
    const userEntry = Object.values(users).find(user => user.username?.toLowerCase() === username);

    if (!userEntry) {
      return response.status(201).json({ error: 'User does not exist' });
    }

    delete userEntry.password;
    return response.status(200).json(userEntry);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};


// POST a user
const postUser = async (request, response) => {
  const { email_address, username, password } = request.body;

  const generateRandomPassword = (minLength, maxLength) => {
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_+?';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const userPassword = password || generateRandomPassword(12, 16);

  try {
    // Check if user with email exists
    const snapshot = await db.ref('/users').orderByChild('email_address').equalTo(email_address).once('value');
    if (snapshot.exists()) {
      return response.status(400).json({ error: 'User with this email already exists' });
    }

    // Add new user (auto-generated key)
    const newUserRef = db.ref('/users').push();
    await newUserRef.set({
      email_address,
      username,
      password: userPassword,
      createdAt: new Date().toISOString(),
    });

    return response.status(200).json({ id: newUserRef.key, email_address, username });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};


// PATCH a user
const updateUser = async (request, response) => {
  const { uid, email_address, username } = request.body;

  try {
    // Find user with given uid (username)
    const snapshot = await db.ref('/users').orderByChild('username').equalTo(uid).once('value');

    if (!snapshot.exists()) {
      return response.status(404).json({ error: 'User not found' });
    }

    const userKey = Object.keys(snapshot.val())[0];

    // Check if email already exists on another user
    const emailSnap = await db.ref('/users').orderByChild('email_address').equalTo(email_address).once('value');
    if (emailSnap.exists()) {
      const emailUsers = emailSnap.val();
      // If the email belongs to a different user, handle accordingly (delete or reject)
      if (!Object.keys(emailUsers).includes(userKey)) {
        // Delete the old user (with uid)
        await db.ref(`/users/${userKey}`).remove();
        return response.status(200).json({ message: 'Existing user found with email, old user deleted' });
      }
    }

    // Update user data
    await db.ref(`/users/${userKey}`).update({ email_address, username });
    const updatedUserSnap = await db.ref(`/users/${userKey}`).once('value');
    return response.status(200).json(updatedUserSnap.val());
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};


// GET all users
const getUsers = async (request, response) => {
  try {
    const snapshot = await db.ref('/users').once('value');
    const users = snapshot.val();

    if (!users) {
      return response.status(200).json([]);
    }

    // Map users and exclude password and email_address
    const filteredUsers = Object.values(users).map(({ password, email_address, ...rest }) => rest);

    return response.status(200).json(filteredUsers);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

// POST /login
const loginUserWithPassword = async (request, response) => {
  const { username, password } = request.query;

  try {
    const snapshot = await db.ref('/users').orderByChild('username').equalTo(username).once('value');
    const users = snapshot.val();

    if (!users) {
      return response.status(404).json({ error: 'User not found' });
    }

    const user = Object.values(users)[0];

    if (user.password === password) {
      const { password, ...userWithoutPassword } = user;
      return response.status(200).json(userWithoutPassword);
    } else {
      return response.status(404).json({ error: 'Incorrect password' });
    }
  } catch (error) {
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

const forgotPassword = async (request, response) => {
  const { forgotEmail } = request.body;

  try {
    const snapshot = await db.ref('/users').orderByChild('email_address').equalTo(forgotEmail).once('value');
    const users = snapshot.val();

    if (!users) {
      return response.status(400).send('No user found with that email.');
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000; // 1 hour expiration

    // Save token and expiry to separate path (e.g. /password_resets/{email})
    await db.ref(`/password_resets/${forgotEmail}`).set({
      token,
      expires,
    });

    const resetLink = `${process.env.ORIGIN}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.SUPPORT_EMAIL,
        pass: process.env.SUPPORT_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SUPPORT_EMAIL,
      to: forgotEmail,
      subject: 'Password Reset',
      text: `Please click on the following link to reset your password: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);
    return response.status(200).send('Password reset email sent.');
  } catch (error) {
    console.error(error);
    return response.status(500).send('Failed to send email.');
  }
};

const getOneUser = async (request, response) => {
  const username = request.params.id;

  try {
    const snapshot = await db.ref('/users').orderByChild('username').equalTo(username).once('value');
    const users = snapshot.val();

    if (!users) {
      return response.status(404).json({ error: 'User not found' });
    }

    const user = Object.values(users)[0];
    delete user.password;

    return response.status(200).json(user);
  } catch (error) {
    return response.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (request, response) => {
  const { token, password } = request.body;

  try {
    // Find token entry
    const snapshot = await db.ref('/password_resets').orderByChild('token').equalTo(token).once('value');
    const resets = snapshot.val();

    if (!resets) {
      return response.status(400).send('Token is invalid or has expired.');
    }

    const resetEntryKey = Object.keys(resets)[0];
    const resetEntry = resets[resetEntryKey];

    if (resetEntry.expires < Date.now()) {
      return response.status(400).send('Token has expired.');
    }

    const userEmail = resetEntryKey;

    // Update user's password
    const userSnapshot = await db.ref('/users').orderByChild('email_address').equalTo(userEmail).once('value');
    const users = userSnapshot.val();

    if (!users) {
      return response.status(400).send('User not found.');
    }

    const userKey = Object.keys(users)[0];
    await db.ref(`/users/${userKey}`).update({ password });

    // Delete password reset token
    await db.ref(`/password_resets/${userEmail}`).remove();

    return response.status(200).send('Password has been reset.');
  } catch (error) {
    console.error(error);
    return response.status(500).send('Failed to reset password.');
  }
};

export { getUserByUsername,
  getUserByEmail,
  postUser,
  updateUser,
  getUsers,
  getOneUser,
  loginUserWithPassword,
  forgotPassword,
  resetPassword };
