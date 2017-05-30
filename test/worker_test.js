'use strict';

const assert = require('chai').assert;
const objectExtend = require('deep-extend');
const arrayUnion = require('array-union');
const template = require('../templates/17.05.0-ce/edge/template.json');

const Worker = require('../lib/manager.js');
