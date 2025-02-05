export function downloadFile(buffer: Buffer, fileName: string) {
  const blob = new Blob([buffer])
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
}
