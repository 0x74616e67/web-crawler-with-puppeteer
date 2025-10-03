/**
 * crawler.js
 *
 * Function:
 *  1. Scrape website meta information.
 *  2. Save screenshots for both PC and mobile.
 *  3. Support incremental, full, and retry operations.
 *
 * Usage:
 *  node crawler.js [--all] [--retry-failures] [--update <URL>]
 *
 * Arguments:
 *  --all               Re-crawl all sites from scratch.
 *  --retry-failures    Only retry failed sites from failures.json.
 *  --update <URL>      Force update a specific URL.
 *
 * Configuration Files:
 *  utils/config.js     Puppeteer settings, screenshot options, paths.
 *  utils/urls.js       List of URLs to crawl.
 *
 * Notes:
 *  - Do not delete existing comments; supplement or optimize them.
 *  - All new features must be accompanied by comments.
 *  - If meta or screenshot fails, data will not be written to metaData.json, only to failures.json.
 */

const puppeteer = require("puppeteer");
const path = require("path");
const process = require("process");
const fs = require("fs");

// --- Configuration Check ---
// Check for urls.js and provide a helpful error message if it's missing.
if (!fs.existsSync(path.join(__dirname, "utils/urls.js"))) {
  console.error(
    "❌ Error: `utils/urls.js` not found.\n" +
      "Please create it by copying the example file:\n\n" +
      "cp utils/urls.example.js utils/urls.js\n"
  );
  process.exit(1); // Exit the script with an error code
}

// Load config, falling back to the example file if the main one doesn't exist.
const configPath = path.join(__dirname, "utils/config.js");
const exampleConfigPath = path.join(__dirname, "utils/config.example.js");
const config = fs.existsSync(configPath)
  ? require(configPath)
  : require(exampleConfigPath);

// Import URL list and file utilities
const urls = require("./utils/urls");
const { ensureDir, readJSON, writeJSON } = require("./utils/file");

const {
  puppeteer: puppeteerConfig,
  page: pageConfig,
  screenshot: screenshotConfig,
  paths,
} = config;

// 🛠 Command-line argument parsing
const args = process.argv.slice(2);
const forceAll = args.includes("--all");
const retryFailures = args.includes("--retry-failures");
const updateIndex = args.indexOf("--update");
const updateUrl = updateIndex !== -1 ? args[updateIndex + 1] : null;

/**
 * makeBackupIfExists
 *
 * Function:
 *  - Checks if a file exists.
 *  - If it exists, creates a timestamped backup.
 *
 * @param {string} filePath - The path of the file to back up.
 *
 * Note:
 *  - Only used for screenshot file backups.
 */
const makeBackupIfExists = (filePath) => {
  if (fs.existsSync(filePath)) {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);
    const backupName = `${base}-backup-${Date.now()}${ext}`;
    const backupPath = path.join(dir, backupName);
    fs.renameSync(filePath, backupPath);
    console.log(`💾 Backed up old screenshot: ${backupPath}`);
  }
};

/**
 * waitForImagesLoaded
 *
 * Function:
 *  - Waits for all images on the page to finish loading.
 *  - Prevents screenshots from being taken before images are visible.
 *
 * @param {object} page - The Puppeteer page instance.
 * @param {number} timeout - Timeout in milliseconds, defaults to pageConfig.imageLoadTimeout.
 */
const waitForImagesLoaded = async (
  page,
  timeout = pageConfig.imageLoadTimeout
) => {
  await page.evaluate(async (maxTimeout) => {
    const imgs = Array.from(document.images);
    const promises = imgs.map((img) => {
      if (img.complete) return;
      return new Promise((resolve) => {
        img.addEventListener("load", resolve);
        img.addEventListener("error", resolve);
      });
    });
    await Promise.race([
      Promise.all(promises),
      new Promise((resolve) => setTimeout(resolve, maxTimeout)),
    ]);
  }, timeout);
};

(async () => {
  // 🔹 Initialize data
  const metaData = readJSON();
  let failures = fs.existsSync(paths.failuresFile)
    ? JSON.parse(fs.readFileSync(paths.failuresFile, "utf-8"))
    : {};

  let success = 0;
  let fail = 0;
  let skip = 0;
  const startTime = new Date();

  // 🔹 Ensure directories exist
  ensureDir(paths.pcScreenshotDir);
  ensureDir(paths.mobileScreenshotDir);
  ensureDir(paths.dataDir);

  // 🔹 Launch Puppeteer
  // - Headless mode is configured in config.js.
  // - Launch and protocol timeouts are also configured in config.js.
  const browser = await puppeteer.launch({
    headless: puppeteerConfig.headless,
    defaultViewport: puppeteerConfig.defaultViewport,
    timeout: puppeteerConfig.launchTimeout,
    protocolTimeout: puppeteerConfig.protocolTimeout,
  });

  // 🔹 Determine the target URL list
  let targetUrls = urls;
  if (retryFailures) {
    targetUrls = Object.keys(failures);
    if (targetUrls.length === 0) {
      console.log("✅ failures.json is empty, no need to retry.");
      process.exit(0);
    }
    console.log(`🔄 Retrying failed sites only: ${targetUrls.join(", ")}`);
  } else if (updateUrl) {
    targetUrls = [updateUrl];
    console.log(`🔄 Forcing update for site: ${updateUrl}`);
  } else if (forceAll) {
    console.log("🔄 Performing a full update for all sites.");
  }

  // 🔹 Iterate over each URL
  for (const url of targetUrls) {
    const domain = new URL(url).hostname;

    // ⏭ Skip logic
    if (!forceAll && !updateUrl && !retryFailures && metaData[url]) {
      console.log(`⏭ Skipping already crawled: ${url}`);
      skip++;
      continue;
    }

    try {
      console.log(`🔍 Crawling: ${url}`);
      const page = await browser.newPage();

      // 🔹 Page load
      await page.goto(url, {
        waitUntil: pageConfig.waitUntil,
        timeout: pageConfig.gotoTimeout,
      });
      await waitForImagesLoaded(page);

      // 🔹 Scrape meta information
      const meta = await page.evaluate(() => {
        const getMeta = (name) =>
          document.querySelector(`meta[name="${name}"]`)?.content ||
          document.querySelector(`meta[property="${name}"]`)?.content ||
          "";
        return {
          title: document.title || "",
          description: getMeta("description"),
        };
      });

      // If meta scraping fails (no title and no description), treat as a failure.
      if (!meta.title && !meta.description) {
        throw new Error("Failed to scrape meta information");
      }

      const timestamp = new Date().toISOString();
      const pcFile = path.join(paths.pcScreenshotDir, `${domain}.png`);
      const mobileFile = path.join(paths.mobileScreenshotDir, `${domain}.png`);

      // 🔹 Backup old screenshots (when retrying failures)
      if (retryFailures) {
        makeBackupIfExists(pcFile);
        makeBackupIfExists(mobileFile);
      }

      // 🔹 PC viewport screenshot
      await page.setViewport(screenshotConfig.pc);
      await page.screenshot({
        path: pcFile,
        fullPage: screenshotConfig.pc.fullPage,
      });

      // 🔹 Mobile viewport screenshot
      await page.setViewport(screenshotConfig.mobile);
      await page.setUserAgent(screenshotConfig.mobile.userAgent);
      await page.reload({
        waitUntil: pageConfig.waitUntil,
        timeout: pageConfig.gotoTimeout,
      });
      await waitForImagesLoaded(page);
      await page.screenshot({
        path: mobileFile,
        fullPage: screenshotConfig.mobile.fullPage,
      });

      // 🔹 Write meta data
      metaData[url] = {
        url,
        meta,
        screenshots: { pc: pcFile, mobile: mobileFile },
        timestamp,
      };

      // 🔹 Remove the site from the failures list on success
      if (failures[url]) delete failures[url];

      success++;
      console.log(`✅ Success: ${url}`);
      await page.close();
    } catch (err) {
      // ❌ Error handling
      console.error(`❌ Failed: ${url}`, err.message);

      // Remove any stale data from metaData if it exists
      if (metaData[url]) {
        delete metaData[url];
      }

      // Record failure information
      failures[url] = {
        url,
        error: err.message,
        timestamp: new Date().toISOString(),
      };
      fail++;
    }

    // 🔹 Save progress
    writeJSON(metaData);
    fs.writeFileSync(
      paths.failuresFile,
      JSON.stringify(failures, null, 2),
      "utf-8"
    );
  }

  await browser.close();

  // 🔹 Execution report
  const endTime = new Date();
  const report = {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    durationSec: Math.round((endTime - startTime) / 1000),
    args,
    summary: { success, skip, fail },
  };
  fs.writeFileSync(paths.reportFile, JSON.stringify(report, null, 2), "utf-8");

  // 📑 Output summary
  console.log(`\n📊 Task complete! Success: ${success}, Skipped: ${skip}, Failed: ${fail}`);
  console.log(`📑 Report generated: ${paths.reportFile}`);
  console.log(`❌ Failure log saved: ${paths.failuresFile}`);
})();
