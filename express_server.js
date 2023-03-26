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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const usersDatabase = {};

// Helper function to find a user by email
const getUserByEmail = function(email) {
  for (const userId in usersDatabase) {
    const user = usersDatabase[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

// ROUTING

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // check if email or password are empty
  if (!email || !password) {
    res.status(400).send('GIVE US YOUR EMAIL AND PASSWORD!!!');
    return;
  }

  const user = getUserByEmail(email);

  // check if user exists and password is correct
  if (!user) {
    res.status(403).send('WE CANT FIND YOUR EMAIL');
    return;
  }

  if (user.password !== password) {
    res.status(403).send('PASSWORD IS WRONG. BE BETTER');
    return;
  }

  // set user_id cookie with user id
  res.cookie('user_id', user.id, { signed: true });

  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id", {path: "/"});
  res.redirect('/login');
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user_id: req.signedCookies.user_id,
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; // Log the POST request body to the console
  const id = generateRandomString(6);
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`); // Redirect to newly created short URL
});

app.post("/urls/:id/delete", (req, res) => {
  const shortUrl = req.params.id;
  delete urlDatabase[shortUrl];
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
