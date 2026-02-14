const fs = require('fs');
const path = require('path');

const packageSolutionPath = path.join(__dirname, '../config/package-solution.json');

// Read the file
const packageSolution = JSON.parse(fs.readFileSync(packageSolutionPath, 'utf8'));

// Get current version
const currentVersion = packageSolution.solution.version;
console.log(`Current version: ${currentVersion}`);

// Split version into parts (e.g., "1.0.0.19" -> ["1", "0", "0", "19"])
const versionParts = currentVersion.split('.');

// Increment the last part
versionParts[versionParts.length - 1] = String(parseInt(versionParts[versionParts.length - 1]) + 1);

// Rejoin
const newVersion = versionParts.join('.');
console.log(`New version: ${newVersion}`);

// Update both solution.version and features[0].version
packageSolution.solution.version = newVersion;
if (packageSolution.solution.features && packageSolution.solution.features[0]) {
    packageSolution.solution.features[0].version = newVersion;
}

// Write back to file
fs.writeFileSync(packageSolutionPath, JSON.stringify(packageSolution, null, 2) + '\n', 'utf8');

console.log('Version incremented successfully!');
