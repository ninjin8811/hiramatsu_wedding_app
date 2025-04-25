variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "asia-northeast1"
}

variable "billing_account" {
  type    = string
  default = "0122CC-47AD68-05BF02"
}

variable "vercel_env_targets" {
  type    = list(string)
  default = ["preview"]
}