terraform {
  required_version = ">= 1.6.6"

  cloud {
    organization = "leninner"

    workspaces {
      name = "go-tree-tier-arquitecture"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.33.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# Part 0: Setup

resource "aws_s3_bucket" "web_app_bucket" {
  bucket        = "web-app-bucket-leninner"
  force_destroy = true
}

resource "aws_iam_role" "ec2_web_app_role" {
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
  managed_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
    "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess",
  ]
  name = "ec2_web_app_role"
}
