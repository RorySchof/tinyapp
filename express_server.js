const bcrypt = require("bcryptjs");
const { request } = require("express");
const cookieSession = require('cookie-session');
const { getUserByEmail } = require("./helpers");
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

function generateRandomString(length) {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex]
  }
  return result;
}

const isLoggedIn = (req) => {
  return req.session.user_id;
};

app.get('/login', (req, res) => {
  if (isLoggedIn(req)) {
    res.redirect('/urls');
  } else {
    // const templateVars = { urls: urlDatabase, user: usersDatabase[req.session.user_id] };
    // res.render("urls_index", templateVars);

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

  const id = generateRandomString(ID_LENGTH);
  const hashedPassword = bcrypt.hashSync(password, 10);
  usersDatabase[id] = { id, email, password: hashedPassword };

  // CHECK IF USER EXISTS AND PASSWORD IS CORRECT

  // if (!user) {
  //   res.status(403).send('EMAIL IS WRONG. BE BETTER!!!');
  //   return;
  // }

  // if (!bcrypt.compareSync(password, user.password)) {
  //   res.status(403).send('PASSWORD IS WRONG. BE BETTER!!!');
  //   return;
  // }

  // SET USER_ID COOKIE WITH USER ID

  // res.cookie('user_id', user.id, { signed: true });

  req.session.user_id = id
console.log(">>>>>>>>>>",usersDatabase, req.session)
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  // console.log(req.body.username)
  // res.cookie("username", req.body.username)



  const { email, password } = req.body
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

app.post ('/logout', (req, res) => {
    res.clearCookie('user_id');
    req.session.user_id = null;
    return res.redirect('/login');
  });


app.get("/u/:id", (req, res) => {
  const shortUrl = req.params.id
  const longURL = urlDatabase[shortUrl]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; // Log the POST request body to the console
  const id = generateRandomString(ID_LENGTH);
  urlDatabase[id] = longURL
  res.send("Ok");
});
app.post("/urls/:id/delete", (req, res) => {
  const shortUrl = req.params.id
  const longURL = delete urlDatabase[shortUrl]
  res.redirect('/urls')
});

app.get("/urls/new", (req, res) => {
  if (!isLoggedIn(req)) {
    return res.redirect('/login');
    // return;
  }
  const templateVars = { id: req.params.id, user: usersDatabase[req.session.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  console.log(isLoggedIn(req), req.session.user_id )

  if (!isLoggedIn(req)) {
    return res.redirect('/login');
    // return;
  }



  const templateVars = { urls: urlDatabase, user: usersDatabase[req.session.user_id] };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: "wwww.google.com", user: usersDatabase[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
