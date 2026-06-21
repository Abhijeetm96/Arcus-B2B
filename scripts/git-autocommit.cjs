const { execSync } = require('child_process');

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    console.error(`Error running command: "${command}"`);
    console.error(error.stderr || error.message);
    return null;
  }
}

function autocommit() {
  console.log('Checking for local changes...');
  
  // Check if we are inside a git repository
  const isGit = runCommand('git rev-parse --is-inside-work-tree');
  if (isGit !== 'true') {
    console.error('Not a git repository.');
    return;
  }

  // Check if there are any changes (modified, deleted, untracked)
  const status = runCommand('git status --porcelain');
  if (!status) {
    console.log('No local changes found. Workspace is clean.');
    return;
  }

  console.log('Changes detected:\n' + status);

  // Stage changes
  console.log('Staging changes...');
  runCommand('git add .');

  // Create commit message with local time
  const timestamp = new Date().toLocaleString();
  const commitMessage = `auto: sync changes - ${timestamp}`;
  console.log(`Committing changes: "${commitMessage}"`);
  runCommand(`git commit -m "${commitMessage}"`);

  // Push to remote repository
  const branch = runCommand('git branch --show-current') || 'master';
  console.log(`Pushing changes to remote branch "${branch}"...`);
  const pushOutput = runCommand(`git push origin ${branch}`);
  
  if (pushOutput !== null) {
    console.log('Autocommit and push completed successfully.');
  } else {
    console.error('Failed to push changes to remote repository.');
  }
}

// Execute autocommit
autocommit();
