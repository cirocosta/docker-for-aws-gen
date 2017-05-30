'use strict';

const Manager = require('./manager.js');
const Worker = require('./worker.js');


class Generator {
  constructor (template, opts) {
    this._manager = new Manager(template, opts);
    this._workers = ''; // TODO
  }

  create () {

  }
}


module.exports = Generator;

