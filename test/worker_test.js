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

  it('Should create copy of Disk parameters', () => {
    let worker = new Worker(template, {
      Name: "Infra",
    });

    const newTempl = worker.create();
    assert.isObject(newTempl.Parameters.InfraWorkerDiskType);
    assert.isObject(newTempl.Parameters.InfraWorkerDiskSize);

    assert.equal(newTempl.Parameters.InfraWorkerDiskSize.Default, '20');
    assert.equal(newTempl.Parameters.InfraWorkerDiskType.Default, 'standard');
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
    const workerAsg = newTempl.Resources.InfraWorkerAsg
    assert.isObject(workerAsg);
    assert.equal(workerAsg.Type, 'AWS::AutoScaling::AutoScalingGroup');
  });


  it('Should create copy of NodeLaunchConfig', () => {
    let worker = new Worker(template, {
      Name: "Infra",
    });

    const newTempl = worker.create();
    const launchConfig = newTempl.Resources[`InfraWorkerLaunchConfig${worker._versionString}`];

    assert.isObject(launchConfig);
    assert.equal(launchConfig.Type, 'AWS::AutoScaling::LaunchConfiguration');
  });


  it('Should modify the AutoScalingGroup', () => {
    let worker = new Worker(template, {
      Name: "Infra",
    });

    const newTempl = worker.create();
    const workerAsg = newTempl.Resources.InfraWorkerAsg

    assert.isObject(workerAsg);
    assert.equal(workerAsg.CreationPolicy.ResourceSignal.Count.Ref, 'InfraWorkerSize');
  });


  it('Should modify the WorkerLaunchConfig', () => {
    let worker = new Worker(template, {
      Name: "Infra",
    });

    const newTempl = worker.create();
    const launchConfig = newTempl.Resources[`InfraWorkerLaunchConfig${worker._versionString}`];

    assert.isObject(launchConfig);
    assert.equal(launchConfig.Properties.InstanceType.Ref, 'InfraWorkerInstanceType');
  });

  it('Should modify the InstanceName environment variable', () => {
    let worker = new Worker(template, {
      Name: "Infra",
    });

    worker.create();
    assert.include(worker._getLaunchConfigCode(), "export INSTANCE_NAME=\'InfraWorkerAsg\'\n");
  });

});
