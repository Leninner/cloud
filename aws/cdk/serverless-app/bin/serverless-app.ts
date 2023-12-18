#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CodeCommitStack } from "../lib/code-commit-stack";
import { UserPoolStack } from "../lib/user-pool-stack";
import { BackendStack } from "../lib/backend-stack";

const app = new cdk.App();

new CodeCommitStack(app, "CodeCommitStack", {
  env: {
    region: "us-east-1",
    account: "dxxxxxxx",
  },
});

new UserPoolStack(app, "UserPoolStack", {
  env: {
    region: "us-east-1",
    account: "dxxxxxxx",
  },
});

new BackendStack(app, "BackendStack", {
  env: {
    region: "us-east-1",
    account: "dxxxxxxx",
  },
});
