'use strict';

const objectExtend = require('deep-extend');
const arrayUnion = require('array-union');

class Manager {

  /**
   * Constructs Manager modifier
   * @constructor
   * @param {Object} template - Object right from the JSON template
   * @param {Object} opts - Manager modification options .
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
  constructor (template, opts) {
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

    this._autoScalingGroupName = 'ManagerAsg';
    this._launchConfigName = `ManagerLaunchConfig${this._versionString}`;

    return this;
  }

  /**
   * Generates the modified template
   * @returns {string} modified template
   */
  create () {
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

    this
      ._getLaunchConfigCode()
      .push(code.join(''));
  }
}

module.exports = Manager;

