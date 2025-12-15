# Code Generation Prompt

Generate integration code to connect these repositories.

## Repository Analysis:
{{repoSummaries}}

## Interface Matching Results:
{{matchResults}}

## Task:
Generate the actual code needed to integrate these repositories. Return a JSON object:

```json
{
  "apiClient": {
    "filename": "api-client.ts",
    "language": "typescript",
    "code": "// Full TypeScript API client code that the frontend can use\n// Include all endpoints, types, error handling\n..."
  },
  "corsConfig": {
    "filename": "cors-config.js",
    "language": "javascript",
    "code": "// CORS middleware configuration\n..."
  },
  "adapters": [
    {
      "filename": "user-adapter.ts",
      "purpose": "Transforms frontend User to backend User format",
      "code": "// Adapter code\n..."
    }
  ],
  "missingEndpoints": [
    {
      "filename": "comments-routes.py",
      "language": "python",
      "framework": "fastapi",
      "code": "# Full implementation of missing endpoint\n..."
    }
  ],
  "sharedTypes": {
    "filename": "shared-types.ts",
    "code": "// TypeScript interfaces for all shared data models\n..."
  },
  "envExample": {
    "filename": ".env.example",
    "code": "# Required environment variables\n..."
  }
}
```

Generate REAL, WORKING code - not placeholders. Return ONLY valid JSON.
