db = require('../firebase-admin');

const getCookieUser = async (request, response) => {
  const id = request.params.id;

  try {
    const snapshot = await db.ref('/cookie_users').orderByChild('userID').equalTo(id).once('value');
    const users = snapshot.val();

    if (!users) {
      return response.status(201).json({ error: 'User does not exist' });
    }

    const user = Object.values(users)[0];
    return response.status(200).json(user);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

const postCookieUser = async (request, response) => {
  const { userID, email_address } = request.body;

  try {
    const snapshot = await db.ref('/cookie_users').orderByChild('userID').equalTo(userID).once('value');
    if (snapshot.exists()) {
      return response.status(400).json({ error: 'User with this userID already exists' });
    }

    const newUserRef = db.ref('/cookie_users').push();
    await newUserRef.set({ userID, email_address, createdAt: new Date().toISOString() });

    return response.status(200).json({ id: newUserRef.key, userID, email_address });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

const updateCookieUser = async (request, response) => {
  const { userID, email_address } = request.body;

  try {
    const snapshot = await db.ref('/cookie_users').orderByChild('userID').equalTo(userID).once('value');

    if (!snapshot.exists()) {
      return response.status(404).json({ error: 'User not found' });
    }

    const userKey = Object.keys(snapshot.val())[0];

    await db.ref(`/cookie_users/${userKey}`).update({ userID, email_address });
    const updatedUserSnap = await db.ref(`/cookie_users/${userKey}`).once('value');

    return response.status(200).json(updatedUserSnap.val());
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

const deleteCookieUser = async (request, response) => {
  const { userID } = request.body;

  try {
    const snapshot = await db.ref('/cookie_users').orderByChild('userID').equalTo(userID).once('value');

    if (!snapshot.exists()) {
      return response.status(404).json({ error: 'User not found' });
    }

    const userKey = Object.keys(snapshot.val())[0];
    await db.ref(`/cookie_users/${userKey}`).remove();

    return response.status(200).json({ message: `User with userID ${userID} deleted` });
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
};

module.exports = {
  getCookieUser,
  postCookieUser,
  updateCookieUser,
  deleteCookieUser
}
