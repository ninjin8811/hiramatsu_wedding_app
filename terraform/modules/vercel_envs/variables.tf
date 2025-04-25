variable "vercel_project_id" {
  type = string
}

variable "firebase_config_base64" {
  type = string
}

variable "admin_sdk_key_base64" {
  type = string
  sensitive = true
}

variable "targets" {
  type = list(string)
  default = ["preview"]
}