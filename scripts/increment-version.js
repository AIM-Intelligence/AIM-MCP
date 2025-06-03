const fs = require("fs");
const path = require("path");

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

  console.log(`Version updated from ${currentVersion} to ${newVersion}`);
  return newVersion;
}

// Get version type from command line arguments
const versionType = process.argv[2] || "patch";
incrementVersion(versionType);

console.log(`Version updated: ${currentVersion} → ${newVersion}`);
