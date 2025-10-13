const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Increment version based on type
 * Supports both manual and automatic (commit-based) version increment
 *
 * Usage:
 * - Manual: node increment-version.js [patch|minor|major]
 * - Auto: node increment-version.js auto (analyzes last commit message)
 *
 * Conventional Commits (auto mode):
 * - fix: → patch (1.0.0 -> 1.0.1)
 * - feat: → minor (1.0.0 -> 1.1.0)
 * - BREAKING CHANGE: / feat!: / fix!: → major (1.0.0 -> 2.0.0)
 */
function incrementVersion(type = "patch") {
  // Read package.json
  const packageJsonPath = path.join(__dirname, "..", "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  // Parse current version
  const currentVersion = packageJson.version;
  const versionParts = currentVersion.split(".");
  let major = parseInt(versionParts[0]);
  let minor = parseInt(versionParts[1]);
  let patch = parseInt(versionParts[2]);

  // Increment version based on type
  switch (type) {
    case "major":
      major += 1;
      minor = 0;
      patch = 0;
      break;
    case "minor":
      minor += 1;
      patch = 0;
      break;
    case "patch":
    default:
      patch += 1;
      break;
  }

  const newVersion = `${major}.${minor}.${patch}`;

  // Update package.json
  packageJson.version = newVersion;
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + "\n"
  );

  console.log(`✅ Version updated from ${currentVersion} to ${newVersion} (${type})`);
  return newVersion;
}

/**
 * Auto increment version based on last commit message
 * Follows Conventional Commits specification
 */
function autoIncrementVersion() {
  try {
    // Get the last commit message
    const commitMessage = execSync("git log -1 --pretty=%B", {
      encoding: "utf8",
    }).trim();

    console.log("📝 Last commit message:", commitMessage);

    // Determine version increment type based on commit message
    let versionType = "patch"; // default

    if (
      commitMessage.includes("BREAKING CHANGE:") ||
      commitMessage.startsWith("feat!:") ||
      commitMessage.startsWith("fix!:") ||
      commitMessage.match(/^\w+!(\(.+\))?:/)
    ) {
      versionType = "major";
      console.log("🔴 Breaking change detected → major version bump");
    } else if (
      commitMessage.startsWith("feat:") ||
      commitMessage.startsWith("feat(")
    ) {
      versionType = "minor";
      console.log("🟢 Feature detected → minor version bump");
    } else if (
      commitMessage.startsWith("fix:") ||
      commitMessage.startsWith("fix(")
    ) {
      versionType = "patch";
      console.log("🔵 Fix detected → patch version bump");
    } else {
      console.log("⚪ Other commit type → patch version bump");
    }

    return incrementVersion(versionType);
  } catch (error) {
    console.error("❌ Error reading commit message:", error.message);
    console.log("⚠️  Falling back to patch version increment");
    return incrementVersion("patch");
  }
}

// Main execution
if (require.main === module) {
  const versionType = process.argv[2] || "patch";

  if (versionType === "auto") {
    // Automatic version increment based on commit message
    autoIncrementVersion();
  } else if (["patch", "minor", "major"].includes(versionType)) {
    // Manual version increment
    incrementVersion(versionType);
  } else {
    console.error("❌ Invalid version type. Use: patch, minor, major, or auto");
    process.exit(1);
  }
}

module.exports = { incrementVersion, autoIncrementVersion };
