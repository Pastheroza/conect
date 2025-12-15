# Repository Analysis Prompt

Analyze this repository and extract key information.

## Repository: {{repoUrl}}

## Files:
{{fileList}}

## Key File Contents:
{{fileContents}}

## Task:
Analyze this codebase and return a JSON object with:

```json
{
  "purpose": "Brief description of what this repo does",
  "type": "frontend|backend|fullstack|library|database|other",
  "framework": "react|nextjs|express|fastapi|flask|django|other",
  "language": "javascript|typescript|python|go|other",
  "apiEndpoints": [
    { "method": "GET|POST|PUT|DELETE", "path": "/api/...", "description": "what it does" }
  ],
  "apiCalls": [
    { "method": "GET|POST|PUT|DELETE", "path": "/api/...", "file": "source file" }
  ],
  "dataModels": [
    { "name": "User", "fields": ["id", "email", "name"] }
  ],
  "dependencies": ["key external services or APIs it depends on"],
  "envVars": ["required environment variables"],
  "entryPoint": "main file to start the app"
}
```

Return ONLY valid JSON, no markdown or explanation.
