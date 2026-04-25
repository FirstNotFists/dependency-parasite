import type { VercelRequest, VercelResponse } from '@vercel/node'

const TOKENS = [
  process.env.GITHUB_TOKEN,
].filter(Boolean) as string[]

let currentTokenIndex = 0

function getHeaders(accept: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: accept,
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (currentTokenIndex < TOKENS.length) {
    headers['Authorization'] = `Bearer ${TOKENS[currentTokenIndex]}`
  }
  return headers
}

async function fetchWithFallback(url: string, accept: string): Promise<Response> {
  const res = await fetch(url, { headers: getHeaders(accept) })

  if ((res.status === 403 || res.status === 401) && currentTokenIndex < TOKENS.length - 1) {
    currentTokenIndex++
    return fetch(url, { headers: getHeaders(accept) })
  }

  if ((res.status === 403 || res.status === 401) && TOKENS.length > 0) {
    // All tokens exhausted — try without token
    return fetch(url, {
      headers: { Accept: accept, 'X-GitHub-Api-Version': '2022-11-28' },
    })
  }

  return res
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { owner, repo, endpoint } = req.body as {
    owner: string
    repo: string
    endpoint: 'package.json' | 'languages'
  }

  if (!owner || !repo || !endpoint) {
    return res.status(400).json({ error: 'Missing owner, repo, or endpoint' })
  }

  try {
    if (endpoint === 'package.json') {
      const response = await fetchWithFallback(
        `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
        'application/vnd.github.raw',
      )

      if (!response.ok) {
        return res.status(response.status).json({
          error: response.status === 404
            ? 'Repository or package.json not found.'
            : response.status === 403
              ? 'GitHub API rate limit exceeded. Please try again later.'
              : 'Failed to fetch data from GitHub.',
        })
      }

      const data = await response.json()
      return res.status(200).json(data)
    }

    if (endpoint === 'languages') {
      const response = await fetchWithFallback(
        `https://api.github.com/repos/${owner}/${repo}/languages`,
        'application/vnd.github+json',
      )

      if (!response.ok) {
        return res.status(200).json({})
      }

      const data = await response.json()
      return res.status(200).json(data)
    }

    return res.status(400).json({ error: 'Invalid endpoint' })
  } catch (err) {
    console.error('GitHub API error:', err)
    return res.status(500).json({ error: 'GitHub API request failed' })
  }
}
