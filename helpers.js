
const getUserByEmail = function(email, database) {
  for (let userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = function (userID, database) {
  const userUrls = {};
  for (let url in database) {
    if (database[url].userId === userID) {
      userUrls[url] = database[url];
    }
  }
  return userUrls;
};

function generateRandomString(length) {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex]
  }
  return result;
}

module.exports = { getUserByEmail, urlsForUser, generateRandomString };
