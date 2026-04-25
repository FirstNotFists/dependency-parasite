export type DependencyGroup = 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';

export type Dependency = {
  name: string;
  versionRange: string;
  group: DependencyGroup;
};

export type AnalysisResult = {
  repository: string;
  packageName: string;
  dependencies: Dependency[];
  dependencyCount: number;
  riskLevel: 'Contained' | 'Mutating' | 'Invasive' | 'Extremely High';
  hostIntegrity: number;
};

export function parseGitHubUrl(input: string): { owner: string; repo: string } | null {
  let cleanInput = input.trim();
  if (cleanInput.endsWith('.git')) {
    cleanInput = cleanInput.slice(0, -4);
  }
  if (cleanInput.endsWith('/')) {
    cleanInput = cleanInput.slice(0, -1);
  }

  cleanInput = cleanInput.replace(/^https?:\/\//, '');
  cleanInput = cleanInput.replace(/^github\.com\//, '');

  const parts = cleanInput.split('/');
  if (parts.length === 2) {
    return { owner: parts[0], repo: parts[1] };
  }
  
  return null;
}

export async function fetchPackageJson(owner: string, repo: string) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, {
    headers: {
      'Accept': 'application/vnd.github.raw',
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  
  if (!response.ok) {
    if (response.status === 404) throw new Error('Repository or package.json not found');
    if (response.status === 403) throw new Error('Rate limit exceeded or forbidden');
    throw new Error('Failed to fetch from GitHub');
  }
  
  return response.json();
}

export function analyzeDependencies(owner: string, repo: string, pkgJson: any): AnalysisResult {
  const dependencies: Dependency[] = [];
  const groups: DependencyGroup[] = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

  for (const group of groups) {
    if (pkgJson[group]) {
      for (const [name, versionRange] of Object.entries(pkgJson[group])) {
        dependencies.push({
          name,
          versionRange: versionRange as string,
          group
        });
      }
    }
  }

  const dependencyCount = dependencies.length;
  let riskLevel: AnalysisResult['riskLevel'] = 'Contained';
  if (dependencyCount > 60) riskLevel = 'Extremely High';
  else if (dependencyCount > 30) riskLevel = 'Invasive';
  else if (dependencyCount > 10) riskLevel = 'Mutating';

  const devCount = dependencies.filter(d => d.group === 'devDependencies').length;
  const hostIntegrity = Math.max(1, 100 - (dependencyCount * 1.5) + (devCount * 0.5));

  return {
    repository: `${owner}/${repo}`,
    packageName: pkgJson.name || repo,
    dependencies,
    dependencyCount,
    riskLevel,
    hostIntegrity: Math.min(100, Math.round(hostIntegrity)),
  };
}
