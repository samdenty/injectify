# CircleCI + TravisCI builds & deployment
Injectify supports continuous integration via the use of CircleCi or TravisCI. This basically means every time you create a commit to the Injectify repo (whether it be at [samdenty99/injectify](https://github.com/samdenty99/injectify) or forked on your own account), [CircleCI](https://circleci.com/) or [TravisCI](https://travis-ci.org/) will automatically:

1. Clone the Injectify repo
2. Verify `npm run test` runs without error
3. If without error, it will automatically deploy over SSH to your VPS
4. (Optionally) Send Discord webhook messages throught the different stages

## Requirements
- VPS running the Injectify server

## CircleCI
1. [Fork this repository](https://github.com/samdenty99/injectify/fork) to your own GitHub account.
2. Head over to [https://circleci.com/](https://travis-ci.org/) and login with your GitHub account.
3. Go over to your [projects section](https://circleci.com/projects/gh/samdenty99)
4. Click on <kbd>Add Project</kbd>
![Add project](https://i.imgur.com/pMDQjVD.png)
4. Find the `Injectify` repo and enable it
![Projects](https://i.imgur.com/jJOoJgs.png)
5. Select <kbd>Linux</kbd> => <kbd>2.0</kbd> => <kbd>Node</kbd> => <kbd>Start Building</kbd>
![Setup Project](https://i.imgur.com/wQlVB7g.png)
6. Click on the projects settings and under <kbd>Environment Variables</kbd>, add the following:

| Name    | Value                                                                                    |
| ------- | ---------------------------------------------------------------------------------------- |
| sshhost | The IP address of your VPS                                                               |
| sshuser | The user to login into your VPS                                                          |
| sshkey  | The root directory in which the Injectify is stored - needs to be specially formatted    |
| sshdir  | (Optional) The root directory in which the Injectify is stored                           |
| sshcmd  | (Optional) A custom bash script to run instead of the default                            |
| webhook | (Optional) A [Discord](https://discordapp.com/) webhook URL                              |

![Environment Variables](https://i.imgur.com/h7cbPQW.png)

## TravisCI
1. [Fork this repository](https://github.com/samdenty99/injectify/fork) to your own GitHub account.
2. Head over to [https://travis-ci.org/](https://travis-ci.org/) and login with your GitHub account.
3. Go over to your [profile](https://travis-ci.org/profile)
4. Find the `Injectify` repo and enable it
![Repositories](https://i.imgur.com/ezjQsGm.png)
5. Click on the repository => <kbd>more options</kbd> => <kbd>settings</kbd>
![Settings](https://i.imgur.com/aSN3dCn.png)
6. Under `Environment Variables` add the following, **make sure `Display value in build log` is turned off**:

| Name    | Value                                                                                    |
| ------- | ---------------------------------------------------------------------------------------- |
| sshhost | The IP address of your VPS                                                               |
| sshuser | The user to login into your VPS                                                          |
| sshkey  | The root directory in which the Injectify is stored - needs to be specially formatted    |
| sshdir  | (Optional) The root directory in which the Injectify is stored                           |
| sshcmd  | (Optional) A custom bash script to run instead of the default                            |
| webhook | (Optional) A [Discord](https://discordapp.com/) webhook URL                              |

![Environment Variables](https://i.imgur.com/DgrUZtT.png)

## Formatting the SSH key
Extract the BASE64 encoded private key, replacing all newlines with `#` and set it as the `sshkey` environment variable

## Discord integration
If you specify the webhook URL, you'll get build status messages on your Discord server. Refer to [Intro to webhooks](https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks) for help on how to create a webhook.
![Discord integration screenshot](https://i.imgur.com/6ME3wkQ.png)