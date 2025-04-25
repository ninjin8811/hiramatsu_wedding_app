output "vercel_project_id" {
  value = module.vercel.vercel_project_id
}

output "vercel_api_token" {
  value = var.vercel_api_token
  sensitive = true
}

output "vercel_app_name" {
  value = var.vercel_app_name
}

output "vercel_production_domain_name" {
  value = var.vercel_production_domain_name
}

output "vercel_development_domain_name" {
  value = var.vercel_development_domain_name
}