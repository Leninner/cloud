#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServerlessAppStack } from '../lib/serverless-app-stack';
import { CodeCommitStack } from '../lib/code-commit-stack';
import { UserPoolStack } from '../lib/user-pool-stack';

const app = new cdk.App();

new ServerlessAppStack(app, 'ServerlessAppStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

new CodeCommitStack(app, 'CodeCommitStack', {
  env: {
    region: 'us-east-1',
    account: '749710350214',
  }
})

new UserPoolStack(app, 'UserPoolStack', {
  env: {
    region: 'us-east-1',
    account: '749710350214',
  }
})


// UserPoolStack.UserPoolClientId = 35m1f5thc8aldohvbrnpvnsdj6
// UserPoolStack.UserPoolId = us-east-1_3jbK5xj7t