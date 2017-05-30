'use strict';

const objectExtend = require('deep-extend');
const arrayUnion = require('array-union');

class Worker {
  // TODO extend a base object as this code is the same
  // from manager
  constructor(template, opts) {
    if (!template) {
      throw new Error("A template must be specified.");
    }

    this._opts = opts || {};
    this._template = objectExtend({}, template);
    this._versionString = this
      ._template.Mappings
      .DockerForAWS
      .version
      .forAws
      .replace(/\./g,'')
      .replace(/-/g,'')
  }

}

module.exports = Worker;

