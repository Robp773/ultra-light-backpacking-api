'use strict';
// added user id property 
const mongoose = require('mongoose');
const userState = mongoose.Schema(
  {
    userId: String,
    password: String 
  }
);
const packingListState = mongoose.Schema(
  { 
    userId: String,
    listName: String,
    weightGoal: Number,
    hiking: [],
    clothing: [],
    navigation: [],
    shelter: [],
    sleep:[],
    cooking:[],
    water: [],
    hygiene: [],
    firstaid: [],
    misc: []
  }
);

const List = mongoose.model('List', packingListState);
const User = mongoose.model('User', userState);
module.exports = {List, User};
