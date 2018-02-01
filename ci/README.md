# CircleCI builds, tests and deployments
Injectify supports continuous integration via the use of CircleCi. This basically means every time you create a commit to the Injectify repo (whether it be at [samdenty99/injectify](https://github.com/samdenty99/injectify) or forked on your own account), [CircleCI](https://circleci.com/) will automatically:

1. Clone the Injectify repo
2. Verify `yarn run test` runs without error
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
| webhook | (Optional) A [Discord](https://discordapp.com/) webhook URL                              |

7. Modify `.circle.yml` and `deploy.sh` to suit your needs

![Environment Variables](https://i.imgur.com/h7cbPQW.png)

## Discord integration
If you specify the webhook URL, you'll get build status messages on your Discord server. Refer to [Intro to webhooks](https://support.discordapp.com/hc/en-us/articles/228383668-Intro-to-Webhooks) for help on how to create a webhook.
![Discord integration screenshot](https://i.imgur.com/6ME3wkQ.png)