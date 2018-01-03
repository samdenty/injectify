# TravisCI builds & deployment
Injectify supports continuous integration via the use of TravisCI. This basically means every time you create a commit to the Injectify repo (whether it be at [samdenty99/injectify](https://github.com/samdenty99/injectify) or forked on your own account), [TravisCI](https://travis-ci.org/) will automatically:

1. Clone the Injectify repo
2. Verify `npm run test` runs without error
3. If without error, it will automatically deploy over SSH to your VPS

## Requirements
- VPS running the Injectify server

## Getting started
1. [Fork this repository](https://github.com/samdenty99/injectify/fork) to your own GitHub account.
2. Head over to [https://travis-ci.org/](https://travis-ci.org/) and login with your GitHub account.
3. Go over to your [profile](https://travis-ci.org/profile)
4. Find the `Injectify` repo and enable it
![Repositories](https://i.imgur.com/ezjQsGm.png)
5. Click on the repository => more options => settings
![Settings](https://i.imgur.com/aSN3dCn.png)
6. Under `Environment Variables` add the following, **make sure `Display value in build log` is turned off**:

| Name    | Value                                                                                    |
| ------- | ---------------------------------------------------------------------------------------- |
| sshhost | The IP address of your VPS                                                               |
| sshuser | The user to login into your VPS                                                          |
| sshdir  | The root directory in which the Injectify is stored                                      |
| sshpass | (Optional) The password for the specified user                                           |
| sshkey  | (Optional) The **escaped SSH key** for the specified user,see below on how to escape it  |
| webhook | (Optional) A [Discord](https://discordapp.com/) webhook URL                              |

![Environment Variables](https://i.imgur.com/DgrUZtT.png)

## Escaping the SSH key
Replace all new lines with `\n` (literally) and surround it in double quotes.

## Discord integration
If you specify the webhook URL, you'll get build status messages on your Discord server. Refer to [Intro to webhooks](https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks) for help on how to create a webhook.
![Discord integration screenshot](https://i.imgur.com/ZqFD0eY.png)