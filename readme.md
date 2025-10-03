[English](./README.md) | [简体中文](./README.zh-CN.md)

# Web Crawler with Puppeteer

A powerful and configurable web crawler built with Node.js and Puppeteer. It fetches website metadata (title, description) and takes screenshots for both PC and mobile viewports.

This script was originally created for the website [https://theuselessweb.online/](https://theuselessweb.online/) to automate its content gathering process.

## ✨ Features

-   **Metadata Scraping**: Extracts `title` and `description` from meta tags.
-   **Dual Screenshots**: Captures screenshots in both configurable PC and mobile resolutions.
-   **Flexible Crawling Modes**:
    -   **Incremental**: (Default) Only crawls new URLs not found in the database.
    -   **Full**: Re-crawls all URLs from scratch.
    -   **Retry**: Specifically re-crawls URLs that failed previously.
    -   **Update**: Force-updates a single, specified URL.
-   **Failure Handling**: Automatically retries failed attempts and logs them for inspection.
-   **Organized Output**: Saves all data and images into structured, easy-to-navigate directories.
-   **Highly Configurable**: Almost everything, from browser arguments to file paths, can be customized.

---

## 🚀 Getting Started

Follow these steps to get the crawler up and running on your local machine.

### 1. Prerequisites

-   [Node.js](https://nodejs.org/) (LTS version recommended)
-   [pnpm](https://pnpm.io/) (for package management)

### 2. Installation

1.  Clone the repository to your local machine:
    ```bash
    git clone https://github.com/your-username/web-crawler-with-puppeteer.git
    cd web-crawler-with-puppeteer
    ```

2.  Install the dependencies using pnpm:
    ```bash
    pnpm install
    ```
    This will download Puppeteer and the appropriate browser version.

### 3. Configuration

Before running the crawler, you need to set up your configuration files. The project uses example files to avoid committing personal settings to the repository.

1.  **Configure URLs**:
    Copy the example URL list to create your own list.
    ```bash
    cp utils/urls.example.js utils/urls.js
    ```
    Now, open `utils/urls.js` and add the websites you want to crawl.

2.  **Configure Settings (Optional)**:
    The default settings in `utils/config.js` work well for most cases. If you need to change browser settings, timeouts, or output paths, create a custom config file:
    ```bash
    cp utils/config.example.js utils/config.js
    ```
    Modify `utils/config.js` as needed.

---

## 🏃‍♀️ Usage

The crawler is executed from the command line.

### Basic Command

To run the crawler in its default (incremental) mode:

```bash
node crawler.js
```

### Command-Line Arguments

You can control the crawling behavior using the following arguments:

| Argument             | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `--all`              | Force a full re-crawl of all URLs in `utils/urls.js`.       |
| `--retry-failures`   | Only crawl the URLs listed in `data/failures.json`.         |
| `--update <URL>`     | Force a re-crawl of a single, specified URL.                |

**Examples:**

```bash
# Re-crawl every website
node crawler.js --all

# Retry only the websites that failed last time
node crawler.js --retry-failures

# Force an update for a specific website
node crawler.js --update https://example.com
```

---

## 📂 Output Structure

All generated files are saved in the `data/` and `screenshots/` directories.

-   `screenshots/`
    -   `pc/`: Stores screenshots from the desktop viewport.
    -   `mobile/`: Stores screenshots from the mobile viewport.
-   `data/`
    -   `meta.json`: A JSON database of all successfully crawled metadata.
    -   `failures.json`: A list of URLs that failed to be crawled, along with the error details.
    -   `report.json`: A summary of the last crawl session (timestamps, counts, etc.).

> **Note**: It is recommended to add `data/` and `screenshots/` to your `.gitignore` file to avoid committing generated content.

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features, improvements, or bug fixes, please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.