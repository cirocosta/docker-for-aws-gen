#!/usr/bin/env node

'use strict';

// docker-for-aws-gen generates an extended CloudFormation
// template that is used on AWS to generate a many-instance-type
// Docker Swarm cluster.

const fs = require('async-file');
const Manager = require('../lib/manager.js');
const Worker = require('../lib/worker.js');
const argv = require('yargs')
  .usage("Usage: $0 -t [Docker.tmpl] -c [config]")
  .demandOption(['t','c'])
  .argv;


(async () => {
  let config = {};
  let template = {};

  try {
    config = JSON.parse(await fs.readFile(argv.c, 'utf8'));
  } catch (err) {
    console.error(`Couldn't parse config file at ${argv.c}`, err)
    process.exit(1);
  }

  try {
    template = JSON.parse(await fs.readFile(argv.t, 'utf8'));
  } catch (err) {
    console.error(`Couldn't parse template file at ${argv.c}`, err)
    process.exit(1);
  }

  let modifiedTemplate = new Manager(template, config.Manager).create();
  for (let worker of config.Workers) {
    modifiedTemplate = new Worker(modifiedTemplate, worker).create();
  }

  console.log(JSON.stringify(modifiedTemplate,null ,2));
})()

