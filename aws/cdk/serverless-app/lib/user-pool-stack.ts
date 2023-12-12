import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as congnito from "aws-cdk-lib/aws-cognito";
import * as email from "aws-cdk-lib/aws-ses";

export class UserPoolStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const emailSender = new email.EmailIdentity(this, "Email sender", {
      identity: {
        value: 'your-email-address',
      },
    });

    const userPool = new congnito.UserPool(this, "UserPool", {
      userPoolName: "WildRydes",
      signInAliases: {
        username: true,
      },
      email: congnito.UserPoolEmail.withSES({
        fromEmail: emailSender.emailIdentityName,
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
  }
}
