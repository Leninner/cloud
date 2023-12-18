import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as congnito from "aws-cdk-lib/aws-cognito";

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ridesTable = this.createDynamoDBTable();
    const lambdaRole = this.generateLambdaRole(ridesTable.tableArn);
    const lambda = this.generateLambdaFunction(lambdaRole);
    const api = this.generateApiGateway();
    this.generateResourceAndMethod(api, lambda);
  }

  private createDynamoDBTable(): dynamodb.Table {
    const ridesTable = new dynamodb.Table(this, "Rides", {
      tableName: "Rides",
      partitionKey: {
        name: "RideId",
        type: dynamodb.AttributeType.STRING,
      },
    });

    new cdk.CfnOutput(this, "RidesTableARN", {
      value: ridesTable.tableArn,
      description: "The ARN of the Rides table",
    });

    return ridesTable;
  }

  private generateLambdaRole(tableArn: string): iam.Role {
    return new iam.Role(this, "LambdaRoleForLambda", {
      roleName: "WildRydesLambdaRole",
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
      inlinePolicies: {
        DynamoDBWriteAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["dynamodb:PutItem"],
              resources: [tableArn],
            }),
          ],
        }),
      },
    });
  }

  private generateLambdaFunction(role: iam.Role): lambda.Function {
    return new lambda.Function(this, "RequestRideFunction", {
      functionName: "RequestUnicorn",
      role: role,
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: "ridesUnicorn.handler",
      code: lambda.Code.fromAsset("lambda/ridesUnicorn.zip"),
    });
  }

  private generateApiGateway(): apigateway.RestApi {
    const api = new apigateway.RestApi(this, "WildRydesApi", {
      restApiName: "WildRydes",
      endpointTypes: [apigateway.EndpointType.EDGE],
      deployOptions: {
        stageName: "prod",
      },
    });

    new cdk.CfnOutput(this, "ApiEndpoint", {
      value: api.url,
    });

    return api;
  }

  private generateResourceAndMethod(
    api: apigateway.RestApi,
    lambdaFunction: lambda.Function
  ) {
    const rides = api.root.addResource("ride", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const requestRideIntegration = new apigateway.LambdaIntegration(
      lambdaFunction,
      {
        proxy: true,
      }
    );

    const userPoolArn = cdk.Fn.importValue("userPoolArn");
    const userPool = congnito.UserPool.fromUserPoolArn(
      this,
      "CognitoUserPool",
      userPoolArn
    );

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      "CognitoUserPoolsAuthorizer",
      {
        cognitoUserPools: [userPool],
        identitySource: "method.request.header.Authorization",
        authorizerName: "CognitoUserPoolsAuthorizer",
      }
    );

    rides.addMethod("POST", requestRideIntegration, {
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer,
    });
  }
}
