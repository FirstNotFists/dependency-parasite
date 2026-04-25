import type {
  Dependency,
  DependencyGroup,
  AnalysisResult,
  InfestationSeverity,
  HostProfile,
} from './types'
import { GITHUB_API_VERSION, DEPENDENCY_GROUPS } from './constants/parasite'

export function parseGitHubUrl(input: string): { owner: string; repo: string } | null {
  let clean = input.trim()
  if (clean.endsWith('.git')) clean = clean.slice(0, -4)
  if (clean.endsWith('/')) clean = clean.slice(0, -1)

  clean = clean.replace(/^https?:\/\//, '')
  clean = clean.replace(/^github\.com\//, '')

  const parts = clean.split('/')
  if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) {
    return { owner: parts[0], repo: parts[1] }
  }
  return null
}

async function githubFetch(owner: string, repo: string, endpoint: 'package.json' | 'languages') {
  // Try serverless API first, fallback to direct GitHub API for local dev
  try {
    const res = await fetch('/api/github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ owner, repo, endpoint }),
    })
    // If serverless route doesn't exist (local dev), res will be HTML 404
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) throw new Error('Not JSON — fallback to direct')
    return res
  } catch {
    // Fallback: direct GitHub API (no token, local dev)
    if (endpoint === 'package.json') {
      return fetch(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, {
        headers: { Accept: 'application/vnd.github.raw', 'X-GitHub-Api-Version': GITHUB_API_VERSION },
      })
    }
    return fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': GITHUB_API_VERSION },
    })
  }
}

export async function fetchPackageJson(owner: string, repo: string) {
  const res = await githubFetch(owner, repo, 'package.json')

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error ?? 'Failed to fetch data from GitHub.')
  }
  return res.json()
}

export async function fetchLanguages(owner: string, repo: string): Promise<Record<string, number>> {
  const res = await githubFetch(owner, repo, 'languages')
  if (!res.ok) return {}
  return res.json()
}

type NpmRegistryResult = {
  transitiveCount: number
  unpackedSize: number | null
}

async function fetchNpmPackageInfo(packageName: string): Promise<NpmRegistryResult> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${packageName}/latest`)
    if (!res.ok) return { transitiveCount: 0, unpackedSize: null }

    const data = await res.json()
    const deps = data.dependencies ? Object.keys(data.dependencies).length : 0
    const size = data.dist?.unpackedSize ?? null

    return { transitiveCount: deps, unpackedSize: size }
  } catch {
    return { transitiveCount: 0, unpackedSize: null }
  }
}

export async function fetchTransitiveDeps(
  dependencies: { name: string; versionRange: string; group: DependencyGroup }[],
): Promise<Map<string, NpmRegistryResult>> {
  const results = new Map<string, NpmRegistryResult>()

  const BATCH_SIZE = 10
  for (let i = 0; i < dependencies.length; i += BATCH_SIZE) {
    const batch = dependencies.slice(i, i + BATCH_SIZE)
    const settled = await Promise.allSettled(
      batch.map(async (dep) => {
        const info = await fetchNpmPackageInfo(dep.name)
        return { name: dep.name, info }
      }),
    )
    for (const item of settled) {
      if (item.status === 'fulfilled') {
        results.set(item.value.name, item.value.info)
      }
    }
  }
  return results
}

function computeSeverity(hostRatio: number, amplification: number): InfestationSeverity {
  if (hostRatio > 0.3 && amplification < 3) return 'Symbiotic'
  if (hostRatio > 0.1 || (amplification >= 3 && amplification < 10)) return 'Colonized'
  if (hostRatio > 0.01 || (amplification >= 10 && amplification < 30)) return 'Consumed'
  return 'Hollow Shell'
}

export function buildAnalysis(
  owner: string,
  repo: string,
  pkgJson: Record<string, unknown>,
  languages: Record<string, number>,
  registryData: Map<string, NpmRegistryResult>,
): AnalysisResult {
  const dependencies: Dependency[] = []
  for (const group of DEPENDENCY_GROUPS) {
    if (pkgJson[group]) {
      for (const [name, versionRange] of Object.entries(pkgJson[group] as Record<string, string>)) {
        const registry = registryData.get(name)
        dependencies.push({
          name,
          versionRange: versionRange as string,
          group,
          transitiveCount: registry?.transitiveCount ?? 0,
          unpackedSize: registry?.unpackedSize ?? null,
        })
      }
    }
  }

  const directCount = dependencies.length
  const transitiveTotal = dependencies.reduce((sum, d) => sum + d.transitiveCount, 0)
  const totalParasiteCount = directCount + transitiveTotal
  const amplification = directCount > 0 ? totalParasiteCount / directCount : 0

  const totalCodeBytes = Object.values(languages).reduce((sum, b) => sum + b, 0)
  const depsWithSize = dependencies.filter(d => d.unpackedSize !== null)
  const knownExternalBytes = depsWithSize.reduce((sum, d) => sum + (d.unpackedSize ?? 0), 0)
  const avgSize = depsWithSize.length > 0 ? knownExternalBytes / depsWithSize.length : 0
  const unknownCount = dependencies.length - depsWithSize.length
  const estimatedExternalBytes = knownExternalBytes + unknownCount * avgSize
  const hostRatio =
    totalCodeBytes + estimatedExternalBytes > 0
      ? totalCodeBytes / (totalCodeBytes + estimatedExternalBytes)
      : 0

  const hostProfile: HostProfile = {
    languages,
    totalCodeBytes,
    estimatedExternalBytes,
    hostRatio,
  }

  return {
    repository: `${owner}/${repo}`,
    packageName: typeof pkgJson.name === 'string' ? pkgJson.name : repo,
    dependencies,
    directDependencyCount: directCount,
    transitiveDependencyCount: transitiveTotal,
    totalParasiteCount,
    dependencyAmplification: Math.round(amplification * 10) / 10,
    hostProfile,
    infestationSeverity: computeSeverity(hostRatio, amplification),
  }
}
