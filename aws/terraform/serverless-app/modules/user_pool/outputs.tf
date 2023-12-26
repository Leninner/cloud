output "UserPoolId" {
  value = aws_cognito_user_pool.wild_rydes.id
}

output "UserPoolClientId" {
  value = aws_cognito_user_pool_client.wildRydes_web_app.id
}

output "user_pool_arn" {
  value = aws_cognito_user_pool.wild_rydes.arn
}
