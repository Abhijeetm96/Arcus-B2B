const fs = require('fs');
const path = require('path');

/**
 * Log a change to the changelog
 * @param {string} type - Added, Changed, Fixed, Removed, Deprecated, Security
 * @param {string} description - Description of the change
 * @param {string} file - File that was changed (optional)
 */
function logChange(type, description, file = '') {
  const changelogPath = path.resolve(__dirname, '..', 'CHANGELOG.md');

  // Read current changelog
  let changelog = '# ARCUS Construction Commerce Platform - Changelog\n\nAll notable changes to this project will be documented in this file.\n\n## [Unreleased]\n\n';

  if (fs.existsSync(changelogPath)) {
    const existing = fs.readFileSync(changelogPath, 'utf8');
    // Extract the Unreleased section and preserve everything else
    const unreleasedMatch = existing.match(/## \[Unreleased\]([\s\S]*?)(?=## |\Z)/);
    if (unreleasedMatch) {
      changelog = existing.replace(/## \[Unreleased\]([\s\S]*?)(?=## |\Z)/,
        `## [Unreleased]\n${unreleasedMatch[1].trim()}\n`);
    }
  }

  // Add the new change
  const sections = {
    Added: '### Added',
    Changed: '### Changed',
    Fixed: '### Fixed',
    Removed: '### Removed',
    Deprecated: '### Deprecated',
    Security: '### Security'
  };

  const sectionHeader = sections[type] || '### Added';
  let changeEntry = `- ${description}`;
  if (file) {
    changeEntry += ` (${file})`;
  }

  // Insert the change into the appropriate section
  const sectionRegex = new RegExp(`(${sectionHeader}[\\s\\S]*?)(?=### |## |\Z)`);
  const sectionMatch = changelog.match(sectionRegex);

  if (sectionMatch) {
    // Section exists, append to it
    const updatedSection = sectionMatch[0].trim() + '\n' + changeEntry + '\n\n';
    changelog = changelog.replace(sectionMatch[0], updatedSection);
  } else {
    // Section doesn't exist, create it
    changelog = changelog.replace('## [Unreleased]',
      `## [Unreleased]\n\n${sectionHeader}\n${changeEntry}\n`);
  }

  // Write back to file
  fs.writeFileSync(changelogPath, changelog, 'utf8');
  console.log(`Logged ${type} change: ${description}`);
}

// If called directly from command line
if (require.main === module) {
  const [, , type, description, file] = process.argv;
  if (!type || !description) {
    console.error('Usage: node log-change.js <type> <description> [file]');
    process.exit(1);
  }
  logChange(type, description, file);
}

module.exports = { logChange };