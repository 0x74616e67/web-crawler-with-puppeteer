/**
 * 配置文件
 * 所有可调参数都放在这里，便于统一管理
 * 注意 urls 已经单独放到 urls.js
 */

module.exports = {
  // Puppeteer 配置
  puppeteer: {
    headless: true, // 是否无头浏览器
    launchTimeout: 60000, // 启动浏览器超时，单位毫秒
    protocolTimeout: 180000, // CDP 协议超时，单位毫秒
    defaultViewport: null, // 默认视口，可自定义 { width, height }
  },

  // 页面加载配置
  page: {
    gotoTimeout: 90000, // 页面加载超时，单位毫秒
    waitUntil: "networkidle2", // 页面加载完成条件，可选 networkidle0 / networkidle2 / domcontentloaded
    imageLoadTimeout: 90000, // 等待图片加载完成超时，单位毫秒
  },

  // 截图配置
  screenshot: {
    pc: { width: 1920, height: 1080, fullPage: false }, // PC 端截图视口
    mobile: {
      width: 375,
      height: 812,
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 3,
      fullPage: false, // 是否截取全页面
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) " +
        "AppleWebKit/605.1.15 (KHTML, like Gecko) " +
        "Version/15.0 Mobile/15E148 Safari/604.1", // Mobile UserAgent
    },
  },

  // 文件路径
  paths: {
    pcScreenshotDir: "screenshots/pc", // PC 截图存放目录
    mobileScreenshotDir: "screenshots/mobile", // Mobile 截图存放目录
    dataDir: "data", // 数据目录
    reportFile: "data/report.json", // 执行报告
    failuresFile: "data/failures.json", // 失败记录
  },
};
