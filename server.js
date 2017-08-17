/**
 * Created by or on 6/15/2017.
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
module.export = app;
var router = express.Router();

var port = 8080;

app.use(favicon(path.join(__dirname,'public','latest.jpg')));


app.use('/public',express.static(path.join(__dirname, '/public')));
app.use(bodyParser.text({type: '*/*'}));
app.use(cookieParser(1));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    next();
});



var userCounter = 0;
var registerdUser = [];
var items = [];
var itemsNum = 0;
/******DataBase INIT*******/
items[itemsNum] =  {'id':itemsNum, 'size':20, 'price': 2,'data':'(Or)ange'};
itemsNum++;

items[itemsNum] = {'id':itemsNum, 'size':13, 'price': 1,'data':'O(me)range'};
itemsNum++;


registerdUser["omer"] = new Object();
registerdUser["omer"].password = "123";
registerdUser["omer"].uid = userCounter;
userCounter++;
registerdUser["or"] = new Object();
registerdUser["or"].password = "123";
registerdUser["or"].uid = userCounter;
userCounter++;

/***************get requests for html pages*********************/
app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/hello.html');
});

app.get('/login/', function(req, res){
    res.sendFile(__dirname + '/public/hello.html');
});

app.get('public/hello.html', function(req, res){
    res.sendFile(__dirname + '/public/hello.html');
});

app.get('/register/', function(req, res){
    res.sendFile(__dirname + '/public/register.html');
});

app.post("/register/:username/:password", function(req, res) {
    var username = req.params.username;
    var pass = req.params.password;
    //if username does not exist
    if (!registerdUser[username]){
        registerdUser[username]= new Object();
        registerdUser[username].uid = userCounter;
        registerdUser[username].password = pass;
        userCounter++;
        console.log("regArray int " +username + " is " +JSON.stringify(registerdUser[username]))
        res.cookie("uid",registerdUser[username].uid,{maxAge: 3600000});

        res.status(200).send("200");

    } else {
        res.status(500).send("500");
    }
});

app.post("/login/:username/:password", function(req, res) {
    var username = req.params.username;
    var pass = req.params.password;
    //user exist and password match
    if ((registerdUser[username])&& (registerdUser[username].password === pass)){

        console.log("cookie ! and the uid is " + registerdUser[username].uid );
        res.cookie("uid",registerdUser[username].uid,{maxAge: 3600000});
        res.status(200).send("200");

    } else {
        console.log("wrong username/password")
        res.status(500).send("500");

    }
});

app.get('/item/:id', function(req, res){

    if (verifyAccess(req)) {

        var curUid = req.cookies.uid;  //get uid from cookie, to send it again
        res.cookie('uid',curUid,{maxAge:3600000})
        if (items[req.params.id]){     // if item exist
            res.status(200).json(items[req.params.id]);
        }else {
            res.status(404).send('404');
        }
    }else {
        res.status(500).send('500');
    }
});

app.get('/items/', function(req, res){
    if (verifyAccess(req)){
        var curUid = req.cookies.uid;
        res.cookie('uid',curUid,{maxAge:3600000})
        res.status(200).send(items);

    }else{
        res.status(500);
        res.sendFile(__dirname + '/public/hello.html');
    }
});

app.post("/item/", function(req, res,next) {
    console.log(req.body)
    var itemJson= JSON.parse(req.body) //parse the item into json

    if (verifyAccess(req)) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: 3600000})

        if (!items[itemJson.id]){  //if item doesn't exist
            items[itemJson.id] = new Object();
            Object.keys(itemJson).forEach(function (key){
                items[itemJson.id][key] = itemJson[key];

            })
            itemsNum++;
            res.status(200).send('200');
        }else {
            res.status(404).send('404');
        }
    }else{
        res.status(500).send('500');

    }
});
/**
 * get item.html
 */
app.get("/item/", function(req, res,next){
    if (verifyAccess(req)) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: 3600000})
        res.status(200).sendFile(__dirname + '/public/item.html');
    }else{
        res.status(500);
        res.sendFile(__dirname + '/public/hello.html');
    }
});

app.put("/item/", function(req, res,next){

    var itemJson= JSON.parse(req.body) //parsing item to json

    if (verifyAccess(req)) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: 3600000})
        if (items[itemJson.id]){        //if item exist
            Object.keys(itemJson).forEach(function (key){
                if(itemJson[key]) {     //if key has value
                    items[itemJson.id][key] = itemJson[key];
                }
            })
        }else {
            res.status(404).send('404');
        }
    }else{
        res.status(500).send('500');
    }
});

app.delete("/item/:id", function(req, res){

    if (verifyAccess(req)){
        var curUid = req.cookies.uid;
        res.cookie('uid',curUid,{maxAge:3600000})
        if (items[req.params.id]){
            //delete and edit item coumter
            items[req.params.id]= null;
            itemsNum--;
            res.status(200).send('200');
        }else{
            res.status(404).send('404');
        }
    }else{
        res.status(500).send('500');
    }
});

/******LISTEN*******/
app.listen(port);
console.log('listening to '+ port);

/**
 * function to check validity of cookies
 * @param req
 * @returns {boolean} - if cookie is vaalid or not
 */
function verifyAccess(req) {

    var cuid = req.cookies.uid;

    var verified = false;
    if (cuid){
       Object.keys(registerdUser).forEach(function(user){

           if (cuid == registerdUser[user].uid){
               verified = true;
           }
       });
    }

   return verified;
}
