const express = require('express');
const app = express();
const csrf =require("tiny-csrf")
const cookieParser= require("cookie-parser")
const path = require("path");
const { Coursesall, Pages, User,Enroll } = require('./models')
const bodyParser = require('body-parser')
const { error } = require('console');
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("shh! some secret string"));
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]));
app.set("view engine", "ejs");
app.use(express.json());


const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");

const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const saltRounds = 10;
app.use(
    session({
      secret: "my-super-secret-key-45678854345897986754",
      cookie: {
        maxAge: 242 * 60 * 60 * 1000,
      },
    }),
  );

app.use(passport.initialize());
app.use(passport.session());


passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      User.findOne({
        where: {
          email: username,
        },
      })
        .then(async (user) => {
          console.log("comparing passwords");
          const result = await bcrypt.compare(password, user.password);
          console.log("result", result);
          if (result) {
            return done(null, user);
          } else {
            return done("Invalid password");
          }
        })
        .catch((err) => {
          return err;
        });
    },
  ),
);

passport.serializeUser((user, done) => {
    console.log("serializing user in session", user.id);
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findByPk(id)
      .then((user) => {
        done(null, user);
      })
      .catch((error) => {
        done(error, null);
      });
  });

app.get('/',(request, response) => {
    response.render('start',{csrfToken: request.csrfToken()});
})

app.get('/home', async (request, response) => {
    const courseList = await Coursesall.getCourses();
    response.render('index',{courselist:courseList,csrfToken: request.csrfToken()})
})

app.get('/coursecreation', (request, response) => {
    response.render('coursecreation',{csrfToken: request.csrfToken()})
})

app.post('/course', connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
    const courseName = request.body.coursename;
    try {

        const chapters = await Coursesall.getChapters(courseName);
        
        response.render('chapter',{coursename:courseName,chapters,csrfToken: request.csrfToken()} );
    }
    catch(error){
        console.log(error);
    }
})


app.post('/chaptercreation',connectEnsureLogin.ensureLoggedIn(), (request,response) => {
    const courseName = request.body.coursename;
    response.render('chaptercreation', {coursename:courseName,csrfToken: request.csrfToken()})
})

app.post("/chapters", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
    const courseName=request.body.coursename;
    const chapterName=request.body.chaptername;
    const des = request.body.description;
    console.log("hell0"+courseName)
    console.log(des);
    try{
        const course = await Coursesall.create({
            coursename:courseName,
            author:request.user.firstName,
            chapter:chapterName,
            chapterdescription:des
        })
        console.log(course)
    }
    catch(error){
        console.log(error)
    }
    console.log(courseName,chapterName);
    
    const pagesList =await Pages.getPages(courseName,chapterName); 
    console.log(pagesList)
    response.render("page",{coursename:courseName,chaptername:chapterName,pageslist: pagesList,csrfToken: request.csrfToken()})
})

app.post("/page",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
    const courseName=request.body.coursename;
    const chapterName=request.body.chaptername;
    const pagesList = await Pages.getPages(courseName,chapterName); 
    console.log(pagesList)
    response.render("page",{coursename:courseName,chaptername:chapterName,pageslist:pagesList,csrfToken: request.csrfToken()})
})
app.post("/pagecreation",connectEnsureLogin.ensureLoggedIn(), async (request,response) => {
    const courseName = request.body.coursename;
    const chapters = await Coursesall.getChapters(courseName);
    response.render('pagecreation', {coursename:courseName,chapters:chapters, csrfToken: request.csrfToken()})
    
})

app.post("/showpage",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
    try {
        console.log(request.body.coursename,request.body.chaptername,request.body.pagename);
        const page = await Pages.create({
            pagename:request.body.pagename,
            content:request.body.content,
            coursename:request.body.coursename,
            chaptername:request.body.chaptername
        })
        console.log(page)
    } catch(error){
        console.log(error)
    }
    response.render("displaypage",{ pagename:request.body.pagename,
        content:request.body.content,
        coursename:request.body.coursename,
        chaptername:request.body.chaptername, csrfToken: request.csrfToken()})

})




app.get("/signup", (request, response) =>{ 
    response.render("signup",{title:"Signup",csrfToken: request.csrfToken()})
})

app.post("/users", async (request, response) => {

    const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
    try {
    const user = await User.create({
        firstName:request.body.firstName,
        lastName:request.body.lastName,
        role:request.body.role,
        email:request.body.email,
        password:hashedPwd
    })
    request.login(user, (err) => {
        if(err) {
            console.log(err)
        }
        response.redirect("/home")
    })
    
} catch (error) {
    console.log(error);
}
})


app.get("/login",(request, response) => {
    response.render("login",{title:"Signin",csrfToken: request.csrfToken()});
})


app.post(
    "/session",
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    (request, response) => {
      console.log(request.user);
      response.redirect("/home");
    },
  );

app.get("/signout", (request, response, next) => {
    request.logout((err) => {
      if (err) {
        return next(err);
      }
      response.redirect("/");
    });
  });
  


  app.get("/listcourses",(request, response) => {
    response.render("listcourses");
  })

  app.post("/enroll", async (request, response) => {
    const enrollstatus = await Enroll.getEnrollStatus(request.user.id,request.body.coursename);
    if (enrollstatus.length > 0 ){
      console.log("already registered")
      return response.status(422).json(error);
    }
    else {

    try {
      const enroll = await Enroll.create({
        userid:request.user.id,
        coursename:request.body.coursename,
        enroll:"registered"
      })
      console.log(enroll);
      return response.json(enroll)
    } catch (error) {
      console.log(error)
      response.redirect("index",{csrfToken: request.csrfToken()})
    }
  }
  })

  app.post("/viewcourse", async (request, response) => {
    const chapters = await Coursesall.getChapters(request.body.coursename);
    const enrollstatus = await Enroll.getEnrollStatus(request.user.id,request.body.coursename);
    response.render("viewcourses",{ coursename: request.body.coursename, chapters:chapters ,enrolled:enrollstatus, csrfToken: request.csrfToken()})

    
  })

  app.post("/enrollinginview", async (request, response)=> {
    const chapters = await Coursesall.getChapters(request.body.coursename);
    const enroll = await Enroll.create({
      userid:request.user.id,
      coursename:request.body.coursename,
      enroll:"registered"
    })
    console.log(enroll)
    const enrollstatus = await Enroll.getEnrollStatus(request.user.id,request.body.coursename);
    response.render("viewcourses",{ coursename: request.body.coursename, chapters:chapters ,enrolled:enrollstatus, csrfToken: request.csrfToken()})

  })

  app.post("/readpages", async (request, response) => {
    const courseName=request.body.coursename;
    const chapterName=request.body.chaptername;
    const pagesList =await Pages.getPages(courseName,chapterName); 
    const description = await Coursesall.getDescription(courseName,chapterName);
    response.render("readpage",{coursename:courseName,chapter:chapterName, pageslist:pagesList,description:description.chapterdescription,csrfToken: request.csrfToken()})
  })


  app.post("/learnpage", async (request, response) => {
    const courseName=request.body.coursename;
    const chapterName=request.body.chaptername;
    const pagesList =await Pages.getPages(courseName,chapterName);
    const pagecontent = await Pages.getContent(request.body.pagename,courseName,chapterName);
    for(let i=0; i<pagesList.length;i++) {
      if(pagesList[i].pagename==request.body.pagename){
      if(i!=pagesList.length-1) {
        response.render("learnpage", {coursename:courseName,chaptername:chapterName,pagename:request.body.pagename,pagecontent:pagecontent.content,nextpage:pagesList[i+1].pagename,csrfToken: request.csrfToken()})
        break;
      }
      else {
        response.render("endpage", {coursename:courseName,chaptername:chapterName,pagename:request.body.pagename,pagecontent:pagecontent.content,csrfToken: request.csrfToken()})
      }
    }
  }
    
    
  })
module.exports = app;