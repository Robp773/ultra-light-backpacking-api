'use strict';
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const packingListState = mongoose.Schema({
    
  totalWeight: Number,
  totalItems: Number,
  weightGoal: Number,

  hiking: [{name: String, weight: Number}],
  clothing: [{name: String, weight: Number}],
  navigation: [{name: String, weight: Number}],
  shelter: [{name: String, weight: Number}],
  sleep:[{name: String, weight: Number}],
  cooking:[{name: String, weight: Number}],
  water: [{name: String, weight: Number}],
  hygiene: [{name: String, weight: Number}],
  firstAid: [{name: String, weight: Number}],
  misc: [{name: String, weight: Number}]
}
);

const list = mongoose.model('list', packingListState);
module.exports = {list};
