const core = require('@actions/core')
const github = require('@actions/github')

/**
 * Delete a milestone 
 *
 * @param - OctoKit client
 * @param - Query options
 * @return - Async
 * */
const deleteMilestone = async (octoKit, opts = {}) => {
	return octoKit.rest.issues.deleteMilestone(opts)
}

/**
 * Fetch a milestone
 *
 * @param - OctoKit client
 * @param - Query options
 * @return - Async
 * */
const fetchMilestone = async (octoKit, opts = {}) => {
	return octoKit.rest.issues.getMilestone(opts)
}

/**
 * Fetch all the PRs that are associated with a milestone 
 * https://octokit.github.io/rest.js/v18#search-issues-and-pull-requests
 * 
 * @param - OctoKit client
 * @param - Query options
 * @return - Async
 * */
const fetchPRsForMilestone = async (octoKit, milestoneTitle, repoName) => {
	const q = `milestone:"${milestoneTitle}"+type:pr+repo:${repoName}`
	return octoKit.rest.search.issuesAndPullRequests({
		q
	})
}

/**
 * Update the milestone associated with the PR
 * 
 * @param - OctoKit client
 * @param - url of the PR
 * @param - Query options
 * @return - Async
 * */
const updateMilestoneForPR = async (octoKit, url, opts) => {
	return octoKit.request(`PATCH ${url}`, opts)
}

const run = async () => {
	try {

		// Get Input
		const token = core.getInput('githubApiToken')
		const repo = core.getInput('repo')
		const owner = core.getInput('repoOwner')
		const deleteMilestoneNumber = core.getInput('deleteMilestoneNumber')
		const reassignMilestoneNumber = core.getInput('reassignMilestoneNumber')

		console.log(`Milestone to delete "${deleteMilestoneNumber}" and milestone to reassign PRs to "${reassignMilestoneNumber}"...`)

		// Setup GH client
		const octoKit = new github.getOctokit(token)

		// 1. Fetch Milestone to Delete
		var milestone_number = deleteMilestoneNumber
		const { data: milestoneToDelete } = await fetchMilestone(octoKit, {owner, repo, milestone_number})

		// 2. Fetch Milestone to Reassign
		milestone_number = reassignMilestoneNumber
		const { data: milestoneToReassign } = await fetchMilestone(octoKit, {owner, repo, milestone_number})		

		// 3. Fetch PRs for the Milestone we want to delete
		const { data } = await fetchPRsForMilestone(octoKit, milestoneToDelete.title, `${owner}/${repo}`)
		const prs = data.items
		console.log(`Total PRs to be reassigned: ${prs.length}...`)

		// 4. Reassign PRs from the milestone we want to delete to the new milestone
		let prsUpdatedCount = 0
		const milestone = milestoneToReassign.number
		await Promise.all(prs.map(async (pr) => {
			const result = await updateMilestoneForPR(octoKit, pr.url, {owner, repo, milestone})	
			prsUpdatedCount = result.status == 200 ? (prsUpdatedCount + 1) : prsUpdatedCount
		}))
		console.log(`Successfully reassigned ${prsUpdatedCount} PRs...`)

		// 5. Delete Milestone
		milestone_number = deleteMilestoneNumber
		const result = await deleteMilestone(octoKit, {owner, repo, milestone_number})
		if (result.status == 204) {
			console.log(`Successfully deleted milestone: ${milestoneToDelete.title}`)
		} else {
			console.log(`Did not successfully delete milestone: ${milestoneToDelete.title}`)
		}

		// Set Outputs
		core.setOutput('total-prs', prs.length)
		core.setOutput('total-prs-updated', prsUpdatedCount)
	} catch (error) {
		core.debug(error)
		core.setFailed(error)
	}
}

run()