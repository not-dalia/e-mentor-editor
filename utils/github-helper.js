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

  deleteFile(path, commit, sha) {
    return new Promise((resolve, reject) => {
      var dataObj = {
        message: commit,
        branch: this.config.branch,
        sha: sha
      };

      var data = JSON.stringify(dataObj);

      var reqOptions = {
        host: "api.github.com",
        path: `/repos/${this.config.owner}/${
          this.config.repo
        }/contents/${path}`,
        method: "DELETE",
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
    return new Promise((resolve, reject) => {
      let mentorRefs = [];
      let promises = [];
      for (let lang in this.editorConfig.languages) {
        promises.push(
          this.repo.getContents(
            this.config.branch,
            `${this.editorConfig.mentors}/${
              this.editorConfig.languages[lang].name
            }`,
            false
          )
        );
      }
      Promise.all(promises)
        .then(values => {
          for (let v in values) {
            let mentors = values[v];
            if (mentors.error || mentors.status != 200) {
              resolve({ error: "failed to get content" });
            }
            for (let item in mentors.data) {
              let mentorRef = mentors.data[item].name;
              if (mentorRefs.indexOf(mentorRef) < 0) mentorRefs.push(mentorRef);
            }
          }
          resolve(mentorRefs);
        })
        .catch(err => {
          resolve({ error: "failed to get content" });
        });
    });

    // for (let lang in this.editorConfig.languages) {
    //   let mentors = await this.repo.getContents(
    //     this.config.branch,
    //     `${this.editorConfig.mentors}/${
    //       this.editorConfig.languages[lang].name
    //     }`,
    //     false
    //   );
    //   if (mentors.error || mentors.status != 200) {
    //     return { error: "failed to get content" };
    //   }
    //   for (let item in mentors.data) {
    //     let mentorRef = mentors.data[item].name;
    //     if (mentorRefs.indexOf(mentorRef) < 0) mentorRefs.push(mentorRef);
    //   }
    // }
  }

  async getMentorPosts(mentorRef) {
    return new Promise((resolve, reject) => {
      let postFiles = [];
      let promises = [];
      for (let lang in this.editorConfig.languages) {
        promises.push(
          this.repo.getContents(
            this.config.branch,
            `${this.editorConfig.posts}/${
              this.editorConfig.languages[lang].name
            }`,
            false
          )
        );
      }
      let innerPromises = [];
      Promise.all(promises)
        .then(values => {
          for (let v in values) {
            let posts = values[v];
            if (posts.error || posts.status != 200) {
              resolve({ error: "failed to get content" });
            }
            for (let item in posts.data) {
              innerPromises.push(
                this.repo.getContents(
                  this.config.branch,
                  posts.data[item].path,
                  false
                )
              );
            }
          }
        })
        .then(data => {
          Promise.all(innerPromises)
            .then(innerValues => {
              for (let nv in innerValues) {
                let postContent = innerValues[nv];
                let fileContent = Buffer.from(
                  postContent.data.content,
                  "base64"
                )
                  .toString("utf8")
                  .split("---");
                if (fileContent.length < 3)
                  resolve({ error: "failed to read content" });
                let frontMatter = yaml.safeLoad(fileContent[1]);
                if (frontMatter.ref != mentorRef) continue;
                let postFile = {
                  fileName: postContent.data.name,
                  lang: frontMatter.lang,
                  date: frontMatter.date,
                  title: frontMatter.title,
                  ref: frontMatter.ref,
                  langName: this.findLanguage(frontMatter.lang, 'name'),
                  sha: postContent.data.sha
                };
                postFiles.push(postFile);
              }
              resolve(postFiles);
            })
            .catch(innerErr => {
              resolve({ error: "failed to get content" });
            });
        })
        .catch(err => {
          resolve({ error: "failed to get content" });
        });
    });
  }
  
  findLanguage(known, wanted){
    let found;
    let knownKey = wanted=='key'?'name':'key';
    for(let lang in this.editorConfig.languages){
      if (this.editorConfig.languages[lang][knownKey] == known){
        found = this.editorConfig.languages[lang][wanted];
        break;
      }
    }
    return found;
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

  async getPostDataForEditing(lang, postRef) {
    try {
      let postFile = {};
      if (!this.editorConfig) throw new Error("Editor config is missing");
      let post = await withCatch(
        this.repo.getContents(
          this.config.branch,
          `${this.editorConfig.posts}/${lang}/${postRef}.md`,
          false
        )
      );
      if (post.err || post.data.error || post.data.status != 200) {
        //TODO: create new mentor
        return { error: "Couldn't retrieve the post" };
      }
      let fileContent = Buffer.from(post.data.data.content, "base64")
        .toString("utf8")
        .split("---");
      if (fileContent.length < 3) return { error: "failed to read content" };
      let frontMatter = yaml.safeLoad(fileContent[1]);
      postFile = {
        ...frontMatter,
        fileName: postRef,
        sha: post.data.data.sha,
        content: fileContent[2]
      };

      return postFile;
    } catch (error) {
      console.warn(error);
      return { error };
    }
  }

  async saveMedia(textFileData) {
    try {
      let failed = [];
      let fileData = JSON.parse(textFileData);
      let save = await withCatch(
        this.writeFile(
          `${this.editorConfig.media}/${Date.now()}${encodeURIComponent(
            fileData.fileName
          )}`,
          fileData.content,
          `Uploaded media ${Date.now()}${fileData.fileName}`
        )
      );
      if (save.err || save.data.error || !save.data.content) {
        failed.push(fileData.fileName);
      }
      return { failed, imagePath: save.data.content.download_url };
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
            mentorData[i].sha
          )
        );
        if (save.err || save.data.error || !save.data.content) {
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

  async savePost(postData) {
    try {
      let failed = [];
      let frontMatter = { ...postData };
      delete frontMatter.content;
      delete frontMatter.fileName;
      delete frontMatter.sha;
      if (!frontMatter.date) {
        let date = new Date();
        frontMatter.date = date.toUTCString();
      }
      let save = await withCatch(
        this.writeFile(
          `${this.editorConfig.posts}/${postData.langName}/${
            postData.fileName
          }.md`,
          getBase64(
            `---\n${yaml.safeDump(frontMatter)}\n---\n${postData.content}`
          ),
          `Updated ${postData.fileName}`,
          postData.sha
        )
      );
      if (save.err || save.data.error || !save.data.content) {
        failed.push(postData.lang);
        // throw new Error('mentor deos not exist');
      }

      return { failed };
    } catch (error) {
      console.warn(error);
      return { error };
    }
  }

  async deletePost(language, postRef) {
    try {
      let failed = [];
      let postData = await this.getPostDataForEditing(language, postRef);
      if (postData.error) return { error: postData.error };
      let deleteResult = await withCatch(
        this.deleteFile(
          `${this.editorConfig.posts}/${language}/${postRef}.md`,
          `Deleted ${postRef}`,
          postData.sha
        )
      );
      if (
        deleteResult.err ||
        deleteResult.data.error ||
        !deleteResult.data.commit
      ) {
        failed.push(postData.name);
        // throw new Error('mentor deos not exist');
      }

      return { failed };
    } catch (error) {
      console.warn(error);
      return { error };
    }
  }

  async deleteMentor(mentorRef) {
    try {
      let failed = [];
      let mentorData = await this.getMentorDataForEditing(mentorRef);
      if (mentorData.error) return { error: mentorData.error };
      for (let i in mentorData) {
        if (mentorData[i].create) continue;
        let deleteResult = await withCatch(
          this.deleteFile(
            `${this.editorConfig.mentors}/${
              mentorData[i].language.name
            }/${mentorRef}.md`,
            `Deleted ${mentorRef}`,
            mentorData[i].sha
          )
        );
        if (
          deleteResult.err ||
          deleteResult.data.error ||
          !deleteResult.data.commit
        ) {
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

function getBase64(content) {
  return Buffer.from(content).toString("base64");
}

module.exports = GithubHelper;
