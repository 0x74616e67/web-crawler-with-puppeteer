[English](./README.md) | [简体中文](./README.zh-CN.md)

# Web Crawler with Puppeteer

一个使用 Node.js 和 Puppeteer 构建的强大且可配置的网络爬虫。它能抓取网站的元数据（标题、描述）并为 PC 和移动端视图生成截图。

这个脚本最初是为 [https://theuselessweb.online/](https://theuselessweb.online/) 网站创建的，用于自动化其内容收集过程。

## ✨ 功能特性

-   **元数据抓取**: 从 meta 标签中提取 `title` 和 `description`。
-   **双端截图**: 同时捕获可配置的 PC 和移动端分辨率的网页截图。
-   **灵活的爬取模式**:
    -   **增量模式**: (默认) 只爬取数据库中尚未存在的新 URL。
    -   **全量模式**: 重新爬取所有 URL。
    -   **重试模式**: 只重新爬取之前失败的 URL。
    -   **更新模式**: 强制更新单个指定的 URL。
-   **失败处理**: 自动重试失败的请求，并将其记录下来以供检查。
-   **结构化输出**: 将所有数据和图片保存到结构清晰、��于浏览的目录中。
-   **高度可配置**: 从浏览器参数到文件路径，几乎所有内容都可以自定义。

---

## 🚀 快速开始

请按照以下步骤在您的本地机器上配置并运行此爬虫。

### 1. 环境要求

-   [Node.js](https://nodejs.org/) (推荐使用 LTS 版本)
-   [pnpm](https://pnpm.io/) (用于包管理)

### 2. 安装

1.  将本仓库克隆到您的本地机器：
    ```bash
    git clone https://github.com/0x74616e67/web-crawler-with-puppeteer.git
    cd web-crawler-with-puppeteer
    ```

2.  使用 pnpm 安装依赖：
    ```bash
    pnpm install
    ```
    该命令将会下载 Puppeteer 和对应的浏览器版本。

### 3. 配置

在运行爬虫之前，您需要设置您的配置文件。项目使用示例文件以避免将个人设置提交到版本库中。

1.  **配置 URL 列表**:
    复制 URL 列表示例文件来创建您自己的列表。
    ```bash
    cp utils/urls.example.js utils/urls.js
    ```
    然后，打开 `utils/urls.js` 并添加您想爬取的网站。

2.  **配置程序设置 (可选)**:
    `utils/config.js` 中的默认设置适用���大多数情况。如果您需要更改浏览器设置、超时时间或输出路径，请创建一个自定义配置文件：
    ```bash
    cp utils/config.example.js utils/config.js
    ```
    然后根据您的需求修改 `utils/config.js`。

---

## 🏃‍♀️ 如何使用

通过命令行来执行此爬虫。

### 基本命令

以默认的增量模式运行爬虫：

```bash
node crawler.js
```

### 命令行参数

您可以使用以下参数来控制爬虫的行为：

| 参数                 | 描述                                                |
| -------------------- | --------------------------------------------------- |
| `--all`              | 强制对 `utils/urls.js` 中的所有 URL 进行全量重新爬取。 |
| `--retry-failures`   | 仅爬取 `data/failures.json` 中记录的失败 URL。        |
| `--update <URL>`     | 强制重新爬取指定的单个 URL。                        |

**示例:**

```bash
# 重新爬取所有网站
node crawler.js --all

# 仅重试上次失败的网站
node crawler.js --retry-failures

# 强制更新某个特定网站
node crawler.js --update https://example.com
```

---

## 📂 输出结构

所有生成的文件都保存在 `data/` 和 `screenshots/` 目录中。

-   `screenshots/`
    -   `pc/`: 存储桌面端视图的截图。
    -   `mobile/`: 存储移动端视图的截图。
-   `data/`
    -   `meta.json`: 存储所有成功爬取的元数据的 JSON 数据库。
    -   `failures.json`: 记录爬取失败的 URL 列表及错误详情。
    -   `report.json`: 上次爬取任务的摘要（时间戳、统计数据等）。

> **注意**: 建议将 `data/` 和 `screenshots/` 目录添加到您的 `.gitignore` 文件中，以避免提交生成的内容。

---

## 🤝 贡献

欢迎参与贡献！如果您对新功能、改进或错误修复有任何想法，请随时创建 Issue 或提交 Pull Request。

## 📄 许可证

本项目基于 **MIT 许可证**。详情请参阅 [LICENSE](LICENSE) 文件。
