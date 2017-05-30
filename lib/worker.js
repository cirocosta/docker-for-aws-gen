'use strict';

const objectExtend = require('deep-extend');
const arrayUnion = require('array-union');

class Worker {
  /**
   * Constructs Worker creator
   * @constructor
   * @todo extend a base object as this code is the same
   * @param {Object} template - Object right from the JSON template
   * @param {Object} opts.Name - Base name to be used by the worker.
   * @param {Object} opts.CustomTags - A map of "tag_key":"tag_value"
   *                                   to be added to instances and the
   *                                   autoscalinggroup.
   * @param {string[]} opts.Labels - An array of labels to be used by the
   *                               Docker daemon.
   * @param {string[]} opts.AfterDaemonStarted - An array of labels to be
   *                                             of strings with code to
   *                                             be executed after daemon
   *                                             starts.
   */
  constructor(template, opts) {
    if (!template) {
      throw new Error("A template must be specified.");
    }

    this._opts = opts || {};
    this._template = objectExtend({}, template);

    if (!opts.Name) {
      throw new Error("A Name must be provided (opts.Name)")
    }

    this._versionString = this
      ._template.Mappings
      .DockerForAWS
      .version
      .forAws
      .replace(/\./g,'')
      .replace(/-/g,'')
  }

  create () {
    this._copyClusterSize();
    this._copyInstanceType();
    this._copyNodeAsg();
    this._copyLaunchConfig();
    this._modifyWorkerAsg();

    return this._template;
  }

  _getWorkerLaunchConfigName () {
    return `${this._opts.Name}WorkerLaunchConfig${this._versionString}`;
  }

  // .Parameters.ClusterSize --> .Parameters.[Name]WorkerSize
  _copyClusterSize () {
    let workerSize = objectExtend(
      {},this._template.Parameters.ClusterSize);

    this._template.Parameters[`${this._opts.Name}WorkerSize`] = workerSize;
  }

  // .Parameters.InstanceType --> .Parameters.[Name]WorkerInstanceType
  _copyInstanceType () {
    let instanceType = objectExtend(
      {},this._template.Parameters.InstanceType);

    this._template.Parameters[`${this._opts.Name}WorkerInstanceType`] = instanceType;
  }

  // copy node ASG  
  //         (.Resources.NodeAsg --> .Resources.[Name]WorkerAsg)
  _copyNodeAsg () {
    let nodeAsg = objectExtend(
      {},this._template.Resources.NodeAsg);

    this._template.Resources[`${this._opts.Name}WorkerAsg`] = nodeAsg;
  }

  // copy node LaunchConfig 
  //        (.Resources.NodeLaunchConfig<str-version> --> .Resources.[Name]WorkerLaunchConfig<str-version>)
  _copyLaunchConfig () {
    let nodeAsg = objectExtend(
      {},this._template.Resources[`NodeLaunchConfig${this._versionString}`]);

    this._template.Resources[`${this._opts.Name}WorkerLaunchConfig${this._versionString}`] = nodeAsg;
  }

  // modify `.Resources.NodeAsg.CreationPolicy.ResourceSignal.Count.Ref 
  //        (ClusterSize --> [Name]WorkerSize)
  // modify `.Resources.NodeAsg.Properties.DesiredCapacity.Ref 
  //        (ClusterSize --> [Name]WorkerSize)
  // modify `.Resources.NodeAsg.Properties.LaunchConfigurationName.Ref 
  //        (NodeLaunchConfig<ver> --> [Name]WorkerLaunchConfig<ver>)
  // modify `.Resources.NodeAsg.UpdatePolicy.AutoScalingRollingUpdate.MinInstancesInService.Ref 
  //        (ClusterSize --> [Name]WorkerSize)
  _modifyWorkerAsg () {
    let asg = this._template.Resources[`${this._opts.Name}WorkerAsg`];

    asg.CreationPolicy.ResourceSignal.Count.Ref = `${this._opts.Name}WorkerSize`;
    asg.Properties.DesiredCapacity.Ref = `${this._opts.Name}WorkerSize`;
    asg.Properties.LaunchConfigurationName.Ref = `${this._opts.Name}WorkerLaunchConfig${this._versionString}`;
    asg.UpdatePolicy.AutoScalingRollingUpdate.MinInstancesInService.Ref = `${this._opts.Name}WorkerSize`;
  }

  //    --> modify worker ASG w/ tags (use Manager code for that)
  //    --> modify worker launch config (use Manager code for that)
}

module.exports = Worker;

