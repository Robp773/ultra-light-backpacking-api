'use strict';

const express = require('express');
const app = express();

const {DATABASE_URL, PORT} = require('./config');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {List, User} = require('./models');
const cors = require('cors');
const {CLIENT_ORIGIN} = require('./config');
const bcrypt = require('bcryptjs');

require('dotenv').config();
mongoose.promise = global.promise;

app.use(bodyParser.json());
app.use(cors());
// Creating a new user by entering username/password in "Sign Up"
app.post('/users', (req, res)=>{
  User.find({userId: req.body.userId})
    .then((result)=>{
      if(result.length > 1){
        res.json({taken: true, comment: 'User Name Already Taken, Please Choose Another'});
      }
      User.create({userId: req.body.userId, password: bcrypt.hashSync(req.body.password, 8)});
      res.json({taken: false, comment: `Account created for ${req.body.userId}`})
        .catch(
          err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
          });
    });
});
// Returning users logging in with username/password
app.post('/login', (req, res)=>{
  User
    .findOne({userId: req.body.userId})
    .exec()
    .then((response)=>{
      if(response === null){
        return res.json({authorized: false, comment: 'Incorrect User Name or Password'});
      }
      let answer = bcrypt.compare(req.body.password, response.password);
      return answer
        .then((answer)=>{

          if(!answer){
            res.json({authorized: false, comment: 'Incorrect User Name or Password'});
          }
          else if(answer){
            res.json({authorized: true, comment: `Logged In as ${req.body.userId}`});
          }
        });
    }).catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
});

app.get('/users', (req, res)=>{
  User 
    .find({})
    .then((users)=>{
      res.sendStatus(200).end();
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
});

// retrieve overview data for all lists by user
app.get('/list-state/name-list/:userId', (req, res)=>{
  List
    .find({userId: req.params.userId})
    .exec()
    .then((allLists)=>{

      const result = allLists.map((list)=>{
        // list is a single entire array of a list's state
        let itemTotal = 0;
        let weightTotal = 0;
        const {hiking, clothing, navigation, shelter, sleep, cooking, water, hygiene, firstaid, misc} = list;
        const totalArray = [hiking, clothing, navigation, shelter, sleep, cooking, water, hygiene, firstaid, misc];
        for(let i = 0; i<totalArray.length; i++){
          itemTotal += totalArray[i].length;          
        }
        totalArray.map((category)=>{
          for(let i=0; i<category.length; i++){
            weightTotal += category[i].weight;
          }
        });
        return {listName: list.listName, weightTotal: (weightTotal *.0625).toFixed(2), itemTotal: itemTotal};
      });
      return res.json(result);
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
});
// retrieve individual list after user click on a name from the list
app.get('/list-state/:name', (req, res)=>{
  List
    .findOne({listName: req.params.name})
    .then((state)=>{

      res.json(state);

    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
});
// for initializing the state of a list server side after user names a list
// added userId
app.post('/list-state', (req, res)=>{
  List
    .create({
      userId: req.body.userId,	
      listName: req.body.listName,
      weightGoal: 0,
      hiking: [],
      clothing: [],
      navigation: [],
      shelter: [],
      sleep:[],
      cooking:[],
      water:[],
      hygiene:[],
      firstaid: [],
      misc: []
    })
    .then(function(post) {
      res.status(201).json(post);
  
    });
});
// for updating state on 'save' presses 
app.put('/list-state/:listname', (req,res)=>{
  List
    .findOneAndUpdate({listName: req.params.listname}, req.body, {new: true})
    
    .then(function(updatedItem) {
      res.status(201).json(updatedItem)
        .catch(function(err) {
          res.status(500).json({
            message: 'Something went wrong'
          });
        });
    });
});
app.delete('/list-state/:deletename', (req, res)=>{
  List.
    findOneAndRemove({listName: req.params.deletename})
    .then(function(){
      res.status(204).end();
    });
});
let server; 
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }    
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = {
  app,
  runServer,
  closeServer
};