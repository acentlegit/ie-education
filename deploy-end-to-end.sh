#!/bin/bash
set -e

echo "================================================="
echo " END-TO-END DEPLOYMENT: Mac → GitHub → AWS (DEV)"
echo "================================================="

### INPUTS
read -p "GitHub repo name: " REPO
read -p "AWS region (us-east-1): " REGION
read -p "S3 bucket name (frontend): " BUCKET

REGION=${REGION:-us-east-1}
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
GITHUB_USER=$(gh api user -q .login)

echo "AWS Account: $ACCOUNT_ID"
echo "GitHub User: $GITHUB_USER"

### STEP 1 — UNZIP TEMPLATE
echo "➡️  Unzipping one-click repo template"
unzip -o one-click-ecs-repo.zip
cd one-click-ecs-repo

### STEP 2 — INIT GIT
echo "➡️  Initializing git"
git init
git branch -M develop
git add .
git commit -m "Initial one-click deployment repo"

### STEP 3 — CREATE GITHUB REPO
echo "➡️  Creating GitHub repo"
gh repo create "$REPO" \
  --public \
  --source=. \
  --remote=origin \
  --push

### STEP 4 — ADD REQUIRED GITHUB SECRET
echo "➡️  Setting GitHub secret AWS_ACCOUNT_ID"
gh secret set AWS_ACCOUNT_ID --body "$ACCOUNT_ID"

### STEP 5 — VERIFY WORKFLOW EXISTS
echo "➡️  Verifying GitHub Actions workflow"
if [ ! -f ".github/workflows/deploy.yml" ]; then
  echo "❌ deploy.yml not found"
  exit 1
fi
echo "✅ Workflow found"

### STEP 6 — VERIFY AWS OIDC ROLE
ROLE="github-dev-deploy"
echo "➡️  Verifying IAM role: $ROLE"
aws iam get-role --role-name "$ROLE" >/dev/null \
  && echo "✅ IAM role exists" \
  || {
    echo "❌ IAM role $ROLE missing"
    echo "Create it before continuing"
    exit 1
  }

### STEP 7 — UPDATE TERRAFORM VARS
echo "➡️  Writing terraform variables"
cat <<EOF > infra/terraform.tfvars
project_name = "$REPO"
region       = "$REGION"
EOF

### STEP 8 — PUSH TO DEPLOY DEV
echo "➡️  Triggering DEV deployment"
git push origin develop

echo "================================================="
echo " DEPLOYMENT TRIGGERED"
echo "================================================="
echo
echo "Next:"
echo "1. Open GitHub → Actions"
echo "2. Watch workflow: One Click Deploy"
echo "3. Wait for green checkmark"

