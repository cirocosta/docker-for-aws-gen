#!/usr/bin/env node

'use strict';

// docker-for-aws-gen generates an extended CloudFormation
// template that is used on AWS to generate a many-instance-type
// Docker Swarm cluster.

const template = require('../templates/17.05.0-ce/edge/template.json');
const Manager = require('../lib/manager.js');
const Worker = require('../lib/worker.js');

let temp = new Manager(template, {
  CustomTags: {
    "com.key": "value",
  },

  AfterDaemonStarted: [
    "echo this-is-a-test\n",
  ],

  Labels: [
    "key=value",
    "com.key=value",
  ],
}).create();


temp = new Worker(temp, {
  Name: "Infra",

  CustomTags: {
    "com.cirocosta.type": "infra",
  },

  AfterDaemonStarted: [
    "echo docker volume create\n",
  ],

  Labels: [
    "test=test2",
  ],
}).create();


console.log(JSON.stringify(temp,null,2));
