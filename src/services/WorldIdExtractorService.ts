export function getWorldIdIfUrl(url: string): string {
  const match = url.match(/\/world\/(.+)/)
  return match ? match[1] : url
}
