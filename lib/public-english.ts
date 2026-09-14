/** Public text guard; source records are preserved unchanged. */
export function englishImageDescriptions(html: string): string {
  return html.replace(/\balt=(['"])(.*?)\1/gi, (attribute, quote, text) =>
    /[\uac00-\ud7af\u3130-\u318f]/.test(text) ? `alt=${quote}Chair detail${quote}` : attribute)
}
