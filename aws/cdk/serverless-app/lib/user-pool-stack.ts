import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as congnito from "aws-cdk-lib/aws-cognito";

export class UserPoolStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.generateUserPool();
  }

  private generateUserPool() {
    const emailSender = cdk.Fn.importValue("SesIdentityName");

    const userPool = new congnito.UserPool(this, "UserPool", {
      userPoolName: "WildRydes",
      signInAliases: {
        username: true,
      },
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: "Verify your email for our WildRydes app!",
      },
      email: congnito.UserPoolEmail.withSES({
        fromEmail: emailSender,
        fromName: "Wild Rydes",
      }),
    });

    const userPoolClient = new congnito.UserPoolClient(this, "UserPoolClient", {
      userPool,
      userPoolClientName: "WildRydesWebApp",
    });

    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });

    new cdk.CfnOutput(this, "UserPoolArn", {
      value: userPool.userPoolArn,
      exportName: "userPoolArn",
    });
  }
}
