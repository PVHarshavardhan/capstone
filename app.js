const express = require('express');
const app = express();
const path = require("path");
const { Coursesall, Pages } = require('./models')
const bodyParser = require('body-parser')
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.get('/',(request, response) => {
    response.render('index');
})

app.get('/coursecreation', (request, response) => {
    response.render('coursecreation')
})

app.post('/course', (request, response) => {
    const courseName = request.body.coursename;
    try {
        response.render('chapter',{coursename:courseName} );
    }
    catch(error){
        console.log(error);
    }
})


app.post('/chaptercreation', (request,response) => {
    const courseName = request.body.coursename;
    response.render('chaptercreation', {coursename:courseName})
})

app.post("/chapters",async (request, response) => {
    const courseName=request.body.coursename;
    const chapterName=request.body.chaptername;
    const des = request.body.description;
    console.log("hell0"+courseName)
    console.log(des);
    try{
        const course = await Coursesall.create({
            coursename:courseName,
            author:"pp",
            chapter:chapterName,
            chapterdescription:des
        })
        console.log(course)
    }
    catch(error){
        console.log(error)
    }

    const pagesList = Pages.getPages(courseName,chapterName); 
    console.log(pagesList)
    response.render("page",{coursename:courseName,chaptername:chapterName,pageslist: pagesList})
})

app.post("/page", (request, response) => {
    const courseName=request.body.coursename;
    const chapterName=request.body.chaptername;

    response.render("page",{coursename:courseName,chaptername:chapterName})
})
app.post("/pagecreation",async (request,response) => {
    const courseName = request.body.coursename;
    const chapters = await Coursesall.getChapters(courseName);
    response.render('pagecreation', {coursename:courseName,chapters})
    
})

app.post("/showpage", async (request, response) => {
    try {
        console.log(request.body.coursename,request.body.chaptername,request.body.pagename);
        const page = await Pages.create({
            pagename:request.body.pagename,
            content:request.body.content,
            coursename:coursename,
            chaptername:request.body.chaptername
        })
    } catch(error){
        console.log(error)
    }
    response.render("displaypage",{ pagename:request.body.pagename,
        content:request.body.content,
        coursename:request.body.coursename,
        chaptername:request.body.chaptername })

})
module.exports = app;