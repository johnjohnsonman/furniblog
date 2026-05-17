/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://furniblog.vercel.app",
  generateRobotsTxt: true,
  exclude: ["/admin/*", "/api/*"],
  changefreq: "weekly",
  priority: 0.7,
}
