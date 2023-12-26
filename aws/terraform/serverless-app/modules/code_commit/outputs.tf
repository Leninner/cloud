output "amplify_app_id" {
  value = aws_amplify_app.wildrydes_site.id
}

output "amplify_app_url" {
  value = "https://main.${aws_amplify_app.wildrydes_site.id}.amplifyapp.com"
}

output "code_commit_repository_url" {
  value = aws_codecommit_repository.wildrydes_site.clone_url_http
}

output "iam_user_password" {
  value = aws_iam_user_login_profile.user_for_codecommit_password.password
}

output "username" {
  value = aws_iam_user.user_for_codecommit.name
}
