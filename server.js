'use strict';

const express = require('express');
const app = express();

const {DATABASE_URL, PORT} = require('./config');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {List} = require('./models');
const cors = require('cors');
const {CLIENT_ORIGIN} = require('./config');

require('dotenv').config();
mongoose.promise = global.promise;

app.use(bodyParser.json());
app.use(cors({origin: CLIENT_ORIGIN}));

// retrieve overview data for all lists by user
app.get('/list-state/name-list', (req, res)=>{
  List
    .find({})
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
app.post('/list-state', (req, res)=>{
  List
    .create({     	
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
// default parameters
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.createConnection(databaseUrl, err => {
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

