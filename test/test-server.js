'use strict';
const {app, runServer, closeServer} = require('../server.js');
const chai = require('chai');
// const chaiHttp = require('chai-Http');
const should = chai.should();
const {List} = require('../models');
const faker = require('faker');
const mongoose = require('mongoose');
const {TEST_DATABASE_URL} = require('../config');
const chaiHttp = require('chai-http');
const keyList = ['weightGoal', 'listName', 'misc', 'firstaid', 'hygiene', 'water', 'cooking', 'sleep', 'shelter', 'navigation', 'clothing', 'hiking'];
mongoose.promise = global.promise;
chai.use(chaiHttp);

function seedData(){
  let dataArray = [];
  for(let i=0; i<10; i++){
    dataArray.push(generateData());
  }
  return List.insertMany(dataArray);
}
function randomNumber(){
  const numberArray = [5, 22, 43, 75, 234, 121, 15, 44, 94, 55, 230, 34];
  return numberArray[Math.floor(Math.random() * numberArray.length)];
}
function generateData(){
  return {
    'listName': faker.hacker.verb(),
    'weightGoal': randomNumber(),
    'misc': [{'name': faker.hacker.verb(), 'weight': randomNumber()},
      {'name': faker.hacker.verb(), 'weight': randomNumber()},
      {'name': faker.hacker.verb(), 'weight': randomNumber()},
      {'name': faker.hacker.verb(), 'weight': randomNumber()}
    ],
    'firstaid': [{'name': faker.hacker.verb(), 'weight': randomNumber()},
      {'name': faker.hacker.verb(), 'weight': randomNumber()},
      {'name': faker.hacker.verb(), 'weight': randomNumber()},
      {'name': faker.hacker.verb(), 'weight': randomNumber()}
    ],
    'hygiene': [{'name': faker.hacker.verb(), 'weight': randomNumber()},
      {'name': faker.hacker.verb(), 'weight': randomNumber()},
      {'name': faker.hacker.verb(), 'weight': randomNumber()},
      {'name': faker.hacker.verb(), 'weight': randomNumber()}
    ],
    'water': [],
    'cooking': [{'name': faker.hacker.verb(), 'weight': randomNumber()},
      {'name': faker.hacker.verb(), 'weight': randomNumber()},
      {'name': faker.hacker.verb(), 'weight': randomNumber()},
    ],
    'sleep': [],
    'shelter': [{'name': faker.hacker.verb(), 'weight': randomNumber()},
      {'name': faker.hacker.verb(), 'weight': randomNumber()},
      {'name': faker.hacker.verb(), 'weight': randomNumber()},
      {'name': faker.hacker.verb(), 'weight': randomNumber()}
    ],
    'navigation': [],
    'clothing': [{'name': faker.hacker.verb(), 'weight': randomNumber()},
    ],
    'hiking': []
  };
}
function dropDB(){
    
  return new Promise(function(resolve, reject){
    mongoose.connection.dropDatabase()
      .then(function(result){
        resolve(result);
      })
      .catch(function(err){
        reject(err);
      });
  });
}

describe('all API endpoints', function(){
  this.timeout(15000);
  
  
  before(function(){
    return runServer(TEST_DATABASE_URL);
  });
  
  beforeEach(function(){
    return seedData();
  });
  
  afterEach(function(){
    return dropDB();
  });
  after(function(){
    return closeServer();
  });
  
  it('should return 200 on get requests to /list-state/name-list', function() {
    return chai.request(app)
      .get('/list-state/name-list')
      .then(function(res) {
        res.should.have.status(200);
      });
  });
    
  it('should return 200 on get requests to /list-state/:name', function(){
    let searchName;
    return chai.request(app)
      .get('/list-state/name-list')
      .then(function(res){
        searchName = res.body[1];
        return chai.request(app)
          .get(`/list-state/${searchName}`)
          .then(function(res){
            res.should.be.json;
            res.should.have.status(200);
          });
      });
  });

  it('should successfully create a new list on post requests to /list-state', function(){

    const newItem = generateData();
    return chai.request(app)
      .post('/list-state')
      .send(newItem)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys(keyList);
      });
  });

  it('should successfully update the state on the server with put requests to /list-state/:listname', function(){
    let resultName;
    let originalData;
    let updateData = generateData();
    delete updateData.listName;
    return chai.request(app)
    // find a name real name from randomly generated array of lists 
      .get('/list-state/name-list')
      .then(function(res){
        resultName = res.body[0].listName;
        return chai.request(app)
        // get the body of that name to compare to updated body later
          .get(`/list-state/${resultName}`)
          .then((resultBody)=>{
            originalData = resultBody;
            return chai.request(app)
            // update name with new data and compare
              .put(`/list-state/${resultName}`)
              .send(updateData)
              .then(function(res){
                res.should.be.json;
                res.body.should.be.an('object');
                res.body.should.include.keys(keyList);
                res.body.should.not.equal(originalData);
              });
          });

      });
  });
  it('should succesfully delete a list on delete requests to list-state/:deletename', function(req, res){
    let resultName;
    return chai.request(app)
      .get('/list-state/name-list')
      .then(function(res){
        resultName = res.body[0].listName;
        return chai.request(app)
          .delete(`/list-state/${resultName}`)
          .then(function(res){
            res.should.have.status(204);
          });
      });
  });
});
