import fs from "fs";
import path from "path";
import archiver from "archiver";
import { green, blue } from "colorette";

/**
 * Everything kept out of the zip, matched by name against both files and
 * directories: version control, editor state, packaging manifests, developer
 * tooling and the test suites. None of it belongs in the plugin a merchant
 * installs.
 *
 * One list rather than one per walk step — the two that were here had drifted,
 * so `composer.json`, `composer.lock`, `tests` and `bin` were skipped as
 * directories but still shipped when they appeared as files.
 */
const EXCLUDED = [
  ".claude",
  ".distignore",
  ".editorconfig",
  ".git",
  ".gitattributes",
  ".github",
  ".gitignore",
  ".idea",
  ".svnignore",
  ".vscode",
  ".wordpress-org",
  "bin",
  "CLAUDE.md",
  "composer.json",
  "composer.lock",
  "lerna-debug.log",
  "lerna.json",
  "node_modules",
  "package-lock.json",
  "package.json",
  "phpcs.xml",
  "phpcs.xml.dist",
  "phpcs.xml.dist.sample",
  "tests",
];

/**
 * Whether a file or directory name is excluded from the archive.
 *
 * Matched exactly: a substring test would drop innocent names that merely
 * contain a listed one — `bin` alone would take out `binary.php`.
 *
 * @param {string} name Base name of the entry.
 *
 * @return {boolean}
 */
function isExcluded(name) {
  return EXCLUDED.includes(name);
}

async function recursiveReadDir(dir) {
  let results = [];

  const list = await fs.promises.readdir(dir);

  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = await fs.promises.stat(fullPath);

    if (isExcluded(file)) {
      continue;
    }

    if (stat.isDirectory()) {
      results = results.concat(await recursiveReadDir(fullPath));
    } else {
      results.push(fullPath);
    }
  }

  return results;
}

function formatSize(size) {
  if (size >= 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  } else {
    return (size / 1024).toFixed(2) + " KB";
  }
}

async function archive() {
  const folderPath = path.resolve(); // Use __dirname to get the directory of the script
  const rootPathName = path.basename(folderPath);
  const outputFilename = `${rootPathName}.zip`;
  const outputPath = path.resolve("../", outputFilename);

  const archive = archiver("zip", {
    zlib: { level: 9 }, // Configure the compression level
  });

  const output = fs.createWriteStream(outputPath);
  // Listen for close event to know when the archiving is done
  output.on("close", function () {
    console.log(
      green(`Zip created successfully as ${outputFilename} `) +
        " " +
        blue(`Size ${formatSize(archive.pointer())}`)
    );
    renameZipFileWithVersion(outputFilename);
  });

  archive.pipe(output);

  const files = await recursiveReadDir(folderPath);
  const totalFiles = files.length;
  let processedFiles = 0;

  // Listen for the progress event to display the percentage progress
  archive.on("progress", function (progressData) {
    processedFiles = progressData.entries.processed;
    const progress = (processedFiles / totalFiles) * 100;
    process.stdout.write(`Archiving progress: ${progress.toFixed(2)}% \r`);
  });

  for (const file of files) {
    const zipPath = path.relative(folderPath, file);

    // Add the project name directory within the ZIP archive
    const projectName = path.basename(folderPath);
    archive.file(file, { name: path.join(projectName, zipPath) });
  }

  archive.finalize();
}

async function renameZipFileWithVersion(originalFileName) {
  let currentFilename = originalFileName;
  let packageVersion = "unknown";
  const filenameWithoutExtension = currentFilename.replace(/\.[^.]*$/, "");
  try {
    const packageJson = JSON.parse(await fs.promises.readFile("package.json"));
    packageVersion = packageJson.version;
  } catch (err) {
    console.error("Error reading package.json:", err);
  }

  const newName = `${filenameWithoutExtension}-v${packageVersion}.zip`;
  const newPath = path.resolve("../", newName);

  try {
    await fs.promises.rename(path.resolve("../", currentFilename), newPath);
    console.log(`Zip file renamed to ` + blue(`${newName}`));
  } catch (err) {
    console.error("Error renaming the zip file:", err);
  }
}

archive().catch(console.error);
