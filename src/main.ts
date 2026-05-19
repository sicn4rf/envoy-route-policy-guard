import * as core from '@actions/core'
/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */

export async function hello(): Promise<void> {
  core.info('Hello from my custom action :)')
  core.setOutput('greeting', "i'm practicing typescript actions")
}
