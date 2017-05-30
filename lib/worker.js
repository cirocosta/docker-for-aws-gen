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

    this._autoScalingGroupName = `${this._opts.Name}WorkerAsg`;
    this._launchConfigName = `${this._opts.Name}WorkerLaunchConfig${this._versionString}`;
    this._instanceTypeName = `${this._opts.Name}WorkerInstanceType`;

    return this;
  }

  create () {
    this._copyClusterSize();
    this._copyInstanceType();
    this._copyNodeAsg();
    this._copyLaunchConfig();
    this._modifyWorkerAsg();
    this._modifyWorkerLaunchConfig();
    this._setCustomTags();
    this._setAfterDaemonStarted();
    this._setLabels();

    return this._template;
  }


  /**
   * Modified the template that has been loaded inserting custom tags
   * @private 
   */
  _setCustomTags () {
    const tags = this._opts.CustomTags;
    if (!tags || !Object.keys(tags).length) {
      return;
    }

    const awsTags = Object
      .entries(tags)
      .map(entry => ({ 
        Key: entry[0], 
        PropagateAtLaunch: true, 
        Value: entry[1] 
      }));

    this._template.Resources[`${this._autoScalingGroupName}`].Properties.Tags = arrayUnion(
      [],
      awsTags,
      this._template.Resources[`${this._autoScalingGroupName}`].Properties.Tags);
  }

  /**
   * Retrieves an array of code objects used by the launch
   * configuration to provision the machine.
   * @private
   * @returns {Array}
   */
  _getLaunchConfigCode () {
    return this
      ._template
      .Resources[`${this._launchConfigName}`]
      .Properties
      .UserData["Fn::Base64"]["Fn::Join"][1];
  }

  /**
   * Sets the launch config section to a given array of
   * strings/objects passed to it.
   * @param {Array} - code objects (string|object).
   * @private
   */
  _setLaunchConfigCode (code) {
    this
      ._template
      .Resources[`${this._launchConfigName}`]
      .Properties
      .UserData["Fn::Base64"]["Fn::Join"][1] = code;
  }


  /**
   * Sets daemon labels that go to the `/etc/docker/daemon.json`
   * configuration file (performed at provisioning time).
   * @private
   */
  _setLabels () {
    const target = '"labels":["os=linux"';
    const labels = this._opts.Labels;
    if (!labels || !labels.length) {
      return;
    }

    const labelsStr = labels
      .map(str => `"${str}"`)
      .join(',');

    let newLaunchConfig = this
      ._getLaunchConfigCode()
      .map(str => {
        if (!(typeof str === 'string' || str instanceof String)) {
          return str
        }

        if (str.indexOf(target) == -1) {
            return str
        }

        return str.replace(target, `${target},${labelsStr}`)
      });

    this._setLaunchConfigCode(newLaunchConfig);
  }

  /**
   * Adds code to run in the machine right after the docker daemon
   * has been started.
   * @private
   */
  _setAfterDaemonStarted () {
    const code = this._opts.AfterDaemonStarted;
    if (!code || !code.length) {
      return;
    }

    let newLaunchConfig = this
      ._getLaunchConfigCode()
      .map(str => {
        if (str !== "# init-aws\n")  {
            return str
        }

        return code.join('');
      });

    this._setLaunchConfigCode(newLaunchConfig);
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

    this._template.Parameters[this._instanceTypeName] = instanceType;
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

  // `.Resources.NodeAsg.CreationPolicy.ResourceSignal.Count.Ref 
  //        (ClusterSize --> [Name]WorkerSize)
  // `.Resources.NodeAsg.Properties.DesiredCapacity.Ref 
  //        (ClusterSize --> [Name]WorkerSize)
  // `.Resources.NodeAsg.Properties.LaunchConfigurationName.Ref 
  //        (NodeLaunchConfig<ver> --> [Name]WorkerLaunchConfig<ver>)
  // `.Resources.NodeAsg.UpdatePolicy.AutoScalingRollingUpdate.MinInstancesInService.Ref 
  //        (ClusterSize --> [Name]WorkerSize)
  _modifyWorkerAsg () {
    let asg = this._template.Resources[`${this._opts.Name}WorkerAsg`];

    asg.CreationPolicy.ResourceSignal.Count.Ref = `${this._opts.Name}WorkerSize`;
    asg.Properties.DesiredCapacity.Ref = `${this._opts.Name}WorkerSize`;
    asg.Properties.LaunchConfigurationName.Ref = `${this._opts.Name}WorkerLaunchConfig${this._versionString}`;
    asg.UpdatePolicy.AutoScalingRollingUpdate.MinInstancesInService.Ref = `${this._opts.Name}WorkerSize`;
  }

  // .Resources.NodeLaunchConfig<ver>.Properties.InstanceType.Ref
  //        (InstanceType --> [Name]WorkerInstanceType)
  _modifyWorkerLaunchConfig () {
    let lc = this._template.Resources[this._launchConfigName];
    
    lc.Properties.InstanceType.Ref = `${this._opts.Name}WorkerInstanceType`;
  }


  //    --> modify worker ASG w/ tags (use Manager code for that)
  //    --> modify worker launch config (use Manager code for that)
}

module.exports = Worker;

