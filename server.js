/**
 * Created by Omer on 16/8/2017.
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
    res.sendFile(__dirname + '/public/login.html');
});

app.get('/login/', function(req, res){
    res.sendFile(__dirname + '/public/login.html');
});

app.get('public/login.html', function(req, res){
    res.sendFile(__dirname + '/public/login.html');
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
        registerdUser[username].lists = [];
        registerdUser[username].shared = [];
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

app.get("/item/", function(req, res){
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: 3600000})
        res.status(200).sendFile(__dirname + '/public/item.html');
    }else{
        res.status(500);
        res.sendFile(__dirname + '/public/login.html');
    }
});

app.get("/logout/", function(req, res){
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: 3600000})
        if (registerdUser[usr]) {
        res.status(200);
        }else {
        res.status(404);   
        }
    }else{
        res.status(500);
    }
});

app.get("/userlists/", function(req, res){
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: 3600000})
        if (registerdUser[usr]) {
        var obj = registerdUser[usr].lists;
        var urlString = JSON.stringify(obj);
        console.log(urlString);
        res.status(200).send(obj);
        }else {
        res.status(404);   
        }
    }else{
        res.status(500);
    }
});

app.get("/sharedlists/", function(req, res){
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: 3600000})
        if (registerdUser[usr]) {
        var obj = registerdUser[usr].shared;
        var urlString = JSON.stringify(obj);
        console.log(urlString);
        for (var i = 0; i < obj.length; i++) {
            if (registeredUser[registerdUser[usr].shared[i].user].lists[registerdUser[usr].shared[i].name]) {
                obj[i] = registeredUser[registerdUser[usr].shared[i].user].lists[registerdUser[usr].shared[i].name];
            }
        }
        urlString = JSON.stringify(obj);
        res.status(200).send(urlString);
        }else {
        res.status(404);   
        }
    }else{
        res.status(500);
    }
});

app.post("/item/share/", function(req, res) {
    console.log(req.body)
    var itemJson= JSON.parse(req.body) //parse item into json
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: 3600000})
        var lst = itemJson.listName;
        var other = itemJson.otherUserName;
        if (registerdUser[usr].lists[lst] && !registerdUser[usr].lists[lst].shared){  //if list exists and is not shared yet
            registerdUser[usr].lists[lst].shared = true;
            var index = registerdUser[other].shared.length;
            registerdUser[other].shared[index] = new Object();
            registerdUser[other].shared[index].user = usr;
            registerdUser[other].shared[index].name = lst;
            res.status(200).send('200');
        }else {
            res.status(404).send('404');
        }
    }else{
        res.status(500).send('500');

    }
}); 

app.post("/item/", function(req, res) {
    console.log(req.body)
    var itemJson= JSON.parse(req.body) //parse item into json
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: 3600000})
        if (!registerdUser[usr].lists[itemJson.name]){  //if item doesn't exist
            registerdUser[usr].lists[itemJson.name] = new Object();
            registerdUser[usr].lists[itemJson.name].color = itemJson.color;
            registerdUser[usr].lists[itemJson.name].name = itemJson.name;
            registerdUser[usr].lists[itemJson.name].jobs = [];
            registerdUser[usr].lists[itemJson.name].shared = false;
            registerdUser[usr].lists[itemJson.name].owner = usr;
            res.status(200).send('200');
        }else {
            res.status(404).send('404');
        }
    }else{
        res.status(500).send('500');

    }
});

app.put("/item/", function(req, res,next){
    console.log(req.body)
    var itemJson= JSON.parse(req.body) //parsing item to json
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        res.cookie('uid', curUid, {maxAge: 3600000})
        if (registerdUser[usr].lists[itemJson.name]){        //if item exist
            Object.keys(itemJson).forEach(function (key){
                if(itemJson[key]) {     //if key has value
                    registerdUser[usr].lists[itemJson.name][key] = itemJson[key];
                }
            })
        }else {
            res.status(404).send('404');
        }
    }else{
        res.status(500).send('500');
    }
});

app.delete("/item/:listName", function(req, res){
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        var lst = req.params.listName;
        res.cookie('uid',curUid,{maxAge:3600000})
        if (registeredUser[usr].lists[lst]){
            //delete and edit item coumter
            registeredUser[usr].lists[lst] = null;
            res.status(200).send('200');
        }else{
            res.status(404).send('404');
        }
    }else{
        res.status(500).send('500');
    }
});

app.delete("/item/deleteUser", function(req, res){
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        res.cookie('uid',curUid,{maxAge:3600000})
        if (registeredUser[usr]){
            registeredUser[usr] = null;
            res.status(200).send('200');
        }else{
            res.status(404).send('404');
        }
    }else{
        res.status(500).send('500');
    }
});

app.delete("/item/deleteItem", function(req, res){
    console.log(req.body)
    var itemJson= JSON.parse(req.body)
    var usr = findUser(req);
    if (usr) {
        var curUid = req.cookies.uid;
        var lst = itemJson.listName;
        var itm = itemJson.itemName;
        res.cookie('uid',curUid,{maxAge:3600000})
        if (registeredUser[usr].lists[lst].jobs[itm]){
            registeredUser[usr].lists[lst].jobs[itm] = null;
            res.status(200).send('200');
        }else{
            res.status(404).send('404');
        }
    }else{
        res.status(500).send('500');
    }
});

/**
 * function to check validity of cookies
 * @param req
 * @returns {boolean} - if cookie is vaalid or not
 */
/* function verifyAccess(req) {

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
}  */

function findUser(req) {

    var cuid = req.cookies.uid;

    var usr = -1;
    if (cuid){
       Object.keys(registerdUser).forEach(function(user){

           if (cuid === registerdUser[user].uid){
               usr = user;
           }
       });
    }

   return usr;
}

/******LISTEN*******/
app.listen(port); 
console.log('listening to '+ port);
