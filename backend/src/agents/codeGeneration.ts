import { error } from '../logger.js';
import { RepoSummary } from './repoAnalysis.js';
import { MatchResult } from './interfaceMatching.js';
import { loadPrompt, callGroqJson } from '../groq.js';

export interface GeneratedCode {
  apiClient?: string;
  corsConfig?: string;
  missingEndpoints?: string;
  sharedTypes?: string;
}

export async function generateCode(
  repos: RepoSummary[],
  matchResult: MatchResult
): Promise<GeneratedCode> {
  // If no GROQ_API_KEY, return basic templates
  if (!process.env.GROQ_API_KEY) {
    return generateBasicCode(repos, matchResult);
  }

  try {
    return await generateCodeWithAI(repos, matchResult);
  } catch (e) {
    error('AI code generation failed, using basic templates:', e);
    return generateBasicCode(repos, matchResult);
  }
}

async function generateCodeWithAI(
  repos: RepoSummary[],
  matchResult: MatchResult
): Promise<GeneratedCode> {
  const prompt = await loadPrompt('generate', {
    repoSummaries: JSON.stringify(repos.map(r => ({
      url: r.url,
      purpose: r.purpose,
      type: r.type,
      framework: r.framework,
      language: r.language,
      apiRoutes: r.apiRoutes,
      apiCalls: r.apiCalls,
    })), null, 2),
    matchResults: JSON.stringify({
      missingInBackend: matchResult.missingInBackend,
      mismatches: matchResult.mismatches,
    }, null, 2),
  });

  interface AIGeneratedCode {
    apiClient?: string;
    corsConfig?: string;
    missingEndpoints?: string;
    sharedTypes?: string;
  }

  const aiResult = await callGroqJson<AIGeneratedCode>(prompt, 4096);

  return {
    apiClient: aiResult.apiClient,
    corsConfig: aiResult.corsConfig,
    missingEndpoints: aiResult.missingEndpoints,
    sharedTypes: aiResult.sharedTypes,
  };
}

function generateBasicCode(repos: RepoSummary[], matchResult: MatchResult): GeneratedCode {
  const result: GeneratedCode = {};

  const frontendRepo = repos.find(r => 
    r.framework === 'react' || r.framework === 'nextjs'
  );
  const backendRepo = repos.find(r => 
    r.framework === 'express' || r.framework === 'fastapi' || r.framework === 'flask'
  );

  // Generate basic API client
  if (frontendRepo && backendRepo && backendRepo.apiRoutes.length > 0) {
    const routes = backendRepo.apiRoutes.slice(0, 10);
    result.apiClient = `// Auto-generated API client
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

${routes.map(route => {
  const name = route.replace(/[^a-zA-Z]/g, '_').replace(/_+/g, '_');
  return `export const fetch${name} = () => fetch(\`\${API_URL}${route}\`).then(r => r.json());`;
}).join('\n')}
`;
  }

  // Generate CORS config
  if (backendRepo) {
    result.corsConfig = generateCorsConfig(backendRepo.framework);
  }

  // Generate missing endpoint stubs
  if (matchResult.missingInBackend.length > 0 && backendRepo) {
    result.missingEndpoints = generateEndpointStubs(matchResult.missingInBackend, backendRepo.framework);
  }

  // Generate basic shared types
  if (backendRepo && backendRepo.apiRoutes.length > 0) {
    result.sharedTypes = `// Auto-generated shared types
${backendRepo.apiRoutes.slice(0, 5).map(route => {
  const name = route.split('/').pop()?.replace(/[^a-zA-Z]/g, '') || 'Item';
  return `export interface ${name.charAt(0).toUpperCase() + name.slice(1)} {\n  id: string;\n  // TODO: Add fields\n}`;
}).join('\n\n')}
`;
  }

  return result;
}

function generateCorsConfig(framework: string | null): string {
  if (framework === 'express') {
    return `// Add to your Express app
import cors from 'cors';
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));`;
  }
  if (framework === 'fastapi') {
    return `# Add to your FastAPI app
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)`;
  }
  if (framework === 'flask') {
    return `# Add to your Flask app
from flask_cors import CORS
CORS(app, origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")], supports_credentials=True)`;
  }
  return '';
}

function generateEndpointStubs(missing: { method: string; path: string }[], framework: string | null): string {
  const unique = [...new Map(missing.map(m => [`${m.method}:${m.path}`, m])).values()].slice(0, 10);
  
  if (framework === 'express') {
    return unique.map(m => 
      `app.${m.method.toLowerCase()}('${m.path}', (req, res) => {\n  // TODO: Implement\n  res.json({ message: 'Not implemented' });\n});`
    ).join('\n\n');
  }
  if (framework === 'fastapi') {
    return unique.map(m =>
      `@app.${m.method.toLowerCase()}("${m.path}")\nasync def ${m.path.replace(/[^a-zA-Z]/g, '_')}():\n    # TODO: Implement\n    return {"message": "Not implemented"}`
    ).join('\n\n');
  }
  if (framework === 'flask') {
    return unique.map(m =>
      `@app.route("${m.path}", methods=["${m.method}"])\ndef ${m.path.replace(/[^a-zA-Z]/g, '_')}():\n    # TODO: Implement\n    return jsonify({"message": "Not implemented"})`
    ).join('\n\n');
  }
  return '';
}
