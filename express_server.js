const { request } = require("express");
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/u/:id", (req, res) => {
  const shortUrl = req.params.id
  const longURL = urlDatabase[shortUrl]
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL; // Log the POST request body to the console
  const id = generateRandomString(6);
  urlDatabase [id] = longURL
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});
app.post("/urls/:id/delete", (req, res) => {
  const shortUrl = req.params.id
  const longURL = delete urlDatabase[shortUrl]
  res.redirect('/urls')
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
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
  const templateVars = { id: req.params.id, longURL: "wwww.google.com" };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
