# Integration Configuration Prompt

Generate deployment configuration to run these repositories together.

## Repository Analysis:
{{repoSummaries}}

## Task:
Generate Docker and deployment configuration. Return a JSON object:

```json
{
  "dockerCompose": {
    "filename": "docker-compose.yml",
    "code": "# Full docker-compose.yml content\nservices:\n  ..."
  },
  "dockerfiles": [
    {
      "service": "frontend",
      "filename": "frontend/Dockerfile",
      "code": "# Dockerfile for frontend\n..."
    },
    {
      "service": "backend", 
      "filename": "backend/Dockerfile",
      "code": "# Dockerfile for backend\n..."
    }
  ],
  "envFile": {
    "filename": ".env",
    "code": "# Environment variables\n..."
  },
  "startupScript": {
    "filename": "start.sh",
    "code": "#!/bin/bash\n# Startup script\n..."
  },
  "nginxConfig": {
    "filename": "nginx.conf",
    "code": "# Nginx reverse proxy config if needed\n..."
  },
  "readme": {
    "filename": "INTEGRATION.md",
    "code": "# Integration Guide\n\n## How to run\n..."
  }
}
```

Generate REAL, WORKING configuration based on the actual frameworks detected. Return ONLY valid JSON.
