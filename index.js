const puppeteer = require("puppeteer");
const readline = require("readline");
const path = require("path");
const fs = require("fs").promises;
const url = require("url");

async function readUrls(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return data
      .trim()
      .split(",")
      .map((url) => url.trim())
      .filter((url) => url);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    process.exit(1);
  }
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

function generateFilenameFromUrl(pageUrl) {
  const parsedUrl = url.parse(pageUrl, true);

  // Extract the hostname and remove non-alphanumeric characters
  const hostname = parsedUrl.hostname.replace(/[^a-zA-Z0-9]/g, "-");

  // Get the path segments and remove empty ones
  const pathSegments = parsedUrl.pathname
    .split("/")
    .filter((segment) => segment);

  // Try to get meaningful parts from the URL
  const lastSegment = pathSegments[pathSegments.length - 1];
  const secondLastSegment = pathSegments[pathSegments.length - 2];

  // If we have query parameters, try to use them for the filename
  const queryParams = parsedUrl.query;
  const possibleIdentifiers = ["id", "number", "ref"];
  let queryIdentifier = "";

  for (const param of possibleIdentifiers) {
    if (queryParams[param]) {
      queryIdentifier = `-${queryParams[param]}`;
      break;
    }
  }

  // Construct the filename with the hostname prefix
  let filename = hostname + "--"; // Add double dash to clearly separate domain from the rest

  if (secondLastSegment && lastSegment) {
    // If we have both segments, combine them
    filename += `${secondLastSegment}-${lastSegment}${queryIdentifier}`;
  } else {
    // Otherwise just use the last segment
    filename += `${lastSegment}${queryIdentifier}`;
  }

  // Clean the filename of any invalid characters and ensure it's not empty
  filename = filename
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-") // Replace multiple consecutive dashes with a single dash
    .replace(/^-|-$/g, ""); // Remove leading/trailing dashes

  return filename || "page"; // Fallback to 'page' if we end up with an empty string
}

async function downloadPdf(browser, page, pageUrl, bearerToken) {
  try {
    if (bearerToken) {
      // Set up localStorage before navigation
      await page.evaluateOnNewDocument((token) => {
        localStorage.setItem("token", JSON.stringify({ token }));
      }, bearerToken);

      // Set the authorization header
      await page.setExtraHTTPHeaders({
        Authorization: `Bearer ${bearerToken}`,
      });
    }

    await page.goto(pageUrl, {
      waitUntil: "networkidle0",
    });

    // Generate a meaningful filename from the URL
    const filename = generateFilenameFromUrl(pageUrl);

    // Generate PDF in the out directory
    await page.pdf({
      path: path.join("out", `${filename}.pdf`),
      format: "A4",
      printBackground: false,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    });

    console.log(`PDF saved as '${filename}.pdf' in the out directory!`);
  } catch (error) {
    console.error(`Error processing URL ${pageUrl}:`, error);
  }
}

async function processUrls() {
  try {
    // Ensure the out directory exists
    await fs.mkdir("out", { recursive: true });

    const csvPath = await askQuestion(
      "Please enter the path to your CSV file containing URLs: "
    );

    if (!csvPath) {
      console.error("No CSV file path provided");
      return;
    }

    const urls = await readUrls(csvPath);

    if (urls.length === 0) {
      console.error(`No valid URLs found in ${csvPath}`);
      return;
    }

    console.log(`Found ${urls.length} URLs to process...`);

    const needsAuth =
      (
        await askQuestion("Does this site require authentication? (y/n): ")
      ).toLowerCase() === "y";
    let bearerToken = null;

    if (needsAuth) {
      bearerToken = await askQuestion("Please enter your bearer token: ");
    }

    const browser = await puppeteer.launch({
      headless: "new",
    });

    const page = await browser.newPage();

    for (const pageUrl of urls) {
      await downloadPdf(browser, page, pageUrl, bearerToken);
    }

    await browser.close();
    console.log("All PDFs have been generated!");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

processUrls();
