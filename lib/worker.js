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

    return this._template;
  }

  // .Parameters.ClusterSize   --> .Parameters.[Name]WorkerSize
  _copyClusterSize () {
    let workerSize = objectExtend(
      {},this._template.Parameters.ClusterSize);

    this._template.Parameters[`${this._opts.Name}WorkerSize`] = workerSize;
  }

  // .Parameters.InstanceType   --> .Parameters.[Name]WorkerInstanceType
  _copyInstanceType () {
    let instanceType = objectExtend(
      {},this._template.Parameters.InstanceType);

    this._template.Parameters[`${this._opts.Name}WorkerInstanceType`] = instanceType;
  }

  // copy node ASG 
  //    --> modify worker ASG w/ tags (use Manager code for that)
  // copy node LaunchConfig
  //    --> modify worker launch config (use Manager code for that)

}

module.exports = Worker;

