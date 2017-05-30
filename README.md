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


## LICENSE

MIT

