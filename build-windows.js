const { execSync } = require("child_process");

const OUTPUT_FILE = "web-to-pdf-windows";

execSync("pnpm run dist", { stdio: "inherit" });
execSync("node --experimental-sea-config sea-config.json", {
  stdio: "inherit",
});
execSync(
  `node -e "require('fs').copyFileSync(process.execPath, '${OUTPUT_FILE}.exe')"`,
  { stdio: "inherit" }
);
// execSync(`signtool remove /s ${OUTPUT_FILE}.exe`, { stdio: "inherit" });
execSync(
  `npx postject ${OUTPUT_FILE}.exe NODE_SEA_BLOB sea-prep.blob --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 `,
  { stdio: "inherit" }
);
// execSync(`signtool sign /fd SHA256 ${OUTPUT_FILE}.exe`, { stdio: "inherit" });

console.log(`Single executable created successfully: ${OUTPUT_FILE}`);
