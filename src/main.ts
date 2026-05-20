import * as core from '@actions/core'
import * as github from '@actions/github'
import { parseHTTPRoutes, parseSecurityPolicies } from './parse.ts'
import { HTTPRoute, SecurityPolicy } from './types.ts'
import * as fs from 'fs'
import * as yaml from 'js-yaml'

export async function checkSecurityPolicyGuard(): Promise<void> {
  const context = github.context
  const token = process.env.GITHUB_TOKEN
  const client = github.getOctokit(token)

  const response = await client.rest.pulls.listFiles({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.payload.pull_request?.number
  })

  const files = response.data.map( (file) => file.filename )

  let httpRoutes = []
  let securityPolicies = []
  
  for (const file of files) {
    if (file.endsWith('.yaml')) {
      const fileContent = fs.readFileSync(file, 'utf8')
      const data = yaml.parse(fileContent)

      if (data.kind === 'HTTPRoute') {
        httpRoutes.push(file)
      }
      if (data.kind === 'SecurityPolicy') {
        securityPolicies.push(file)
      }
    }
  }

  let unmatchedRoutes = []


}
