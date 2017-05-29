'use strict';

const extend = require('deep-extend');

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
    this._template = template;
  }

  create () {
    this._setCustomTags();
  }

  _setCustomTags () {
    let tags = this._opts.CustomTags;

    if (!tags || !Object.keys(tags).length) {
      return;
    }

    this._template.Resources.ManagerAsg.Properties.Tags
    // .. 
  }
}


