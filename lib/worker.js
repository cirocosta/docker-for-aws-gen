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
    this._versionString = this
      ._template.Mappings
      .DockerForAWS
      .version
      .forAws
      .replace(/\./g,'')
      .replace(/-/g,'')
  }

  _copyClusterSize () {

  }

  _copyInstanceType () {

  }



  // .Parameters.ClusterSize   --> [Name]WorkerSize
  // .Parameters.InstanceType   --> [Name]WorkerInstanceType
  // copy node ASG 
  //    --> modify worker ASG w/ tags (use Manager code for that)
  // copy node LaunchConfig
  //    --> modify worker launch config (use Manager code for that)

}

module.exports = Worker;

