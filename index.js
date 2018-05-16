const express = require("express");
const http = require("http");
const app = express();
let Token;
if (process.env.Token) {
  Token = process.env.Token;
} else {
  Token = require("./secrets.json").Token;
}
console.log("TOKEN", Token);

const request = require("request");
const hb = require("express-handlebars");

app.engine("handlebars", hb());

app.set("view engine", "handlebars"); //diese beiden Zeilen bleiben immer gleich für wenn man Handlebars benutzt

app.use(express.static(__dirname + "/public"));

app.get("/", function(req, res, next) {
  res.redirect("/spaetifinder");
});

app.get("/spaetifinder", function(req, res) {
  res.render("spaetifinder", {
    title: "Spaetifinder"
    // layout: "main"
  });
});

app.get("/results", function(req, res) {
  console.log("req query", req.query);
  var qs = {
    action: "list",
    apitoken: Token,
    lat: req.query.lat,
    long: req.query.long,
    distance: req.query.distance
  };
  console.log("qs", qs);
  var request = require("request");
  request(
    {
      uri: "http://m.spätifinder.de/apiv2",
      qs
    },
    function(error, response, body) {
      console.log("RESPONSE", response);
      console.log("error:", error); // Print the error if one occurred
      console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
      console.log("body:", body); // Print the HTML for the Google homepage.
      res.json(JSON.parse(body));
    }
  );
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`SPAETIFINDER!!!!!!!!!`);
});
