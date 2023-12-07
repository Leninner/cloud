import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as resourcegroups from "aws-cdk-lib/aws-resourcegroups";
import * as applicationinsights from "aws-cdk-lib/aws-applicationinsights";
import * as iam from "aws-cdk-lib/aws-iam";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";

export class ChatgptLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const discordWebhook = secretsmanager.Secret.fromSecretNameV2(
      this,
      "DiscordWebhook",
      "discord-webhook"
    );
    const chatgptApiKey = secretsmanager.Secret.fromSecretNameV2(
      this,
      "ChatgptApiKey",
      "chatgpt-apikey-dev"
    );
    const prospeoApiKey = secretsmanager.Secret.fromSecretNameV2(
      this,
      "ProspeoApiKey",
      "prospeo-apikey-dev"
    );

    const diagnobotCompaniesTable = new dynamodb.Table(
      this,
      "DiagnobotCompaniesTable",
      {
        tableName: "diagnobot-companies-dev",
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
        sortKey: { name: "created", type: dynamodb.AttributeType.STRING },
        stream: dynamodb.StreamViewType.NEW_IMAGE,
      }
    );

    const lambdaRole = new iam.Role(this, "ChatgptLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    lambdaRole.addToPolicy(
      new iam.PolicyStatement({
        resources: [discordWebhook.secretArn, chatgptApiKey.secretArn, prospeoApiKey.secretArn],
        actions: ["secretsmanager:GetSecretValue"],
      })
    );

    const chatgptLambdaFunction = new lambda.NodejsFunction(
      this,
      "ChatgptLambdaFunction",
      {
        bundling: {
          target: 'es2020',
          keepNames: true,
          logLevel: lambda.LogLevel.INFO,
          sourceMap: true,
          minify: true,
        },
        entry: "typescript/src/handlers/chatGPTPrompt.ts",
        handler: "chatGPTPrompt.lambdaHandler",
        runtime: Runtime.NODEJS_18_X,
        architecture: Architecture.X86_64,
        memorySize: 300,
        functionName: "chatgpt-prompt-dev",
        timeout: cdk.Duration.seconds(350),
        environment: {
          DISCORD_WEBHOOK: discordWebhook.secretArn,
          CHATGPT_APIKEY: chatgptApiKey.secretArn,
          PROSPEO_APIKEY: prospeoApiKey.secretArn,
          ENVIRONMENT: "dev",
        },
        role: lambdaRole,
      }
    );

    diagnobotCompaniesTable.grantStreamRead(chatgptLambdaFunction);

    new events.Rule(this, "DynamoDBStreamEventRule", {
      eventPattern: {
        source: ["aws.dynamodb"],
        detailType: ["AWS API Call via CloudTrail"],
        resources: [diagnobotCompaniesTable.tableArn],
        detail: {
          eventSource: ["dynamodb.amazonaws.com"],
          eventName: ["Insert", "Modify", "Remove"],
        },
      },
    }).addTarget(new targets.LambdaFunction(chatgptLambdaFunction));

    const resourceGroup = new resourcegroups.CfnGroup(
      this,
      "ApplicationResourceGroup",
      {
        name: `ApplicationInsights-SAM-${this.stackName}`,
        resourceQuery: {
          type: "CLOUDFORMATION_STACK_1_0",
        },
      }
    );

    const appInsights = new applicationinsights.CfnApplication(
      this,
      "ApplicationInsightsMonitoring",
      {
        resourceGroupName: resourceGroup.ref,
        autoConfigurationEnabled: true,
      }
    );

    appInsights.addDependency(resourceGroup);

    new cdk.CfnOutput(this, "ChatGPTPromptFunctionOutput", {
      description: "ChatGPTPromptFunction Lambda Function ARN",
      value: chatgptLambdaFunction.functionArn,
    });

    new cdk.CfnOutput(this, "ChatGPTPromptFunctionIamRoleOutput", {
      description:
        "Implicit IAM Role created for ChatGPTPromptFunction function",
      value: lambdaRole.roleArn,
    });
  }
}
