# docker-for-aws-gen

> Generates `docker-for-aws` CloudFormation templates based on configuration.



## Manager

### Custom tags

- affects `.Resources.ManagerAsg.Properties.Tags`

Adds custom tags to the `AutoScalingGroup` of the managers.
These tags propagates to the instances.

Example:

```js
const opts = {
  Manager: {
    CustomTags: {
      "com.mytag": "value",
    },
  },
}
```


### Daemon Labels

- affects `.Resources.ManagerLaunchConfig<Version>.Properties.UserData`

Adds a custom array of labels to the manager docker daemon.

Example:

```js
const opts = {
  Manager: {
    Labels: [
      "com.mylabel=lol",
      "com.mymachine",
    ],
  },
}
```


### Provisioning code

- affects `.Resources.ManagerLaunchConfig<Version>.Properties.UserData`

Sets a custom code to run after the daemon has started but while the manager machine is still launching.


Example:

```js
const opts = {
  Manager: {
    AfterDaemonStarted: [
      "echo this is cool!\n",
      "echo :D\n",
    ],
  },
}
```


## Workers

Workers makes the cattle of `workers` more granular. The options for these are just like the options for `Manager` but you specify an array of them with an extra field: `Name`.  

For instance:

```
const opts = {
  Workers: [
    {
      Name: "Infra",
      Labels: [
        "com.mylabel=lol",
        "com.mymachine",
      ],
      CustomTags: {
        "com.mytag": "value",
      },
      AfterDaemonStarted: [
        "echo this is cool!\n",
        "echo :D\n",
      ],
    }
  ]

}

```


## Full Example


Having the following `config.json`:

```json
{
  "Manager": {
    "Labels": [
      "com.type=test"
    ],
    "CustomTags": {
      "test": "test"
    },
    "AfterDaemonStarted": [
      "echo this is cool!\n",
      "echo :D\n"
    ]
  },

  "Workers": [
    {
      "Name": "Infra",
      "Labels": [
        "com.type=test"
      ],
      "CustomTags": {
        "test": "test"
      },
      "AfterDaemonStarted": [
        "echo this is cool!\n",
        "echo :D\n"
      ]
    }
  ]
}
```

and a docker-for-aws template in `./templates/17.06.0-ce/edge/template.json`:

```sh
$ docker-for-aws-gen -t ./templates/17.06.0-ce/edge/template.json -c ./config.json


{
  "AWSTemplateFormatVersion": "2010-09-09",
  "Conditions": {
    "CloudStorSelected": {
      "Fn::Equals": [
        {
          "Ref": "EnableCloudStor"
        },
        "yes"
        ...
```


## LICENSE

MIT

