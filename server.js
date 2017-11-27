'use strict';

const express = require('express');
const app = express();
const {DATABASE_URL, PORT} = require('./config');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {List} = require('./models');
require('dotenv').config();

mongoose.promise = global.promise;
app.use(bodyParser.json());
const cors = require('cors');

const {CLIENT_ORIGIN} = require('./config');

app.use(cors({origin: CLIENT_ORIGIN}));

// retrive array of all list names for user
app.get('/list-state/name-list', (req, res)=>{
  let nameArray = [];
  List
    .find({})
    .exec()
    .then((listState)=>{
      for(let i = 0; i< listState.length; i++){
        nameArray.push(listState[i].listName);
      }
      res.json(nameArray);
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
      // if(state === null){
      //   res.status(404)
      //     .end();
      // }
      res.json(state);

    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
      });
});
// for initializing the state of a list server side after user names a list
app.post('/list-state', (req, res)=>{
  List
    .create({     	
      listName: req.body.listName,
      totalWeight: 0,
      totalItems: 0,
      weightGoal: 0,
      hiking: [],
      clothing: [],
      navigation: [],
      shelter: [],
      sleep:[],
      cooking:[],
      water:[],
      hygiene:[],
      firstAid: [],
      misc: []
    })
    .then(function(post) {
      res.status(201).json(post);
  
    });
});
// for updating state on 'save' presses 
app.put('/list-state/:listname', (req,res)=>{
  List
    .findOneAndUpdate({listName: req.params.listname}, 
      
      {
        'totalWeight': 0,
        'totalItems': 0,
        'weightGoal': req.body.weightGoal,
        'misc': req.body.misc,
        'firstAid': req.body.firstAid,
        'hygiene': req.body.hygiene,
        'water': req.body.water,
        'cooking': req.body.cooking,
        'sleep': req.body.sleep,
        'shelter': req.body.shelter,
        'navigation': req.body.navigation,
        'clothing': req.body.clothing,
        'hiking': req.body.hiking
      },
      
      {new: true})
    
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

