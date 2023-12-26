resource "aws_dynamodb_table" "rides" {
  name     = "Rides"
  hash_key = "RideId"
  billing_mode = "PAY_PER_REQUEST"
  attribute {
    name = "RideId"
    type = "S"
  }
}

data "aws_iam_policy" "AWSLambdaBasicExecutionRole" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role" "wild_rydes_lambda_role" {
  name                = "WildRydesLambdaRole"
  managed_policy_arns = [data.aws_iam_policy.AWSLambdaBasicExecutionRole.arn]
  inline_policy {
    name = "WildRydesLambdaRoleInlinePolicy"
    policy = jsonencode({
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Action" : [
            "dynamodb:PutItem",
          ],
          "Resource" : [
            aws_dynamodb_table.rides.arn
          ],
          "Effect" : "Allow"
        },
      ]
    })
  }
  assume_role_policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Action" : [
            "sts:AssumeRole"
          ],
          "Effect" : "Allow",
          "Principal" : {
            "Service" : [
              "lambda.amazonaws.com"
            ]
          }
        },
      ]
    }
  )
}

data "archive_file" "lambda" {
  type        = "zip"
  source_file = "${path.module}/lambda/rides.js"
  output_path = "${path.module}/lambda/rides.zip"
}

resource "aws_lambda_function" "request_unicorn" {
  role          = aws_iam_role.wild_rydes_lambda_role.arn
  function_name = "RequestUnicorn"
  runtime       = "nodejs16.x"
  filename      = data.archive_file.lambda.output_path
  handler       = "rides.handler"
  timeout       = 30
}

resource "aws_api_gateway_rest_api" "wild_rydes_api" {
  name = "WildRydes"
  endpoint_configuration {
    types = ["EDGE"]
  }
}

resource "aws_api_gateway_authorizer" "cognito_pool_authorizer" {
  name            = "CognitoUserPoolsAuthorizer"
  rest_api_id     = aws_api_gateway_rest_api.wild_rydes_api.id
  type            = "COGNITO_USER_POOLS"
  identity_source = "method.request.header.Authorization"
  provider_arns   = [var.user_pool_arn]
}

resource "aws_api_gateway_resource" "resource" {
  path_part   = "resource"
  parent_id   = aws_api_gateway_rest_api.wild_rydes_api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.wild_rydes_api.id
}

resource "aws_api_gateway_method" "wild_rydes_post_method" {
  rest_api_id   = aws_api_gateway_rest_api.wild_rydes_api.id
  resource_id   = aws_api_gateway_resource.resource.id
  http_method   = "POST"
  authorizer_id = aws_api_gateway_authorizer.cognito_pool_authorizer.id
  authorization = "COGNITO_USER_POOLS"

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_integration" "wild_rydes_api_lambda" {
  rest_api_id             = aws_api_gateway_rest_api.wild_rydes_api.id
  resource_id             = aws_api_gateway_resource.resource.id
  http_method             = aws_api_gateway_method.wild_rydes_post_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.request_unicorn.invoke_arn
}

resource "aws_api_gateway_deployment" "wild_rydes_api" {
  depends_on = [aws_api_gateway_integration.wild_rydes_api_lambda]

  rest_api_id = aws_api_gateway_rest_api.wild_rydes_api.id
  stage_name  = "production"
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.request_unicorn.function_name
  principal     = "apigateway.amazonaws.com"
}