#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { LoadBalancingAwsStack } from "../lib/load-balancing-aws-stack";

const app = new cdk.App();

new LoadBalancingAwsStack(app, "LoadBalancingAwsStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  stackName: "LoadBalancingAwsStack",
  description: "AWS CDK Load Balancing stack",
});
