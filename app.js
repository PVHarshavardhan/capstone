const express = require('express');
const app = express();
const path = require("path");
const { Coursesall, Page } = require('./models')
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

    response.render("page",{coursename:courseName,chaptername:chapterName})
})

app.post("/pagecreation",async (request,response) => {
    const courseName = request.body.coursename;
    const chapters = await Coursesall.getChapters(courseName);
    response.render('pagecreation', {coursename:courseName,chapters})
    
})

app.post("/showpage", (request, response) => {
    console.log(request.body.showtitle)

})
module.exports = app;