terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.51.0"
    }
  }
}

provider "google" {
  project = "your-project-id"
  region  = "us-central1"
}

# Cloud SQL Instance
resource "google_sql_database_instance" "default" {
  name             = "eduerp-db-instance"
  database_version = "POSTGRES_15"
  region           = "us-central1"

  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled = true
    }
  }
  deletion_protection = false # For MVP/Demo only
}

resource "google_sql_database" "database" {
  name     = "eduerp"
  instance = google_sql_database_instance.default.name
}

resource "google_sql_user" "users" {
  name     = "db-user"
  instance = google_sql_database_instance.default.name
  password = "changeme"
}

# Cloud Run Service (Backend)
resource "google_cloud_run_v2_service" "api" {
  name     = "eduerp-api"
  location = "us-central1"
  ingress = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = "gcr.io/your-project-id/eduerp-api:latest"
      env {
        name  = "DATABASE_URL"
        value = "postgresql://db-user:changeme@${google_sql_database_instance.default.public_ip_address}/eduerp"
      }
    }
  }
}

# Setup proper IAM for Cloud Run to access SQL in real scenarios (Cloud SQL Auth Proxy recommended)
