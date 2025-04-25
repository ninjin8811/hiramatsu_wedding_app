terraform {
  required_version = "1.10.3"
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 6.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
  }
  backend "gcs" {
    bucket = "firelaunch_terraform"
    prefix = "wedding-app/dev" # プロジェクト名/環境名
  }
}

provider "google-beta" {
  alias                 = "default"
  user_project_override = true
  region                = var.region
}

# クォータチェック(上限割り当て)を回避したプロバイダの設定
provider "google-beta" {
  alias                 = "no_user_project_override"
  user_project_override = false
}

provider "vercel" {
  api_token = data.terraform_remote_state.common.outputs.vercel_api_token
}

module "firebase" {
  source = "../../modules/firebase"
  providers = {
    google-beta                          = google-beta.default
    google-beta.no_user_project_override = google-beta.no_user_project_override
  }
  project_id              = var.project_id
  billing_account         = var.billing_account
  region                  = var.region
  authentication_domains = [
    data.terraform_remote_state.common.outputs.vercel_development_domain_name
  ]
  enable_anonymous_signin = true
}

module "vercel_envs" {
  source                 = "../../modules/vercel_envs"
  vercel_project_id      = data.terraform_remote_state.common.outputs.vercel_project_id
  firebase_config_base64 = module.firebase.firebase_config_base64
  admin_sdk_key_base64   = module.firebase.admin_sdk_service_account_key_base64
  targets                = var.vercel_env_targets
}