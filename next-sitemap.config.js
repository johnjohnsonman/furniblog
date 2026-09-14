/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.chairpedia.com",
  generateRobotsTxt: true,
  exclude: ["/admin/*", "/api/*"],
  changefreq: "weekly",
  priority: 0.7,
}
