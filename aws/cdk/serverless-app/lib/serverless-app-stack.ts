import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as iam from "aws-cdk-lib/aws-iam";

export class ServerlessAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const codeCommitRepository = this.createCodeCommitRepository();

    const userForCodeCommit = this.createUserForCodeCommit(codeCommitRepository);

    codeCommitRepository.grantPullPush(userForCodeCommit);

    this.createCodeCommitRepoUrlOutput(codeCommitRepository);
  }

  private createCodeCommitRepository(): codecommit.Repository {
    return new codecommit.Repository(this, "CodeCommitRepository", {
      repositoryName: "wildrydes-site",
      description: "Wild Rydes sample application for Serverless Stack",
    });
  }

  private createUserForCodeCommit(repository: codecommit.Repository): iam.User {
    const user = new iam.User(this, "UserForCodeCommit", {
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AWSCodeCommitPowerUser"),
      ],
      userName: "user-for-codecommit",
      password: cdk.SecretValue.unsafePlainText('password'),
    });

    repository.grantPullPush(user);
    return user;
  }

  private createCodeCommitRepoUrlOutput(repository: codecommit.Repository): void {
    new cdk.CfnOutput(this, "CodeCommitRepoUrl", {
      value: repository.repositoryCloneUrlHttp,
    });
  }
}
