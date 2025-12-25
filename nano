#!/bin/bash
set -e

echo "============================================"
echo " Setting up Terraform + GitHub Actions infra"
echo "============================================"

REPO_NAME="ie-education"
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="260476742932"
IAM_ROLE="github-dev-deploy"

# ----------------------------
# Create folders
# ----------------------------
mkdir -p infra
mkdir -p .github/workflows

# ----------------------------
# .gitignore
# ----------------------------
cat <<EOF > .gitignore
.DS_Store
.terraform/
terraform.tfstate
terraform.tfstate.*
EOF

# ----------------------------
# Terraform versions
# ----------------------------
cat <<EOF > infra/versions.tf
terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
EOF

# ----------------------------
# Terraform provider
# ----------------------------
cat <<EOF > infra/main.tf
provider "aws" {
  region = "$AWS_REGION"
}
EOF

# ----------------------------
# ECS Cluster
# ----------------------------
cat <<EOF > infra/ecs.tf
resource "aws_ecs_cluster" "main" {
  name = "$REPO_NAME-cluster"
}
EOF

# ----------------------------
# GitHub Actions workflow
# ----------------------------
cat <<EOF > .github/workflows/deploy.yml
name: One Click Deploy (Dev)

on:
  push:
    branches:
      - develop

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Configure AWS credentials (OIDC)
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::$AWS_ACCOUNT_ID:role/$IAM_ROLE
          aws-region: $AWS_REGION

      - name: Verify AWS identity
        run: aws sts get-caller-identity

      - name: Terraform Init
        run: |
          cd infra
          terraform init

      - name: Terraform Apply
        run: |
          cd infra
          terraform apply -auto-approve
EOF

# ----------------------------
# README
# ----------------------------
cat <<EOF > README.md
# ie-education

One-click GitHub → AWS deployment using:

- GitHub Actions
- AWS OIDC (no access keys)
- Terraform
- ECS (cluster only for now)

## Deploy
Push to \`develop\` branch.
EOF

# ----------------------------
# Git commit & push
# ----------------------------
git add .
git commit -m "Add Terraform infra and ECS cluster via GitHub Actions"
git push origin develop

echo "============================================"
echo " DONE"
echo " GitHub Actions is now running"
echo "============================================"

