'use strict';
const mongoose = require('mongoose');
const packingListState = mongoose.Schema(
  {
    listName: String,
    totalWeight: Number,
    totalItems: Number,
    weightGoal: Number,

    hiking: [],
    clothing: [],
    navigation: [],
    shelter: [],
    sleep:[],
    cooking:[],
    water: [],
    hygiene: [],
    firstAid: [],
    misc: []
  }
);

const List = mongoose.model('List', packingListState);
module.exports = {List};
