data "google_firebase_web_app_config" "default" {
  provider   = google-beta
  project    = google_project.default.project_id
  web_app_id = google_firebase_web_app.default.app_id
}
