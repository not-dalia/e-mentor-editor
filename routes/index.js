var express = require('express')
var router = express.Router()
let db = require('../utils/db-helper')

var GithubHelper = require('../utils/github-helper')

let ghHelper = new GithubHelper()

var { authUser } = require('../utils/auth-helper')

router.use(authUser)

router.get('/loggingIn', function (req, res, next) {
  res.render('loggingIn', {
    title: 'Logging in...',
    authenticated: res.authenticated
  })
})

/* GET home page. */
router.get('/', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let gitHub = await ghHelper.create(req.session.token)

      let mentors = await gitHub.getMentors()
      if (mentors) {
        console.log(mentors)
        res.render('index', {
          title: 'Mentors',
          authenticated: res.authenticated,
          mentors: mentors,
          selectedTab: 'mentors',
          notifications: res.unreadNotifications
        })
      } else {
        res.render('index', {
          title: 'Mentors',
          authenticated: res.authenticated,
          error: 'Failed to load mentors',
          notifications: res.unreadNotifications
        })
      }
    } else {
      res.render('index', {
        title: 'Mentors',
        authenticated: res.authenticated,
        notifications: res.unreadNotifications
      })
    }
  } catch (err) {
    res.render('index', {
      title: 'Mentors',
      authenticated: res.authenticated,
      error: err.message,
      notifications: res.unreadNotifications
    })
  }
})

router.get('/index', async function (req, res, next) {
  res.redirect(process.env.BASE_URL)
})

router.get('/test', async function (req, res, next) {
  res.render('test', { authenticated: res.authenticated })
})

router.get('/addPost/:mentorRef', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let gitHub = await ghHelper.create(req.session.token)

      let mentor = await gitHub.getMentorDataForEditing(
        req.params.mentorRef.replace(/\.md$/, '')
      )
      if (mentor) {
        console.log(mentor)
        res.render('addPost', {
          title: 'Create new post',
          authenticated: res.authenticated,
          mentor: mentor,
          post: {},
          mentorRef: req.params.mentorRef,
          selectedTab: 'mentors',
          notifications: res.unreadNotifications
        })
      } else {
        res.render('addPost', {
          title: 'Add Post',
          authenticated: res.authenticated,
          error: 'Failed to load mentor',
          notifications: res.unreadNotifications
        })
      }
    } else {
      res.redirect(process.env.BASE_URL)
    }
  } catch (err) {
    console.log(err)
    res.render('error', {
      title: 'Error',
      authenticated: res.authenticated,
      error: err.message,
      notifications: res.unreadNotifications
    })
  }
})

router.get('/mentor/:mentorRef', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let gitHub = await ghHelper.create(req.session.token)
      let mentor = await gitHub.getMentorDataForEditing(
        req.params.mentorRef.replace(/\.md$/, '')
      )
      if (mentor) {
        let posts = await gitHub.getMentorPosts(
          req.params.mentorRef.replace(/\.md$/, '')
        )
        console.log(posts)
        if (posts.error) {
          res.render('error', {
            title: 'Error',
            authenticated: res.authenticated,
            error: posts.error,
            notifications: res.unreadNotifications
          })
        } else {
          res.render('viewMentor', {
            title: mentor[0].content.name ||
              req.params.mentorRef.replace(/\.md$/, ''),
            authenticated: res.authenticated,
            mentor: mentor,
            posts: posts,
            mentorRef: req.params.mentorRef,
            selectedTab: 'mentors',
            notifications: res.unreadNotifications
          })
        }
      } else {
        res.render('error', {
          title: 'Error',
          authenticated: res.authenticated,
          error: 'Failed to load mentor',
          notifications: res.unreadNotifications
        })
      }
    } else {
      res.redirect(process.env.BASE_URL)
    }
  } catch (err) {
    console.log(err)
    res.render('error', {
      title: 'Error',
      authenticated: res.authenticated,
      error: err.message,
      notifications: res.unreadNotifications
    })
  }
})

router.get('/editPost/:language/:postRef', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let gitHub = await ghHelper.create(req.session.token)
      let post = await gitHub.getPostDataForEditing(
        req.params.language,
        req.params.postRef.replace(/\.md$/, '')
      )
      if (post) {
        // post.content = JSON.stringify(post.content);
        let mentor = await gitHub.getMentorDataForEditing(post.ref)
        console.log(post.content)
        res.render('addPost', {
          title: post.title,
          authenticated: res.authenticated,
          mentor: mentor,
          post: post,
          content: post.content,
          mentorRef: post.ref,
          selectedTab: 'mentors',
          notifications: res.unreadNotifications
        })
      } else {
        res.render('addPost', {
          title: 'Express',
          authenticated: res.authenticated,
          error: 'Failed to load mentor',
          notifications: res.unreadNotifications
        })
      }
    } else {
      res.redirect(process.env.BASE_URL)
    }
  } catch (err) {
    console.log(err)
    res.render('error', {
      title: 'Error',
      authenticated: res.authenticated,
      error: err.message,
      notifications: res.unreadNotifications
    })
  }
})

router.get('/edit/:mentorRef', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let gitHub = await ghHelper.create(req.session.token)

      let mentor = await gitHub.getMentorDataForEditing(
        req.params.mentorRef.replace(/\.md$/, '')
      )
      if (mentor) {
        console.log(mentor)
        res.render('editMentor', {
          title: mentor[0].content.name || req.params.mentorRef.replace(/\.md$/, ''),
          authenticated: res.authenticated,
          mentorRef: req.params.mentorRef.replace(/\.md$/, ''),
          mentor: mentor,
          selectedTab: 'mentors',
          notifications: res.unreadNotifications
        })
      } else {
        res.render('editMentor', {
          title: 'Express',
          authenticated: res.authenticated,
          error: 'Failed to load mentor',
          notifications: res.unreadNotifications
        })
      }
    } else {
      res.redirect(process.env.BASE_URL)
    }
  } catch (err) {
    console.log(err)
    res.render('error', {
      title: 'Error',
      authenticated: res.authenticated,
      error: err.message,
      notifications: res.unreadNotifications
    })
  }
})

router.post('/save/:mentorRef', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let gitHub = await ghHelper.create(req.session.token)
      let mentorData = JSON.parse(req.body.mentor)

      let saveData = await gitHub.saveMentor(
        req.params.mentorRef.replace(/\.md$/, ''),
        mentorData
      )
      if (saveData) {
        res.json({
          failed: saveData.failed,
          error: saveData.failed.length > 0
        })
      } else {
        res.json({
          error: saveData.failed.length > 0
        })
      }
    } else {
      res.json({
        error: 'Not Authenticated'
      })
    }
  } catch (error) {
    console.log(error)
    res.json({
      error
    })
  }
})

router.post('/savePost/', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let gitHub = await ghHelper.create(req.session.token)
      let postData = JSON.parse(req.body.post)

      let saveData = await gitHub.savePost(postData)
      if (saveData) {
        res.json({
          failed: saveData.failed,
          error: saveData.failed.length > 0
        })
      } else {
        res.json({
          error: saveData.failed.length > 0
        })
      }
    } else {
      res.json({
        error: 'Not Authenticated'
      })
    }
  } catch (error) {
    console.log(error)
    res.json({
      error
    })
  }
})

router.post('/saveMedia/', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let gitHub = await ghHelper.create(req.session.token)
      let mediaData = JSON.parse(req.body.media)

      let saveData = await gitHub.saveMedia(mediaData)
      if (saveData) {
        res.json({
          failed: saveData.failed,
          imagePath: saveData.imagePath,
          error: saveData.failed.length > 0
        })
      } else {
        res.json({
          error: saveData.failed.length > 0
        })
      }
    } else {
      res.json({
        error: 'Not Authenticated'
      })
    }
  } catch (error) {
    console.log(error)
    res.json({
      error
    })
  }
})

router.post('/deletePost/:language/:postRef', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let gitHub = await ghHelper.create(req.session.token)

      let deleteData = await gitHub.deletePost(
        req.params.language,
        req.params.postRef.replace(/\.md$/, '')
      )
      if (deleteData) {
        res.json({
          failed: deleteData.failed,
          error: deleteData.failed.length > 0
        })
      } else {
        res.json({
          error: deleteData.failed.length > 0
        })
      }
    } else {
      res.json({
        error: 'Not Authenticated'
      })
    }
  } catch (error) {
    console.log(error)
    res.json({
      error
    })
  }
})

router.post('/delete/:mentorRef', async function (req, res, next) {
  try {
    if (res.authenticated) {
      let gitHub = await ghHelper.create(req.session.token)

      let deleteData = await gitHub.deleteMentor(
        req.params.mentorRef.replace(/\.md$/, '')
      )
      if (deleteData) {
        res.json({
          failed: deleteData.failed,
          error: deleteData.failed.length > 0
        })
      } else {
        res.json({
          error: deleteData.failed.length > 0
        })
      }
    } else {
      res.json({
        error: 'Not Authenticated'
      })
    }
  } catch (error) {
    console.log(error)
    res.json({
      error
    })
  }
})

module.exports = router
