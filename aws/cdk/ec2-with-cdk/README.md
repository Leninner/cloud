# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

> Blog post is available [here](https://www.antonio.cloud/projects/load-balancing-aws/)


## Checks

Run the `cdk-deploy-to.sh` script to deploy the stack to your AWS account. You can find the script in the root folder of the project.

```bash
sh cdk-deploy-to.sh your-aws-account-id your-aws-region "$@"
```