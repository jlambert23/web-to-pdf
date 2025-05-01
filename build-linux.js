const { execSync } = require("child_process");

const OUTPUT_FILE = "web-to-pdf-linux";

execSync("pnpm run dist", { stdio: "inherit" });
execSync("node --experimental-sea-config sea-config.json", {
  stdio: "inherit",
});
execSync(`cp $(command -v node) ${OUTPUT_FILE}`, { stdio: "inherit" });
execSync(
  `npx postject ${OUTPUT_FILE} NODE_SEA_BLOB sea-prep.blob \
    --sentinel-fuse NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2 `,
  { stdio: "inherit" }
);

console.log(`Single executable created successfully: ${OUTPUT_FILE}`);
