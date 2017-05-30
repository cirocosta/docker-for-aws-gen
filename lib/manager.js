'use strict';

const objectExtend = require('deep-extend');
const arrayUnion = require('array-union');

class Manager {

  /**
   * Constructs Manager modifier
   * @constructor
   * @param {Object} opts - Manager modification options .
   * @param {Object} opts.CustomTags - A map of "tag_key":"tag_value"
   *                                   to be added to instances and the
   *                                   autoscalinggroup.
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
  }

  /**
   * Generates the modified template
   * @returns {string} modified template
   */
  create () {
    this._setCustomTags();
    this._setAfterDaemonStarted();

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

    this._template.Resources.ManagerAsg.Properties.Tags = arrayUnion(
      [],
      awsTags,
      this._template.Resources.ManagerAsg.Properties.Tags);
  }


  _getLaunchConfigCode () {
    return this
      ._template
      .Resources[`ManagerLaunchConfig${this._versionString}`]
      .Properties
      .UserData["Fn::Base64"]["Fn::Join"][1];
  }

  _setLaunchConfigCode (code) {
    this
      ._template
      .Resources[`ManagerLaunchConfig${this._versionString}`]
      .Properties
      .UserData["Fn::Base64"]["Fn::Join"][1] = code;
  }

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

        return code.join();
      });

    this._setLaunchConfigCode(newLaunchConfig);
  }
}

module.exports = Manager;

