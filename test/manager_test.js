'use strict';

const assert = require('chai').assert;
const objectExtend = require('deep-extend');
const arrayUnion = require('array-union');
const template = require('../templates/17.05.0-ce/edge/template.json');

const Manager = require('../lib/manager.js');

describe('Manager', () => {
  it('should handle custom tags', () => {
    let manager = new Manager(template, {
      CustomTags: {
        "com.key": "value"
      }
    });

    const modifiedTemplate = manager.create();
    const modifiedTemplateTags = modifiedTemplate.Resources.ManagerAsg.Properties.Tags;

    console.log(modifiedTemplateTags);
    assert.deepInclude(modifiedTemplateTags, {
      Key: "com.key",
      PropagateAtLaunch: true, 
      Value: "value",
    });
  });

  it('should handle custom install code', () => {
    let manager = new Manager(template, {
      AfterDaemonStarted: [
        "echo this-is-a-test\n",
      ]
    });

    manager.create();
    assert.include(manager._getLaunchConfigCode(), 'echo this-is-a-test\n');
  });


  it('should modify labels to have custom labelling', () => {
    let manager = new Manager(template, {
      Labels: [
        "key=value",
        "com.key=value",
      ]
    });


    manager.create();
    assert.include(manager._getLaunchConfigCode(),
      'echo \'{"experimental": \'$DOCKER_EXPERIMENTAL\', "labels":["os=linux","key=value","com.key=value", "region=\'$NODE_REGION\'", "availability_zone=\'$NODE_AZ\'", "instance_type=\'$INSTANCE_TYPE\'", "node_type=\'$NODE_TYPE\'"] \' > /etc/docker/daemon.json\n');
  });
});
