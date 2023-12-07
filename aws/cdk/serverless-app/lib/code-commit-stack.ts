import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as iam from "aws-cdk-lib/aws-iam";
import * as amplify from "aws-cdk-lib/aws-amplify";

export class CodeCommitStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const codeCommitRepository = this.createCodeCommitRepository();

    const userForCodeCommit =
      this.createUserForCodeCommit(codeCommitRepository);

    if (userForCodeCommit) {
      codeCommitRepository.grantPullPush(userForCodeCommit);
    }

    this.createAmplifyHosting(codeCommitRepository);

    this.createCodeCommitRepoUrlOutput(codeCommitRepository);
  }

  private createCodeCommitRepository(): codecommit.Repository {
    return new codecommit.Repository(this, "CodeCommitRepository", {
      repositoryName: "wildrydes-site",
      description: "Wild Rydes sample application for Serverless Stack",
    });
  }

  private createUserForCodeCommit(
    repository: codecommit.Repository
  ): iam.User | null {
    const username = "user-for-codecommit";
    const existingUser = iam.User.fromUserName(this, "ExistingUser", username);

    if (!existingUser) {
      const user = new iam.User(this, "UserForCodeCommit", {
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName("AWSCodeCommitPowerUser"),
        ],
        userName: "user-for-codecommit",
        password: cdk.SecretValue.unsafePlainText("P@ssword123"),
      });

      repository.grantPullPush(user);
      return user;
    }

    console.log(`El usuario ${username} ya existe.`);
    return null;
  }

  private createCodeCommitRepoUrlOutput(
    repository: codecommit.Repository
  ): void {
    new cdk.CfnOutput(this, "CodeCommitRepoUrl", {
      value: repository.repositoryCloneUrlHttp,
    });
  }

  private createAmplifyHosting(repository: codecommit.Repository): void {
    const amplifyServiceRole = new iam.Role(this, "AmplifyServiceRole", {
      assumedBy: new iam.ServicePrincipal("amplify.amazonaws.com"),
      roleName: "amplify-service-role-for-codecommit",
      description: "Amplify service role",
      inlinePolicies: {
        AmplifyServiceRolePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["codecommit:GitPull"],
              resources: [repository.repositoryArn],
            }),
          ],
        }),
      },
    });

    const amplifyApp = new amplify.CfnApp(this, "AmplifyHosting", {
      name: "wildrydes-site",
      repository: repository.repositoryCloneUrlHttp,
      iamServiceRole: amplifyServiceRole.roleArn,
    });

    new amplify.CfnBranch(this, "MainBranch", {
      branchName: "main",
      appId: amplifyApp.attrAppId,
      enableAutoBuild: true,
    });

    new cdk.CfnOutput(this, "AmplifyAppId", {
      value: amplifyApp.attrAppId,
    });

    new cdk.CfnOutput(this, "AmplifyAppUrl", {
      value: `https://${amplifyApp.attrAppId}.amplifyapp.com`,
    });
  }
}
