terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.31.0"
    }
  }

  required_version = ">= 1.6.6"
}

provider "aws" {
  region = "us-east-1"
}

module "code_commit_module" {
  source = "./modules/code_commit"
}

module "user_pool_module" {
  source     = "./modules/user_pool"
  depends_on = [module.code_commit_module]

  email_sender = var.email_sender
}

module "backend_module" {
  source     = "./modules/backend_module"
  depends_on = [module.user_pool_module]

  user_pool_arn = module.user_pool_module.user_pool_arn
}