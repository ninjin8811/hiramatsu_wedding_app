output "firebase_config_base64" {
  value = base64encode(jsonencode(data.google_firebase_web_app_config.default))
}


output "admin_sdk_service_account_key_base64" {
  value     = google_service_account_key.admin_sdk.private_key
  sensitive = true
}