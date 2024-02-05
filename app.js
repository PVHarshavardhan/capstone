const express = require('express');
const app = express();
const csrf =require("tiny-csrf")
const cookieParser= require("cookie-parser")
const path = require("path");
const { Coursesall, Pages, Members,Enroll,Markstat } = require('./models')
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
      Members.findOne({
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
            return done(null,false,{message:"Invalid Password"})
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
      Members.findByPk(id)
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

app.get('/home',connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
    const courseList = await Coursesall.getCourses();

    const enrollednumber = await Enroll.getEnrollNumber();
    const numbercount={}
    for (let i=0;i<enrollednumber.length;i++) {
      numbercount[enrollednumber[i].dataValues.coursename+enrollednumber[i].dataValues.author]=enrollednumber[i].dataValues.studentcount
    }
    
    console.log(numbercount)

    const enrolled = await Enroll.getEnrolled(request.user.id);
    response.render('index',{courselist:courseList,numbercount:numbercount,enrolled:enrolled,username:request.user.firstName,role:request.user.role,csrfToken: request.csrfToken()})
})

app.get('/coursecreation',connectEnsureLogin.ensureLoggedIn(), (request, response) => {
    response.render('coursecreation',{csrfToken: request.csrfToken()})
})

app.post('/course', connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
    const courseName = request.body.coursename;
    try {

        const chapters = await Coursesall.getChapters(courseName,request.user.firstName);
        
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
    const chapters = await Coursesall.getChapters(courseName,request.user.firstName);
    console.log("KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK");
    console.log(chapters);
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
    const user = await Members.create({
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
      failureRedirect:"/login",
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
  


  app.get("/listcourses",connectEnsureLogin.ensureLoggedIn(),(request, response) => {
    response.render("listcourses");
  })

  app.post("/enroll", async (request, response) => {
    const enrollstatus = await Enroll.getEnrollStatus(request.user.id,request.body.coursename,request.body.author);
    if (enrollstatus.length > 0 ){
      console.log("already registered")
      return response.status(422).json(error);
    }
    else {

    try {
      const enroll = await Enroll.create({
        userid:request.user.id,
        coursename:request.body.coursename,
        enroll:"registered",
        author:request.body.author
      })
      console.log(enroll);
      return response.json(enroll)
    } catch (error) {
      console.log(error)
      response.redirect("index",{csrfToken: request.csrfToken()})
    }
  }
  })

  app.post("/viewcourse",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
    
    const chapters = await Coursesall.getChapters(request.body.coursename,request.body.author);
    const enrollstatus = await Enroll.getEnrollStatus(request.user.id,request.body.coursename,request.body.author);

    response.render("viewcourses",{ coursename: request.body.coursename, chapters:chapters,author:request.body.author,enrolled:enrollstatus, csrfToken: request.csrfToken()})

    
  })

  app.post("/enrollinginview",connectEnsureLogin.ensureLoggedIn(), async (request, response)=> {
    
    console.log(request.body.author);
    const chapters = await Coursesall.getChapters(request.body.coursename,request.body.author);
    const enroll = await Enroll.create({
      userid:request.user.id,
      coursename:request.body.coursename,
      enroll:"registered",
      author:request.body.author
    })
    console.log(enroll)
    const enrollstatus = await Enroll.getEnrollStatus(request.user.id,request.body.coursename,request.body.author);
    response.render("viewcourses",{ coursename: request.body.coursename,chapters:chapters,author:request.body.author,enrolled:enrollstatus, csrfToken: request.csrfToken()})

  })

  app.post("/readpages",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
    
    console.log(request.body.author);
    const courseName=request.body.coursename;
    const chapterName=request.body.chaptername;
    const pagesList =await Pages.getPages(courseName,chapterName); 
    const description = await Coursesall.getDescription(courseName,chapterName);
    response.render("readpage",{coursename:courseName,chapter:chapterName, pageslist:pagesList,author:request.body.author,description:description.chapterdescription,csrfToken: request.csrfToken()})
  })


  app.post("/learnpage",connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
    const courseName=request.body.coursename;
    const chapterName=request.body.chaptername;
    const pagesList =await Pages.getPages(courseName,chapterName);
    const pagecontent = await Pages.getContent(request.body.pagename,courseName,chapterName);
    const readstat = await Markstat.getReadStatus(request.user.id,courseName,chapterName,request.body.author,request.body.pagename);
    for(let i=0; i<pagesList.length;i++) {
      if(pagesList[i].pagename==request.body.pagename){
      if(i!=pagesList.length-1) {
        response.render("learnpage", {coursename:courseName,chaptername:chapterName,pagename:request.body.pagename,readstat:readstat,author:request.body.author,pagecontent:pagecontent.content,nextpage:pagesList[i+1].pagename,csrfToken: request.csrfToken()})
        break;
      }
      else {
        response.render("endpage", {coursename:courseName,chaptername:chapterName,pagename:request.body.pagename,readstat:readstat,author:request.body.author,pagecontent:pagecontent.content,csrfToken: request.csrfToken()})
      }
    }
  }


  })
  app.get("/passwordform",connectEnsureLogin.ensureLoggedIn(), (request,response) => {
    response.render("changepassword",{csrfToken: request.csrfToken()})
  })

  app.post("/changepassword",connectEnsureLogin.ensureLoggedIn(), async (request,response) => {
    const checkstatus =await bcrypt.compare(request.body.currentpassword,request.user.password);
    if (checkstatus) {
      if(request.body.newpassword==request.body.confirmpassword){
        const hashedPwd =await bcrypt.hash(request.body.newpassword,saltRounds);
        const res = await Members.update({password:hashedPwd},{where:{id:request.user.id}});
        console.log(res)
      }
      const courseList = await Coursesall.getCourses();

    const enrollednumber = await Enroll.getEnrollNumber();
    const numbercount={}
    for (let i=0;i<enrollednumber.length;i++) {
      numbercount[enrollednumber[i].dataValues.coursename+enrollednumber[i].dataValues.author]=enrollednumber[i].dataValues.studentcount
    }
    
    console.log(numbercount)

    const enrolled = await Enroll.getEnrolled(request.user.id);
    response.render('index',{courselist:courseList,numbercount:numbercount,enrolled:enrolled,username:request.user.firstName,role:request.user.role,csrfToken: request.csrfToken()})
    }
    else{
      console.log("incorrect details");
      
    }

    
  })


  app.post("/markreadstat",connectEnsureLogin.ensureLoggedIn(), async (request,response)=> {
    try {
      const result = await Markstat.create({
        userid:request.user.id,
        coursename:request.body.coursename,
        chaptername:request.body.chaptername,
        author:request.body.author,
        pagename:request.body.pagename
      })
      console.log(result)
      const courseName=request.body.coursename;
    const chapterName=request.body.chaptername;
    const pagesList =await Pages.getPages(courseName,chapterName);
    const pagecontent = await Pages.getContent(request.body.pagename,courseName,chapterName);
    const readstat = await Markstat.getReadStatus(request.user.id,courseName,chapterName,request.body.author,request.body.pagename);
    for(let i=0; i<pagesList.length;i++) {
      if(pagesList[i].pagename==request.body.pagename){
      if(i!=pagesList.length-1) {
        response.render("learnpage", {coursename:courseName,chaptername:chapterName,pagename:request.body.pagename,readstat:readstat,author:request.body.author,pagecontent:pagecontent.content,nextpage:pagesList[i+1].pagename,csrfToken: request.csrfToken()})
        break;
      }
      else {
        response.render("endpage", {coursename:courseName,chaptername:chapterName,pagename:request.body.pagename,readstat:readstat,author:request.body.author,pagecontent:pagecontent.content,pagename:request.body.pagename,csrfToken: request.csrfToken()})
      }
    }
  }
      

    } catch(error){
      console.log(error)
    }
  })


module.exports = app;