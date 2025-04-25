variable "project_id" {
  description = "The project ID"
  type        = string
  nullable    = false
}

variable "billing_account" {
  description = "Billing account ID for the project"
  type        = string
  nullable    = false
}

variable "region" {
  type     = string
  nullable = false
}

variable "enable_anonymous_signin" {
  type    = bool
  default = false
}

variable "authentication_domains" {
  type    = list(string)
  default = []
}