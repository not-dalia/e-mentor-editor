var express = require("express");
var router = express.Router();
var qs = require("querystring");
var http = require("http"),
  https = require("https"),
  fs = require("fs"),
  yaml = require("js-yaml");

router.get("/login/", function(req, res) {
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${
      process.env.GH_CLIENT_ID
    }&scope=repo`
  );
});

router.get("/oauth/", function(req, res) {
  console.log("authenticating code:", req.query.code, true);
  authenticate(req.query.code, function(err, token) {
    var result;
    if (err || !token) {
      result = { error: err || "bad_code" };
      console.log(result.error);
    } else {
      result = { token: token };
      console.log("token", result.token, true);
      req.session.token = result.token;
    }
    res.statusCode = 307;
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    res.header('Surrogate-Control', 'no-store');
    res.redirect(307, process.env.BASE_URL+"loggingIn");
  });
});

router.get("/logout/", function(req, res) {
  req.session.token = null;
  res.statusCode = 307;
  
  res.redirect( process.env.BASE_URL);
});

router.get("/authenticate/", function(req, res) {
  console.log("authenticating code:", req.query.code, true);
  authenticate(req.query.code, function(err, token) {
    var result;
    if (err || !token) {
      result = { error: err || "bad_code" };
      console.log(result.error);
    } else {
      result = { token: token };
      console.log("token", result.token, true);
      req.session.token = result.token;
    }
    res.json(result);
  });
});

router.get("/set_token/:token", function(req, res) {
  req.session.token = req.params.token;

  res.json({ success: true });
});

function authenticate(code, cb) {
  console.log(code);
  var data = qs.stringify({
    client_id: process.env.GH_CLIENT_ID,
    client_secret: process.env.GH_CLIENT_SECRET,
    code: code
  });

  var reqOptions = {
    host: process.env.GH_HOST,
    port: 443,
    path: "/login/oauth/access_token",
    method: "POST",
    headers: { "content-length": data.length }
  };

  var body = "";
  var req = https.request(reqOptions, function(res) {
    res.setEncoding("utf8");
    res.on("data", function(chunk) {
      body += chunk;
    });
    res.on("end", function() {
      cb(null, qs.parse(body).access_token);
    });
  });

  req.write(data);
  req.end();
  req.on("error", function(e) {
    cb(e.message);
  });
}

module.exports = router;
