const bcrypt = require("bcryptjs");
const password = "purple-monkey-dinosaur"; // found in the req.body object
const hashedPassword = bcrypt.hashSync(password, 10);
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const { generateRandomString } = require('./utils');
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

app.use(cookieParser('some-secret-key'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    longUrl: "http://www.lighthouselabs.ca",
    userId: "userRandomID"
  },
  "9sm5xK": {
    longUrl: "http://www.google.com",
    userId: "user2RandomID"
  }
};

const usersDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "name@efakeemail.com",
    password: "1234"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "name2@fakeemail.com",
    password: "4321"
  }
};

// HELPER FUNCTIONS

const getUserByEmail = function(email) {
  for (const userId in usersDatabase) {
    const user = usersDatabase[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = function(id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    const url = urlDatabase[shortURL];
    if (url.userId === id) {
      userUrls[shortURL] = url.longUrl;
    }
  }
  return userUrls;
};

const isLoggedIn = (req) => {
  return !!req.signedCookies.user_id;
};

// ROUTING

app.get('/register', (req, res) => {
  if (isLoggedIn(req)) {
    res.redirect('/urls');
  } else {
    res.render('register');
  }
});

app.get('/login', (req, res) => {
  if (isLoggedIn(req)) {
    res.redirect('/urls');
  } else {
    res.render('login');
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  
  app.post('/register', (req, res) => {
    const { email, password } = req.body;

  // CHECK IF EMAIL OR PASSWORDS ARE EMPTY

  if (!email || !password) {
    res.status(400).send('GIVE US YOUR EMAIL AND PASSWORD!!!');
    return;
  }

  const user = getUserByEmail(email);

   // CHECK IF USER ALREADY EXISTS

   if (getUserByEmail(email)) {
    res.status(400).send('USER ALREADY EXISTS!!!');
    return;
  }

   // CREATE NEW USER AND ADD TO DATABASE

   const id = generateRandomString();
   const hashedPassword = bcrypt.hashSync(password, 10);
   usersDatabase[id] = { id, email, password: hashedPassword };

  // CHECK IF USER EXISTS AND PASSWORD IS CORRECT

  if (!user) {
    res.status(403).send('EMAIL IS WRONG. BE BETTER!!!');
    return;
  }

  if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send('PASSWORD IS WRONG. BE BETTER!!!');
    return;
  }

  // SET USER_ID COOKIE WITH USER ID

  res.cookie('user_id', user.id, { signed: true });

  res.redirect('/urls');
});

  // SET USER_ID COOKIE WITH USER ID

  res.cookie('user_id', id, { signed: true });

  res.redirect('/urls');
})

app.post("/urls/:id/delete", (req, res) => {
  const user_id = req.signedCookies.user_id;
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  
  // CHECK IF URL EXISTS. 

  if (!url) {
    res.status(404).send('URL NOT FOUND. BOO!!!');
    return;
  }
  
  // CHECK IF USER IS LOGGED IN

  if (!isLoggedIn(req)) {
    res.status(401).send('STOP TRYING TO DELETE URLs WITHOUT LOGGING IN!!!');
    return;
  }

  // CHECK IF USER OWN THE URL

  if (url.userId !== user_id) {
    res.status(403).send('YOU DO NOT HAVE PERMISSION TO DELETE THIS URL. SILLY HACKER!!!');
    return;
  }

  // DELETE URL FROM DATABASE
  
  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  const user_id = req.signedCookies.user_id;
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  
  // CHECK IF URL EXISTS

  if (!url) {
    res.status(404).send('URL NOT FOUND. BOO!!!');
    return;
  }
  
  // CHECK IF USER IS LOGGED IN

  if (!isLoggedIn(req)) {
    res.status(401).send('STOP TRYING TO EDIT URLs WITHOUT LOGGING IN!!!');
    return;
  }

  // CHECK IF USER OWN THE URL

  if (url.userId !== user_id) {
    res.status(403).send('YOU DO NOT HAVE PERMISSION TO EDIT THIS URL. SILLY HACKER!!!');
    return;
  }

  // UPDATE LONG URL

  url.longUrl = req.body.longURL;

  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// CHECK IF PASSWORD IS CORRECT

bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword); // returns true
bcrypt.compareSync("pink-donkey-minotaur", hashedPassword); // returns false



