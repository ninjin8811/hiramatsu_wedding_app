output "ENV_NEXT_PUBLIC_FIREBASE_CONFIG_BASE64" {
  value = module.firebase.firebase_config_base64
}

output "ENV_ADMIN_SDK_SERVICE_ACCOUNT_KEY_BASE64" {
  value = module.firebase.admin_sdk_service_account_key_base64
  sensitive = true
}