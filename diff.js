'use strict';

const diff = require('deep-diff').diff;

const lhs = require('./cases/test.original.json') ;
const rhs = require('./cases/test.json') ;

console.log(diff(lhs,rhs));

