import { RepoSummary } from './repoAnalysis.js';
import { loadPrompt, callGroqJson } from '../groq.js';

export interface IntegrationResult {
  strategy: 'monorepo' | 'docker-compose';
  envFile: string;
  startupScript: string;
  dockerCompose?: string;
  projectStructure: string[];
  readme?: string;
}

export async function generateIntegration(repos: RepoSummary[]): Promise<IntegrationResult> {
  // First generate basic integration
  const result = generateIntegrationBasic(repos);
  
  // Enhance with AI if available
  if (process.env.GROQ_API_KEY && repos.length >= 2) {
    try {
      await enhanceIntegrationWithAI(repos, result);
    } catch (e) {
      console.error('AI integration generation failed, using basic:', e);
    }
  }
  
  return result;
}

async function enhanceIntegrationWithAI(repos: RepoSummary[], result: IntegrationResult): Promise<void> {
  const prompt = await loadPrompt('integrate', {
    repoSummaries: JSON.stringify(repos.map(r => ({
      url: r.url,
      purpose: r.purpose,
      type: r.type,
      framework: r.framework,
      language: r.language,
      envVars: r.envVars,
      entryPoints: r.entryPoints,
    })), null, 2),
  });

  interface AIIntegrationResult {
    dockerCompose?: { code: string };
    envFile?: { code: string };
    startupScript?: { code: string };
    readme?: { code: string };
  }

  const aiResult = await callGroqJson<AIIntegrationResult>(prompt, 4096);
  
  if (aiResult.dockerCompose?.code) result.dockerCompose = aiResult.dockerCompose.code;
  if (aiResult.envFile?.code) result.envFile = aiResult.envFile.code;
  if (aiResult.startupScript?.code) result.startupScript = aiResult.startupScript.code;
  if (aiResult.readme?.code) result.readme = aiResult.readme.code;
}

function generateIntegrationBasic(repos: RepoSummary[]): IntegrationResult {
  const hasMultipleServices = repos.length > 1;
  const strategy = hasMultipleServices ? 'docker-compose' : 'monorepo';

  const frontendRepo = repos.find(r => r.framework === 'react' || r.framework === 'nextjs');
  const backendRepo = repos.find(r => 
    r.framework === 'express' || r.framework === 'fastapi' || r.framework === 'flask'
  );

  // Collect all env vars
  const allEnvVars = new Set<string>();
  repos.forEach(r => r.envVars.forEach(v => allEnvVars.add(v)));
  
  // Add common integration vars
  allEnvVars.add('FRONTEND_URL');
  allEnvVars.add('BACKEND_URL');
  allEnvVars.add('PORT');

  const envFile = generateEnvFile(allEnvVars, frontendRepo, backendRepo);
  const startupScript = generateStartupScript(repos, strategy);
  const dockerCompose = strategy === 'docker-compose' ? generateDockerCompose(repos) : undefined;
  const projectStructure = generateProjectStructure(repos);

  return { strategy, envFile, startupScript, dockerCompose, projectStructure };
}

function generateEnvFile(
  envVars: Set<string>,
  frontend?: RepoSummary,
  backend?: RepoSummary
): string {
  const lines = ['# Generated .env file for integrated project', ''];
  
  lines.push('# Service URLs');
  lines.push('FRONTEND_URL=http://localhost:3000');
  lines.push('BACKEND_URL=http://localhost:8000');
  lines.push('');
  
  lines.push('# Ports');
  lines.push('FRONTEND_PORT=3000');
  lines.push('BACKEND_PORT=8000');
  lines.push('');

  const otherVars = [...envVars].filter(v => 
    !['FRONTEND_URL', 'BACKEND_URL', 'PORT'].includes(v)
  );
  
  if (otherVars.length > 0) {
    lines.push('# Application variables');
    otherVars.forEach(v => lines.push(`${v}=`));
  }

  return lines.join('\n');
}

function generateStartupScript(repos: RepoSummary[], strategy: string): string {
  const lines = ['#!/bin/bash', 'set -e', ''];

  if (strategy === 'docker-compose') {
    lines.push('# Start all services with Docker Compose');
    lines.push('docker compose up -d --build');
    lines.push('');
    lines.push('echo "Services started:"');
    lines.push('echo "  Frontend: http://localhost:3000"');
    lines.push('echo "  Backend:  http://localhost:8000"');
  } else {
    lines.push('# Install dependencies');
    repos.forEach((repo, i) => {
      const name = getRepoName(repo.url);
      lines.push(`echo "Installing ${name}..."`);
      if (repo.language === 'javascript') {
        lines.push(`(cd ${name} && npm install)`);
      } else if (repo.language === 'python') {
        lines.push(`(cd ${name} && pip install -r requirements.txt)`);
      }
    });
    lines.push('');
    lines.push('# Start services');
    lines.push('echo "Starting services..."');
    repos.forEach(repo => {
      const name = getRepoName(repo.url);
      if (repo.language === 'javascript') {
        lines.push(`(cd ${name} && npm run dev) &`);
      } else if (repo.language === 'python') {
        lines.push(`(cd ${name} && python -m uvicorn main:app --reload) &`);
      }
    });
    lines.push('wait');
  }

  return lines.join('\n');
}

function generateDockerCompose(repos: RepoSummary[]): string {
  const services: string[] = ['services:'];

  repos.forEach(repo => {
    const name = getRepoName(repo.url);
    const isBackend = ['express', 'fastapi', 'flask'].includes(repo.framework || '');
    const port = isBackend ? '8000' : '3000';

    services.push(`  ${name}:`);
    services.push(`    build: ./${name}`);
    services.push(`    ports:`);
    services.push(`      - "\${${isBackend ? 'BACKEND' : 'FRONTEND'}_PORT:-${port}}:${port}"`);
    services.push(`    env_file:`);
    services.push(`      - .env`);
    if (!isBackend) {
      services.push(`    depends_on:`);
      const backendName = repos.find(r => 
        ['express', 'fastapi', 'flask'].includes(r.framework || '')
      );
      if (backendName) {
        services.push(`      - ${getRepoName(backendName.url)}`);
      }
    }
    services.push('');
  });

  return services.join('\n');
}

function generateProjectStructure(repos: RepoSummary[]): string[] {
  const structure = [
    'integrated-project/',
    '├── .env',
    '├── .env.example',
    '├── docker-compose.yml',
    '├── start.sh',
    '├── README.md',
  ];

  repos.forEach((repo, i) => {
    const name = getRepoName(repo.url);
    const prefix = i === repos.length - 1 ? '└──' : '├──';
    structure.push(`${prefix} ${name}/`);
  });

  return structure;
}

function getRepoName(url: string): string {
  return url.split('/').pop()?.replace('.git', '') || 'repo';
}
