export function getWorldIdIfUrl(url: string): string {
  const match = url.match(/\/world\/([a-zA-Z0-9]+)/)
  return match ? match[1] : url
}
