'use strict';
const mongoose = require('mongoose');
const packingListState = mongoose.Schema(
  {
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
module.exports = {List};
