# Interface Matching Prompt

Compare these repositories and identify integration points.

## Repositories:
{{repoSummaries}}

## Task:
Analyze how these repositories can be integrated. Return a JSON object:

```json
{
  "integrationStrategy": "Description of how these repos should work together",
  "matches": [
    {
      "frontend": { "method": "GET", "path": "/api/users", "file": "src/api.js" },
      "backend": { "method": "GET", "path": "/api/users", "file": "routes/users.py" },
      "compatible": true,
      "notes": "Direct match, no changes needed"
    }
  ],
  "mismatches": [
    {
      "issue": "Frontend calls /api/user but backend has /api/users",
      "frontend": { "method": "GET", "path": "/api/user" },
      "backend": { "method": "GET", "path": "/api/users" },
      "solution": "Create adapter or update frontend path"
    }
  ],
  "missingEndpoints": [
    {
      "calledBy": "frontend",
      "method": "POST",
      "path": "/api/comments",
      "suggestedImplementation": "Add comments endpoint to backend"
    }
  ],
  "sharedDataModels": [
    {
      "name": "User",
      "frontendShape": { "id": "number", "name": "string" },
      "backendShape": { "id": "int", "username": "str" },
      "mapping": "name -> username"
    }
  ],
  "configurationNeeded": [
    "CORS setup for frontend origin",
    "Shared database connection string"
  ]
}
```

Return ONLY valid JSON, no markdown or explanation.
