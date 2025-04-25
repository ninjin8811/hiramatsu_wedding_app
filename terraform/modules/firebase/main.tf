terraform {
  required_providers {
    google-beta = {
      configuration_aliases = [
        google-beta,
        google-beta.no_user_project_override
      ]
    }
  }
}

# GCPプロジェクトの作成
resource "google_project" "default" {
  provider        = google-beta.no_user_project_override
  name            = var.project_id
  project_id      = var.project_id
  billing_account = var.billing_account
  deletion_policy = "DELETE"

  labels = {
    "firebase" = "enabled"
  }
}

# 各APIの有効化
resource "google_project_service" "default" {
  provider = google-beta.no_user_project_override
  project  = google_project.default.project_id
  for_each = toset([
    "serviceusage.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudbilling.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "compute.googleapis.com",
    "firebase.googleapis.com",
    "identitytoolkit.googleapis.com",
    "firestore.googleapis.com",
    "firebaserules.googleapis.com",
    "firebasestorage.googleapis.com",
    "storage.googleapis.com",
    "cloudfunctions.googleapis.com",
    "firebasehosting.googleapis.com",
    "firebaseextensions.googleapis.com",
  ])
  service            = each.key
  disable_on_destroy = false
}

# Firebaseの有効化
resource "google_firebase_project" "default" {
  provider = google-beta
  project  = google_project.default.project_id

  depends_on = [
    google_project_service.default
  ]
}

# Firestore
resource "google_firestore_database" "default" {
  provider                    = google-beta.no_user_project_override
  project                     = google_project.default.project_id
  name                        = "(default)"
  location_id                 = var.region
  type                        = "FIRESTORE_NATIVE"
  concurrency_mode            = "OPTIMISTIC"
  app_engine_integration_mode = "DISABLED"

  depends_on = [
    google_firebase_project.default,
  ]
}

# Firebase の Cloud Storage を使用するには 先に App Engine の有効化が必要
resource "google_app_engine_application" "default" {
  provider    = google-beta
  project     = google_project.default.project_id
  location_id = var.region

  # Cloud Firestore DB を作成する場合は、その作成を待つ必要がある
  depends_on = [
    google_firestore_database.default,
  ]
}

# Storage バケット
resource "google_storage_bucket" "default" {
  provider                    = google-beta
  project                     = google_project.default.project_id
  name                        = google_project.default.project_id
  location                    = var.region
  storage_class               = "STANDARD"
  force_destroy               = true
  uniform_bucket_level_access = true
  depends_on = [
    google_app_engine_application.default,
  ]
}

resource "google_firebase_storage_bucket" "default" {
  provider  = google-beta
  project   = google_project.default.project_id
  bucket_id = google_storage_bucket.default.id
  depends_on = [
    google_project_service.default
  ]
}


# FirebaseAuthenticationの有効化
resource "google_identity_platform_config" "default" {
  provider = google-beta
  project  = google_project.default.project_id

  # Providerによる認証については。google credentialsの情報が必要であり、
  # 手動で設定する方が簡素であるため、terraform設定しない
  # 自動化できる場合は修正したい。

  sign_in {
    anonymous {
      enabled = var.enable_anonymous_signin
    }
    email {
      enabled           = false
      password_required = false
    }
    phone_number {
      enabled            = false
      test_phone_numbers = {}
    }
  }

  authorized_domains = concat([ "localhost" ], var.authentication_domains)

  depends_on = [
    google_project_service.default,
  ]
}

resource "google_firebase_web_app" "default" {
  provider        = google-beta
  project         = google_project.default.project_id
  display_name    = "web_app"
  deletion_policy = "DELETE"
}

resource "google_service_account" "admin_sdk" {
  provider     = google-beta
  project      = google_project.default.project_id
  account_id   = "terraform-admin-sdk"
  display_name = "Admin SDK created by Terraform"
}

resource "google_project_iam_member" "token_creator" {
  provider = google-beta
  project  = google_project.default.project_id
  role     = "roles/iam.serviceAccountTokenCreator"
  member   = "serviceAccount:${google_service_account.admin_sdk.email}"
}

resource "google_project_iam_member" "admin_sdk" {
  provider = google-beta
  project  = google_project.default.project_id
  role     = "roles/firebase.sdkAdminServiceAgent"
  member   = "serviceAccount:${google_service_account.admin_sdk.email}"
}

resource "google_service_account_key" "admin_sdk" {
  provider           = google-beta
  service_account_id = google_service_account.admin_sdk.name
}

# data "google_compute_default_service_account" "default" {
#   provider = google-beta
#   project = google_project.default.project_id
# }

# resource "google_project_iam_member" "service_account_token_creator" {
#   provider = google-beta
#   project = google_project.default.project_id
#   role    = "roles/iam.serviceAccountTokenCreator"
#   member  = "serviceAccount:${data.google_compute_default_service_account.default.email}"
#   depends_on = [
#     google_project_service.default
#   ]
# }