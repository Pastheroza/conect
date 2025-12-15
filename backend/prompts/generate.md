# Code Generation Prompt

Generate integration code to connect these repositories.

## Repository Analysis:
{{repoSummaries}}

## Interface Matching Results:
{{matchResults}}

## Task:
Generate code to integrate these repositories. Return a JSON object with code as simple strings (use \n for newlines):

```json
{
  "apiClient": "const API_URL = process.env.API_URL;\n\nexport async function getJobs() {\n  return fetch(`${API_URL}/api/jobs`).then(r => r.json());\n}",
  "corsConfig": "import cors from 'cors';\napp.use(cors({ origin: process.env.FRONTEND_URL }));",
  "missingEndpoints": "app.get('/api/jobs', (req, res) => res.json([]));\napp.get('/api/jobs/:id', (req, res) => res.json({}));",
  "sharedTypes": "export interface Job { id: string; title: string; }\nexport interface Post { id: string; content: string; }"
}
```

Rules:
- Use \n for newlines in code strings
- Escape quotes properly
- Keep code concise but functional
- Return ONLY valid JSON, no markdown
