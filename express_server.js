const bcrypt = require("bcryptjs");
const { request } = require("express");
const cookieSession = require('cookie-session');
const { getUserByEmail, urlsForUser, generateRandomString } = require("./helpers");
const express = require("express");
const app = express();

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
app.use(cookieSession({
  name: 'session',
  keys: ['roryscholfieldtinyapp'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


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
const ID_LENGTH = 6


const isLoggedIn = (req) => {
  return req.session.user_id;
};

app.get('/login', (req, res) => {
  if (isLoggedIn(req)) {
    res.redirect('/urls');
  } else {

    return res.render("urls_login", { user: '' });
  }
});

app.get('/register', (req, res) => {
  if (isLoggedIn(req)) {
    res.redirect('/urls');
  } else {
    res.render('register');
  }
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const id = generateRandomString(ID_LENGTH);
  const hashedPassword = bcrypt.hashSync(password, 10);

  // CHECK IF EMAIL OR PASSWORDS ARE EMPTY



  if (!email || !password) {
    res.status(400).send('GIVE US YOUR EMAIL AND PASSWORD!!!');
    return;
  }

  const user = getUserByEmail(email, usersDatabase);

  // CHECK IF USER ALREADY EXISTS

  if (user) {
    res.status(400).send('USER ALREADY EXISTS!!!');
    return;
  }

  // CREATE NEW USER AND ADD TO DATABASE
  usersDatabase[id] = {
    id,
    email,
    password: hashedPassword
  }
  req.session.user_id = id
  res.redirect('/urls');
});

app.post("/login", (req, res) => {

  const { email, password } = req.body
  if (!email || !password) {
    res.status(403).send('FIELDS CAN NOT BE BLANK');
    return
  }
  const user = getUserByEmail(email, usersDatabase)
  if (!user) {
    res.status(403).send('EMAIL IS WRONG. BE BETTER!!!');
    return;
  }

  if (!bcrypt.compareSync(password, user.password)) {
    res.status(403).send('PASSWORD IS WRONG. BE BETTER!!!');
    return;
  }
  req.session.user_id = user.id
  res.redirect('/urls')
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  req.session.user_id = null;
  return res.redirect('/login');
});


app.get("/u/:id", (req, res) => {
  const shortUrl = req.params.id
  if (!urlDatabase[shortUrl]) {

    return res.send("<h2>the url does not contain https,so it did not work</h2>")
  }
  const longURL = urlDatabase[shortUrl].longUrl
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; // Log the POST request body to the console
  const id = generateRandomString(ID_LENGTH);
  urlDatabase[id] = { longUrl: longURL, userId: req.session.user_id }
  res.redirect(`/urls`)
});

// need an app post /urls/ulbyat


app.post("/urls/:id", (req, res) => {
  const longUrl = req.body.longUrl;
  const foundUrl = urlDatabase[req.params.id]
  console.log("test string", foundUrl)

  if (!foundUrl) {
    res.status(403).send('URL NOT FOUND');
    return;
  }

  if (req.session.user_id !== foundUrl.userId) {

    res.status(403).send('THIS URL DOES NOT BELONG TO YOU');
    return;
  }
  foundUrl.longUrl = longUrl

  res.redirect('/urls')
});

app.post("/urls/:id/delete", (req, res) => {
  const foundUrl = urlDatabase[req.params.id]
  console.log("test string", foundUrl)

  if (!foundUrl) {
    res.status(403).send('URL NOT FOUND');
    return;
  }

  if (req.session.user_id !== foundUrl.userId) {

    res.status(403).send('THIS URL DOES NOT BELONG TO YOU');
    return;
  }

  delete urlDatabase[foundUrl]
  res.redirect('/urls')
});

app.get("/urls/new", (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect('/login');
    // return;
  }
  const templateVars = { user: usersDatabase[req.session.user_id] };

  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  console.log(isLoggedIn(req), req.session.user_id)

  if (!isLoggedIn(req)) {
    return res.redirect('/login');
    // return;
  }
  const user = usersDatabase[req.session.user_id]
  const urls = urlsForUser(req.session.user_id, urlDatabase)

  const templateVars = { urls: urls, user: usersDatabase[req.session.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/", (req, res) => {

  if (!isLoggedIn(req)) {
    return res.redirect('/login');
  }
  res.redirect("/urls")
});

app.get("/urls/:id", (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect('/login');
  }

  const foundUrl = urlDatabase[req.params.id]
  console.log("test string", foundUrl)

  if (!foundUrl) {
    res.status(403).send('URL NOT FOUND');
    return;
  }

  if (req.session.user_id !== foundUrl.userId) {
    res.status(403).send('THIS URL DOES NOT BELONG TO YOU');
    return;
  }

  const templateVars = { id: req.params.id, longURL: foundUrl.longUrl, user: usersDatabase[req.session.user_id] };

  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

console.log("test hi")