'use strict';

const assert = require('chai').assert;
const objectExtend = require('deep-extend');
const arrayUnion = require('array-union');
const template = require('../templates/17.05.0-ce/edge/template.json');

const Worker = require('../lib/worker.js');

describe('Worker', () => {
  it('Should create copy of ClusterSize', () => {
    let worker = new Worker(template, {
      Name: "Infra",
    });

    const newTempl = worker.create();
    assert.isObject(newTempl.Parameters.InfraWorkerSize);
    assert.equal(newTempl.Parameters.InfraWorkerSize.Default, '5');
  });

  it('Should create copy of InstanceType', () => {
    let worker = new Worker(template, {
      Name: "Infra",
    });

    const newTempl = worker.create();
    const instType = newTempl.Parameters.InfraWorkerInstanceType;

    assert.isObject(instType);
    assert.equal(instType.Default, 't2.micro');
  });

  it('Should create copy of NodeAsg', () => {
    let worker = new Worker(template, {
      Name: "Infra",
    });

    const newTempl = worker.create();
    //  
  });
});
