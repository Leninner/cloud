resource "aws_ses_email_identity" "email_sender" {
  email = var.email_sender
}

resource "aws_cognito_user_pool" "wild_rydes" {
  name                       = "WildRydes"
  alias_attributes           = ["preferred_username"]
  email_verification_message = "Your verification code is {####}."
  email_verification_subject = "Your verification code for WildRydes"

  email_configuration {
    email_sending_account = "DEVELOPER"
    from_email_address    = var.email_sender
    source_arn            = aws_ses_email_identity.email_sender.arn
  }
}

resource "aws_cognito_user_pool_client" "wildRydes_web_app" {
  name         = "WildRydesWebApp"
  user_pool_id = aws_cognito_user_pool.wild_rydes.id
}
