var express = require("express");
var router = express.Router();
var qs = require("querystring");
var http = require("http"),
  https = require("https"),
  fs = require("fs"),
  yaml = require("js-yaml");
var withCatch = require("../utils/withCatch");

let GitHub = require("github-api");
let gh, repo;
let editorConfig;

const authUser = async function(req, res, next) {
  if (!req.session.token) {
    res.redirect(process.env.BASE_URL + "auth/login/");
    return;
  }
  if (!gh) {
    gh = new GitHub({
      token: req.session.token
    });
  }
  if (!repo) {
    repo = await gh.getRepo(config.owner, config.repo, false);
    if (repo.error) res.json({ error: "Could not load repository." });
  }
  if (!editorConfig) {
    _loadFile(config.editorConf, function(error, results) {
      if (error) {
        next();
      }
      console.log(results);
      let fileContent = Buffer.from(results.content, "base64").toString("utf8");
      editorConfig = yaml.safeLoad(fileContent);
      nex();
    });
  } else next();
};

router.use(authUser);

let config = _loadConfig();

router.get("/editor-config", async function(req, res, next) {
  _loadFile(config.editorConf, function(error, results) {
    if (error) {
      res.json(error);
    }
    console.log(results);
    let fileContent = Buffer.from(results.content, "base64").toString("utf8");
    editorConfig = yaml.safeLoad(fileContent);
    res.json(results);
  });
});

//TODO: change this to read directly from jekyll
router.get("/get-mentors", async function(req, res, next) {
  let mentorRefs = [];
  for (let lang in editorConfig.languages) {
    let mentors = await repo.getContents(
      config.branch,
      `${editorConfig.mentors}/${editorConfig.languages[lang].name}`,
      false
    );
    if (mentors.error || mentors.status != 200) {
      res.json({ error: "failed to get content" });
    }
    for (let item in mentors.data) {
      /* let mentor = await repo.getContents(
        config.branch,
        mentors.data[item].path,
        false
      );
      let fileContent = Buffer.from(mentor.data.content, "base64")
        .toString("utf8")
        .split("---");
      if (fileContent.length < 3) res.json({ error: "failed to read content" });
      let mentorContent = yaml.safeLoad(fileContent[1]); 
      if (mentorRefs.indexOf(mentorContent.ref) < 0)
      mentorRefs.push(mentorContent.ref); */
      let mentorRef = mentors.data[item].name;
      if (mentorRefs.indexOf(mentorRef) < 0) mentorRefs.push(mentorRef);
    }
  }
  res.json(mentorRefs);
});

router.get("/edit-mentor/:mentorRef", async function(req, res, next) {
  try {
    let mentorFiles = [];
    let mentorRef = req.params.mentorRef;
    if (!editorConfig) throw new Error("Editor config is missing");
    for (let lang in editorConfig.languages) {
      let mentor = await withCatch(
        repo.getContents(
          config.branch,
          `${editorConfig.mentors}/${
            editorConfig.languages[lang].name
          }/${mentorRef}.md`,
          false
        )
      );
      if (mentor.err || mentor.data.error || mentor.data.status != 200) {
        //TODO: create new mentor
        mentorFiles.push({
          language: editorConfig.languages[lang],
          create: true,
          content: {
            ref: mentorRef
          }
        });
        continue;
        // throw new Error('mentor deos not exist');
      }
      let fileContent = Buffer.from(mentor.data.data.content, "base64")
        .toString("utf8")
        .split("---");
      if (fileContent.length < 3) res.json({ error: "failed to read content" });
      let mentorContent = yaml.safeLoad(fileContent[1]);
      mentorFiles.push({
        language: editorConfig.languages[lang],
        create: false,
        content: mentorContent,
        sha: mentor.data.data.sha
      });
    }
    res.json(mentorFiles);
  } catch (error) {
    console.warn(error);
    res.json({ error });
  }
});

router.post("/save-media", async function(req, res, next) {
  try {
    if (!editorConfig) throw new Error("Editor config is missing");
    let failed = [];
    let fileData = req.body;
    let save = await withCatch(
      writeFile(
        config.branch,
        `${editorConfig.media}/${Date.now()}${fileData.filename}`,
        fileData.content,
        `Uploaded media ${Date.now()}${fileData.filename}`,
        req.session.token
      )
    );
    if (save.err || save.data.error || !save.content) {
      failed.push(fileData.filename);
    }
    res.json({ failed });
  } catch (error) {
    console.warn(error);
    res.json({ error });
  }
});

router.post("/save-mentor/:mentorRef", async function(req, res, next) {
  try {
    if (!editorConfig) throw new Error("Editor config is missing");
    let failed = [];
    let mentorData = req.body;
    for (let i in mentorData) {
      let save = await withCatch(
        writeFile(
          config.branch,
          `${editorConfig.mentors}/${mentorData[i].language.name}/${
            req.params.mentorRef
          }.md`,
          getBase64(`---\n${yaml.safeDump(mentorData[i].content)}\n---`),
          `Updated ${req.params.mentorRef}`,
          req.session.token,
          mentorData.sha
        )
      );
      if (save.err || save.data.error || !save.content) {
        failed.push(mentorData[i].language.name);
        continue;
        // throw new Error('mentor deos not exist');
      }
    }
    res.json({ failed });
  } catch (error) {
    console.warn(error);
    res.json({ error });
  }
});

function writeFile(branch, path, content, commit, token, sha) {
  return new Promise((resolve, reject) => {
    var dataObj = {
      message: commit,
      content: content,
      branch: branch
    };

    if (sha) dataObj.sha = sha;

    var data = JSON.stringify(dataObj);

    var reqOptions = {
      host: "api.github.com",
      path: `/repos/${config.owner}/${config.repo}/contents/${path}`,
      method: "PUT",
      headers: {
        "Content-Length": Buffer.byteLength(data),
        "Content-Type": "application/json",
        "User-Agent": "not-dalia",
        Authorization: `token ${token}`
      }
    };

    var body = "";
    var req = https.request(reqOptions, function(res) {
      res.setEncoding("utf8");
      res.on("data", function(chunk) {
        body += chunk;
      });
      res.on("end", function() {
        resolve(JSON.parse(body));
      });
    });

    req.write(data);
    req.end();
    req.on("error", function(e) {
      reject(e.message);
    });
  });
}

function _loadConfig() {
  try {
    var doc = yaml.safeLoad(fs.readFileSync("./config.yml", "utf-8"));
    console.log(doc);
    return doc;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function _loadFile(path, cb) {
  try {
    let content = await withCatch(repo.getContents(config.branch, path, false));
    if (content.err || content.data.error || content.data.status != 200) {
      throw new Error("failed to get content");
    }

    cb(null, content.data.data);
  } catch (err) {
    cb(true);
  }
}

function getBase64(content) {
  return Buffer.from(content).toString("base64");
}

module.exports = router;
