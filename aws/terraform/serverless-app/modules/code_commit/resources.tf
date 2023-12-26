resource "aws_codecommit_repository" "wildrydes_site" {
  repository_name = "wildrydes_site"
  description     = "Wild Rydes sample application for Serverless Stack"
  default_branch  = "main"
}

resource "aws_iam_user" "user_for_codecommit" {
  name          = "user_for_codecommit"
  path          = "/"
  force_destroy = true
}

resource "aws_iam_user_login_profile" "user_for_codecommit_password" {
  user            = aws_iam_user.user_for_codecommit.name
  password_length = 8
}

data "aws_iam_policy" "codecommit_user_policy" {
  arn = "arn:aws:iam::aws:policy/AWSCodeCommitPowerUser"
}

resource "aws_iam_user_policy_attachment" "user_for_codecommit_policy" {
  user       = aws_iam_user.user_for_codecommit.name
  policy_arn = data.aws_iam_policy.codecommit_user_policy.arn
}

resource "aws_iam_policy" "codecommit_user_policy" {
  name        = "codecommit_user_policy"
  path        = "/"
  description = "IAM policy to grant pull and push access to CodeCommit repositories"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        "Action" : [
          "codecommit:GitPull",
          "codecommit:GitPush"
        ],
        "Resource" : [
          aws_codecommit_repository.wildrydes_site.arn
        ],
        "Effect" : "Allow"
      },
    ]
  })
}

resource "aws_iam_role" "amplify_service_role_for_codecommit" {
  name        = "amplify_service_role_for_codecommit"
  description = "amplify service role for codecommit"
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
              "amplify.amazonaws.com"
            ]
          }
        },
      ]
    }
  )
  inline_policy {
    name = "amplify_service_role_for_codecommit_inline_policy"
    policy = jsonencode({
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Action" : [
            "codecommit:GitPull",
          ],
          "Resource" : [
            aws_codecommit_repository.wildrydes_site.arn
          ],
          "Effect" : "Allow"
        },
      ]
    })
  }
}

resource "aws_amplify_app" "wildrydes_site" {
  name                 = "wildrydes_site"
  repository           = aws_codecommit_repository.wildrydes_site.clone_url_http
  iam_service_role_arn = aws_iam_role.amplify_service_role_for_codecommit.arn
}

resource "aws_amplify_branch" "main" {
  branch_name = "main"
  app_id      = aws_amplify_app.wildrydes_site.id
}
