const url = "https://www.furniblog.com/blog/kokuyo-ing-cloud-eight-years-of-engineering-zero-gravity-focus"

async function main() {
  const response = await fetch(url)
  const html = await response.text()
  const images = [...html.matchAll(/<img[^>]+src="([^"]+)/g)].map((match) => match[1])
  const restored = [...new Set(images.filter((src) => src.includes("/blog-images/")))]
  const imageStatuses = []

  for (const src of restored) {
    const imageResponse = await fetch(src, { method: "HEAD" })
    imageStatuses.push({ status: imageResponse.status, src })
  }

  console.log(JSON.stringify({
    pageStatus: response.status,
    totalImages: images.length,
    restoredInlineImages: restored.length,
    titlePresent: html.includes("Kokuyo Ing Cloud: Eight Years of Engineering Zero-Gravity Focus"),
    imageStatuses,
  }, null, 2))

  if (!response.ok || restored.length !== 5 || imageStatuses.some((image) => image.status !== 200)) {
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
