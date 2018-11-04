var express = require("express");
var router = express.Router();
var request = require("request");
var GithubHelper = require("../utils/github-helper");

const host = "http://localhost:3000";
let ghHelper = new GithubHelper();

const authUser = async function(req, res, next) {
  if (!req.session.token) {
    res.authenticated = false;
  } else res.authenticated = true;
  next();
};
router.use(authUser);

/* GET home page. */
router.get("/", async function(req, res, next) {
  try {
    if (res.authenticated) {
      let gitHub = await ghHelper.create(req.session.token);

      let mentors = await gitHub.getMentors();
      if (mentors) {
        console.log(mentors);
        res.render("index", {
          title: "Express",
          authenticated: res.authenticated,
          mentors: mentors
        });
      } else {
        res.render("index", {
          title: "Express",
          authenticated: res.authenticated,
          error: "Failed to load mentors"
        });
      }
    } else {
      res.render("index", {
        title: "Express",
        authenticated: res.authenticated
      });
    }
  } catch (err) {
    res.render("index", {
      title: "Express",
      authenticated: res.authenticated,
      error: err.message
    });
  }
});

router.get("/edit/:mentorRef", async function(req, res, next) {
  try {
    if (res.authenticated) {
      let gitHub = await ghHelper.create(req.session.token);

      let mentor = await gitHub.getMentorDataForEditing(
        req.params.mentorRef.replace(/\.md$/, "")
      );
      if (mentor) {
        console.log(mentor);
        res.render("editMentor", {
          title: req.params.mentorRef.replace(/\.md$/, ""),
          authenticated: res.authenticated,
          mentor: mentor
        });
      } else {
        res.render("editMentor", {
          title: "Express",
          authenticated: res.authenticated,
          error: "Failed to load mentor"
        });
      }
    } else {
      res.redirect("/");
    }
  } catch (err) {
    console.log(err);
    res.render("editMentor", {
      title: "Express",
      authenticated: res.authenticated,
      error: err.message
    });
  }
});

router.post("/save/:mentorRef", async function(req, res, next) {
  try {
    if (res.authenticated) {
      let gitHub = await ghHelper.create(req.session.token);
      let mentorData = req.body;

      let saveData = await gitHub.saveMentor(
        req.params.mentorRef.replace(/\.md$/, ""),
        mentorData
      );
      if (saveData) {
        res.json({
          failed: saveData.failed,
          error: saveData.failed.length > 0
        });
      } else {
        res.json({ error: failed.length > 0 });
      }
    } else {
      res.json({ error: "Not Authenticated" });
    }
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
});

module.exports = router;
