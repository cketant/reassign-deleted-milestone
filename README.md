# reassign-deleted-milestone action

This action fetches all PRs associated with a milestone and reassigns them to another milestone. After reassigning the PRs to the other milestone it will delete the former milestone. 

## Development

### Prerequisite
You must have `ncc` installed in your global *node_modules* in order to build the project and not need to use local *node_modules* for the workflow. 

1. `npm i -g @vercel/ncc` (*you may have to run as sudo*)

### To Test Changes

1. Run `npm run build && npm run start`

### Committing

After making source changes and before committing be sure to run `npm run build` then commit. The **dist/index.js** file is used to run this Action in order to avoid needing the **node_modules** directory. It builds the modules all in the **index.js** file.

## Inputs

### `repoOwner`

**Required** The account owner of the repo

### `repo`

**Required** The name of the repo

### `githubApiToken`

**Required** GitHub API Token for accessing GitHub assets such as the tarball

### `deleteMilestoneNumber`

**Required** The `number` of the Milestone that is to be deleted

### `reassignMilestoneNumber`

**Required** The `number` of the Milestone that the PRs will be reassigned to

## Outputs

### `total-prs`

The total number of PRs that should be reassigned


### `total-prs-updated`

The total number of PRs that were successfully reassigned

## Example usage
```
steps:
      - name: Checkout Repo
        uses: actions/checkout@v2
      - name: Reassign deleted milestone
        uses: cketant/reassign-deleted-milestone@v1.0.0
        with:
          repoOwner: <OWNER-ACCOUNT-NAME>
          repo: <REPO-NAME>
          githubApiToken: ${{ secrets.GITHUB_TOKEN }}
          deleteMilestoneNumber: 4
          reassignMilestoneNumber: 5

```