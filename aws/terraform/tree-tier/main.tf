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

# Part 1: Networking and security

# Classless Inter-Domain Routing (CIDR) is a method for allocating IP addresses and routing Internet Protocol packets.

## VPC and subnets
resource "aws_vpc" "vpc_web_app" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "main"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_subnet" "subnets_web_app" {
  count             = 6
  vpc_id            = aws_vpc.vpc_web_app.id
  cidr_block        = cidrsubnet(aws_vpc.vpc_web_app.cidr_block, 8, count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index % 2]

  tags = {
    Name = "Public-Subnet-AZ${count.index % 2 + 1}"
  }
}

## Internet connectivity

resource "aws_internet_gateway" "internet_gateway" {
  vpc_id = aws_vpc.vpc_web_app.id

  tags = {
    Name = "tree-tier-igw"
  }
}

resource "aws_eip" "nat_eip_az2" {
  tags = {
    Name = "tree-tier-eip-az2"
  }

  depends_on = [aws_internet_gateway.internet_gateway]
}

resource "aws_eip" "nat_eip_az1" {
  tags = {
    Name = "tree-tier-eip-az1"
  }

  depends_on = [aws_internet_gateway.internet_gateway]
}

resource "aws_nat_gateway" "nat_gateway_az1" {
  allocation_id = aws_eip.nat_eip_az1.id
  subnet_id     = aws_subnet.subnets_web_app[0].id

  tags = {
    Name = "tree-tier-ngw1"
  }

  depends_on = [aws_internet_gateway.internet_gateway]
}

resource "aws_nat_gateway" "nat_gateway_az2" {
  allocation_id = aws_eip.nat_eip_az2.id
  subnet_id     = aws_subnet.subnets_web_app[1].id

  tags = {
    Name = "tree-tier-ngw2"
  }

  depends_on = [aws_internet_gateway.internet_gateway]
}
