terraform {
  required_version = "1.10.3"
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
  team = var.vercel_team_id
}
resource "vercel_project" "with_git" {
  name = var.vercel_app_name
  framework = "nextjs"
  root_directory = var.root_directory
  automatically_expose_system_environment_variables = true

  ignore_command = <<EOT
#!/bin/bash
# "root_directory" 以下に差分が無ければビルドをスキップ
if git diff --quiet HEAD^ HEAD -- ./; then
  echo "No changes in root_directory. Skipping build."
  exit 0
else
  echo "Changes detected in root_directory. Proceed with build."
  exit 1
fi
EOT

  git_repository = {
    type = "github"
    repo = var.github_repo
  }
}


resource "vercel_project_domain" "production" {
  project_id = vercel_project.with_git.id
  domain     = var.production_domain_name
}

resource "vercel_project_domain" "development" {
  project_id = vercel_project.with_git.id
  domain     = var.development_domain_name
  git_branch = "develop"
}

resource "vercel_project_deployment_retention" "default" {
  project_id            = vercel_project.with_git.id
  team_id               = var.vercel_team_id
  expiration_preview    = "1m"
  expiration_production = "unlimited"
  expiration_canceled   = "1m"
  expiration_errored    = "1m"
}
