import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { loadPrompt, callGroqJson } from '../groq.js';

const execAsync = promisify(exec);

export interface ApiCall {
  method: string;
  path: string;
  file: string;
}

export interface RepoSummary {
  url: string;
  language: string | null;
  framework: string | null;
  entryPoints: string[];
  apiRoutes: string[];
  apiCalls: ApiCall[];
  configFiles: string[];
  envVars: string[];
  dependencies: Record<string, string>;
  // AI-enhanced fields
  purpose?: string;
  type?: string;
  dataModels?: { name: string; fields: string[] }[];
}

export async function cloneRepo(url: string, targetDir: string): Promise<void> {
  await execAsync(`git clone --depth 1 ${url} ${targetDir}`);
}

export async function analyzeRepo(repoPath: string, url: string): Promise<RepoSummary> {
  // First do fast regex-based analysis
  const summary = await analyzeRepoBasic(repoPath, url);
  
  // Then enhance with AI if GROQ_API_KEY is set
  if (process.env.GROQ_API_KEY) {
    try {
      await enhanceWithAI(repoPath, summary);
    } catch (e) {
      console.error('AI analysis failed, using basic analysis:', e);
    }
  }
  
  return summary;
}

async function enhanceWithAI(repoPath: string, summary: RepoSummary): Promise<void> {
  // Collect key files for AI analysis
  const keyFiles = await collectKeyFiles(repoPath);
  
  const prompt = await loadPrompt('analyze', {
    repoUrl: summary.url,
    fileList: keyFiles.map(f => f.path).join('\n'),
    fileContents: keyFiles.map(f => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``).join('\n\n'),
  });

  interface AIAnalysis {
    purpose?: string;
    type?: string;
    framework?: string;
    language?: string;
    apiEndpoints?: { method: string; path: string; description?: string }[];
    apiCalls?: { method: string; path: string; file?: string }[];
    dataModels?: { name: string; fields: string[] }[];
    envVars?: string[];
    entryPoint?: string;
  }

  const aiResult = await callGroqJson<AIAnalysis>(prompt);
  
  // Merge AI results with basic analysis
  if (aiResult.purpose) summary.purpose = aiResult.purpose;
  if (aiResult.type) summary.type = aiResult.type;
  if (aiResult.framework && !summary.framework) summary.framework = aiResult.framework;
  if (aiResult.language && !summary.language) summary.language = aiResult.language;
  if (aiResult.dataModels) summary.dataModels = aiResult.dataModels;
  
  // Merge API endpoints
  if (aiResult.apiEndpoints) {
    for (const ep of aiResult.apiEndpoints) {
      if (!summary.apiRoutes.includes(ep.path)) {
        summary.apiRoutes.push(ep.path);
      }
    }
  }
  
  // Merge API calls
  if (aiResult.apiCalls) {
    for (const call of aiResult.apiCalls) {
      if (!summary.apiCalls.some(c => c.path === call.path && c.method === call.method)) {
        summary.apiCalls.push({ method: call.method, path: call.path, file: call.file || 'unknown' });
      }
    }
  }
  
  // Merge env vars
  if (aiResult.envVars) {
    for (const v of aiResult.envVars) {
      if (!summary.envVars.includes(v)) {
        summary.envVars.push(v);
      }
    }
  }
  
  if (aiResult.entryPoint && !summary.entryPoints.includes(aiResult.entryPoint)) {
    summary.entryPoints.push(aiResult.entryPoint);
  }
}

async function collectKeyFiles(repoPath: string): Promise<{ path: string; content: string }[]> {
  const keyFiles: { path: string; content: string }[] = [];
  const maxFiles = 10;
  const maxFileSize = 8000;
  
  // Priority files to analyze
  const priorityFiles = [
    'package.json', 'requirements.txt', 'pyproject.toml',
    'README.md', '.env.example',
    'src/index.ts', 'src/index.js', 'src/app.ts', 'src/app.js',
    'src/main.ts', 'src/main.js', 'main.py', 'app.py',
    'src/api.ts', 'src/api.js', 'api/index.ts', 'routes/index.ts',
  ];
  
  for (const file of priorityFiles) {
    if (keyFiles.length >= maxFiles) break;
    const fullPath = join(repoPath, file);
    if (await fileExists(fullPath)) {
      try {
        let content = await readFile(fullPath, 'utf-8');
        if (content.length > maxFileSize) {
          content = content.substring(0, maxFileSize) + '\n... (truncated)';
        }
        keyFiles.push({ path: file, content });
      } catch {}
    }
  }
  
  // Also find route/api files
  const routeFiles = await findFiles(repoPath, ['.ts', '.js', '.py']);
  for (const file of routeFiles) {
    if (keyFiles.length >= maxFiles) break;
    const relativePath = file.replace(repoPath + '/', '');
    if (relativePath.includes('route') || relativePath.includes('api') || relativePath.includes('endpoint')) {
      if (!keyFiles.some(f => f.path === relativePath)) {
        try {
          let content = await readFile(file, 'utf-8');
          if (content.length > maxFileSize) {
            content = content.substring(0, maxFileSize) + '\n... (truncated)';
          }
          keyFiles.push({ path: relativePath, content });
        } catch {}
      }
    }
  }
  
  return keyFiles;
}

async function analyzeRepoBasic(repoPath: string, url: string): Promise<RepoSummary> {
  const summary: RepoSummary = {
    url,
    language: null,
    framework: null,
    entryPoints: [],
    apiRoutes: [],
    apiCalls: [],
    configFiles: [],
    envVars: [],
    dependencies: {},
  };

  // Detect language and framework
  const files = await readdir(repoPath);
  
  // Check for monorepo structure (backend/, frontend/ folders)
  const checkPaths = [repoPath];
  if (files.includes('backend')) checkPaths.push(join(repoPath, 'backend'));
  if (files.includes('frontend')) checkPaths.push(join(repoPath, 'frontend'));
  
  for (const checkPath of checkPaths) {
    if (summary.framework) break;
    const checkFiles = checkPath === repoPath ? files : await readdir(checkPath);
    
    if (checkFiles.includes('package.json')) {
      summary.language = 'javascript';
      const pkg = JSON.parse(await readFile(join(checkPath, 'package.json'), 'utf-8'));
      summary.dependencies = { ...summary.dependencies, ...pkg.dependencies, ...pkg.devDependencies };
      
      if (pkg.dependencies?.['react'] || pkg.devDependencies?.['react']) summary.framework = 'react';
      else if (pkg.dependencies?.['next'] || pkg.devDependencies?.['next']) summary.framework = 'nextjs';
      else if (pkg.dependencies?.['express']) summary.framework = 'express';
      else if (pkg.dependencies?.['fastify']) summary.framework = 'fastify';
    }
    
    if (!summary.framework && (checkFiles.includes('requirements.txt') || checkFiles.includes('pyproject.toml'))) {
      summary.language = 'python';
      if (checkFiles.includes('requirements.txt')) {
        const reqs = await readFile(join(checkPath, 'requirements.txt'), 'utf-8');
        if (reqs.includes('fastapi')) summary.framework = 'fastapi';
        else if (reqs.includes('flask')) summary.framework = 'flask';
        else if (reqs.includes('django')) summary.framework = 'django';
      }
      if (!summary.framework && checkFiles.includes('pyproject.toml')) {
        const pyproj = await readFile(join(checkPath, 'pyproject.toml'), 'utf-8');
        if (pyproj.includes('fastapi')) summary.framework = 'fastapi';
        else if (pyproj.includes('flask')) summary.framework = 'flask';
        else if (pyproj.includes('django')) summary.framework = 'django';
      }
    }
  }

  // Find entry points
  const entryFiles = ['index.js', 'index.ts', 'main.py', 'app.py', 'server.js', 'server.ts'];
  for (const f of entryFiles) {
    if (files.includes(f) || files.includes('src') && await fileExists(join(repoPath, 'src', f))) {
      summary.entryPoints.push(f);
    }
  }

  // Find config files
  const configPatterns = ['.env.example', '.env.sample', 'config.json', 'config.yaml', 'docker-compose.yml', 'Dockerfile'];
  for (const f of files) {
    if (configPatterns.some(p => f.includes(p) || f === p)) {
      summary.configFiles.push(f);
    }
  }

  // Extract env vars from .env.example
  if (files.includes('.env.example')) {
    const envContent = await readFile(join(repoPath, '.env.example'), 'utf-8');
    summary.envVars = envContent.split('\n')
      .filter(line => line.includes('=') && !line.startsWith('#'))
      .map(line => line.split('=')[0].trim());
  }

  // Extract API routes (basic pattern matching)
  summary.apiRoutes = await extractApiRoutes(repoPath, summary.framework);

  // Extract frontend API calls
  summary.apiCalls = await extractApiCalls(repoPath);

  return summary;
}

async function extractApiRoutes(repoPath: string, framework: string | null): Promise<string[]> {
  const routes: string[] = [];
  const srcPath = join(repoPath, 'src');
  const searchPaths = [repoPath];
  
  if (await fileExists(srcPath)) searchPaths.push(srcPath);

  for (const searchPath of searchPaths) {
    const files = await findFiles(searchPath, ['.ts', '.js', '.py']);
    
    for (const file of files) {
      const content = await readFile(file, 'utf-8');
      
      // Express/Fastify patterns
      const jsRoutes = content.match(/\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/gi) || [];
      for (const match of jsRoutes) {
        const route = match.match(/['"`]([^'"`]+)['"`]/)?.[1];
        if (route) routes.push(route);
      }
      
      // FastAPI patterns
      const pyRoutes = content.match(/@(app|router)\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/gi) || [];
      for (const match of pyRoutes) {
        const route = match.match(/['"]([^'"]+)['"]/)?.[1];
        if (route) routes.push(route);
      }
    }
  }

  return [...new Set(routes)];
}

async function findFiles(dir: string, extensions: string[]): Promise<string[]> {
  const results: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        results.push(...await findFiles(fullPath, extensions));
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function extractApiCalls(repoPath: string): Promise<ApiCall[]> {
  const calls: ApiCall[] = [];
  const srcPath = join(repoPath, 'src');
  const searchPaths = [repoPath];
  
  if (await fileExists(srcPath)) searchPaths.push(srcPath);

  for (const searchPath of searchPaths) {
    const files = await findFiles(searchPath, ['.ts', '.tsx', '.js', '.jsx']);
    
    for (const file of files) {
      const content = await readFile(file, 'utf-8');
      const relativePath = file.replace(repoPath, '');
      
      // fetch() calls
      const fetchMatches = content.matchAll(/fetch\s*\(\s*[`'"](\/[^`'"]*)[`'"]/g);
      for (const match of fetchMatches) {
        calls.push({ method: 'GET', path: match[1], file: relativePath });
      }
      
      // axios calls
      const axiosMethods = ['get', 'post', 'put', 'delete', 'patch'];
      for (const method of axiosMethods) {
        const regex = new RegExp(`axios\\.${method}\\s*\\(\\s*[\`'"](\/[^\`'"]*)[\`'"]`, 'g');
        const matches = content.matchAll(regex);
        for (const match of matches) {
          calls.push({ method: method.toUpperCase(), path: match[1], file: relativePath });
        }
      }
      
      // Template literal API paths like `${API_URL}/users`
      const templateMatches = content.matchAll(/\$\{[^}]*\}(\/[a-zA-Z0-9/_-]+)/g);
      for (const match of templateMatches) {
        calls.push({ method: 'GET', path: match[1], file: relativePath });
      }
    }
  }

  return calls;
}
