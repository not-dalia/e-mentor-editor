var https = require("https"),
  fs = require("fs"),
  yaml = require("js-yaml");
var withCatch = require("../utils/withCatch");

let GitHub = require("github-api");
let gh, repo;

class GithubHelper {
  constructor() {
    this.config = this._loadConfig();
  }
  /**
   *
   *
   * @param {any} token
   * @returns {GithubHelperObj}
   *
   * @memberOf GithubHelper
   */
  async create(token) {
    if (!token) return { error: "Missing Github token" };
    const o = new GithubHelperObj(token, this.config);
    await o.initialize();
    return o;
  }

  _loadConfig() {
    try {
      var doc = yaml.safeLoad(fs.readFileSync("./config.yml", "utf-8"));
      console.log(doc);
      return doc;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

class GithubHelperObj {
  constructor(token, config) {
    this.config = config;
    this.token = token;
    if (token) {
      this.gh = new GitHub({
        token: this.token
      });
    }
  }

  async initialize() {
    this.repo = await this.gh.getRepo(
      this.config.owner,
      this.config.repo,
      false
    );
    if (this.repo.error) return { error: "Could not load repository." };
    let editorConf = await withCatch(this._loadFile(this.config.editorConf));
    if (editorConf.err) return { error: editorConf.err };

    let fileContent = Buffer.from(editorConf.data.content, "base64").toString(
      "utf8"
    );
    this.editorConfig = yaml.safeLoad(fileContent);
  }

  async setToken(token) {
    this.token = token;
    this.gh = new GitHub({
      token: this.token
    });
    await this.initialize();
    return { error: null };
  }

  writeFile(path, content, commit, sha) {
    return new Promise((resolve, reject) => {
      var dataObj = {
        message: commit,
        content: content,
        branch: this.config.branch
      };

      if (sha) dataObj.sha = sha;

      var data = JSON.stringify(dataObj);

      var reqOptions = {
        host: "api.github.com",
        path: `/repos/${this.config.owner}/${
          this.config.repo
        }/contents/${path}`,
        method: "PUT",
        headers: {
          "Content-Length": Buffer.byteLength(data),
          "Content-Type": "application/json",
          "User-Agent": "not-dalia",
          Authorization: `token ${this.token}`
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

  async getMentors() {
    let mentorRefs = [];
    for (let lang in this.editorConfig.languages) {
      let mentors = await this.repo.getContents(
        this.config.branch,
        `${this.editorConfig.mentors}/${
          this.editorConfig.languages[lang].name
        }`,
        false
      );
      if (mentors.error || mentors.status != 200) {
        return { error: "failed to get content" };
      }
      for (let item in mentors.data) {
        let mentorRef = mentors.data[item].name;
        if (mentorRefs.indexOf(mentorRef) < 0) mentorRefs.push(mentorRef);
      }
    }
    return mentorRefs;
  }

  async getMentorDataForEditing(mentorRef) {
    try {
      let mentorFiles = [];
      if (!this.editorConfig) throw new Error("Editor config is missing");
      for (let lang in this.editorConfig.languages) {
        let mentor = await withCatch(
          this.repo.getContents(
            this.config.branch,
            `${this.editorConfig.mentors}/${
              this.editorConfig.languages[lang].name
            }/${mentorRef}.md`,
            false
          )
        );
        if (mentor.err || mentor.data.error || mentor.data.status != 200) {
          //TODO: create new mentor
          mentorFiles.push({
            language: this.editorConfig.languages[lang],
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
        if (fileContent.length < 3) return { error: "failed to read content" };
        let mentorContent = yaml.safeLoad(fileContent[1]);
        mentorFiles.push({
          language: this.editorConfig.languages[lang],
          create: false,
          content: mentorContent,
          sha: mentor.data.data.sha
        });
      }
      return mentorFiles;
    } catch (error) {
      console.warn(error);
      return { error };
    }
  }

  async saveMedia(fileData) {
    try {
      let failed = [];
      let save = await withCatch(
        this.writeFile(
          `${this.editorConfig.media}/${Date.now()}${fileData.filename}`,
          fileData.content,
          `Uploaded media ${Date.now()}${fileData.filename}`
        )
      );
      if (save.err || save.data.error || !save.content) {
        failed.push(fileData.filename);
      }
      return { failed };
    } catch (error) {
      console.warn(error);
      return { error };
    }
  }

  async saveMentor(mentorRef, mentorData) {
    try {
      let failed = [];
      for (let i in mentorData) {
        let save = await withCatch(
          this.writeFile(
            `${this.editorConfig.mentors}/${
              mentorData[i].language.name
            }/${mentorRef}.md`,
            getBase64(`---\n${yaml.safeDump(mentorData[i].content)}\n---`),
            `Updated ${mentorRef}`,
            mentorData.sha
          )
        );
        if (save.err || save.data.error || !save.content) {
          failed.push(mentorData[i].language.name);
          continue;
          // throw new Error('mentor deos not exist');
        }
      }
      return { failed };
    } catch (error) {
      console.warn(error);
      return { error };
    }
  }

  async _loadFile(path) {
    return new Promise(async (resolve, reject) => {
      try {
        this.repo.getContents(this.config.branch, path, false, function(
          error,
          result,
          raw
        ) {
          if (
            error ||
            result.error ||
            (result.status && result.status != 200)
          ) {
            throw new Error("failed to get content");
          }

          resolve(result);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}
/*********************************************************/

/*********************************************************/

module.exports = GithubHelper;
