# Web to PDF

A Node.js utility that generates PDF files from URLs provided in a CSV file.

## Prerequisites

- Node.js (v20 or later recommended)
- pnpm (v10.10.0 or later)

## Installation

1. Clone this repository
2. Install dependencies:

```bash
pnpm install
```

## Usage

### Using the Binary

1. Download the appropriate binary for your operating system from the releases page
2. Make the binary executable (on Unix-based systems):
   ```bash
   chmod +x web-to-pdf
   ```
3. Run the binary:
   ```bash
   ./web-to-pdf
   ```
4. When prompted:
   - Enter the path to your CSV file (e.g., `input-sample.csv`)
   - Confirm whether the site requires authentication
   - If authentication is needed, provide your bearer token

### Development Usage

1. Create a CSV file with URLs (comma-separated)
2. Run the script:
   ```bash
   pnpm start
   ```
3. When prompted:
   - Enter the path to your CSV file (e.g., `input-sample.csv`)
   - Confirm whether the site requires authentication
   - If authentication is needed, provide your bearer token

The application will:

- Read the URLs from your CSV file
- Generate a PDF for each URL
- Save the PDFs in an `out` directory with filenames based on the URLs

## Building

There are several build options available:

### Standard Build

```bash
pnpm run build
```

### Windows Build

```bash
pnpm run build-windows
```

### Distribution Build

```bash
pnpm run dist
```

This creates a bundled version of the application using esbuild.

## Project Structure

- `index.js` - Main script file
- `build.js` - Build script
- `build-windows.js` - Windows-specific build script
- `input-sample.csv` - Example input file format
- `sea-config.json` - Single executable application configuration

## Features

- Batch processing of multiple URLs
- Secure authentication using bearer tokens
- Customizable PDF output format (A4 with margins)
- Headless browser operation
- Error handling and progress logging

## Error Handling

The script includes error handling for:

- Invalid/missing CSV files
- Network issues
- Authentication failures
- PDF generation errors

Each URL is processed independently, so if one fails, the others will still be attempted.
