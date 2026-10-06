import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { site } from './src/content/site.ts'

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Fills the {{token}} placeholders in index.html from src/content/site.ts,
// so title, description and Open Graph tags live next to the rest of the content.
function siteMeta(): Plugin {
  const absolute = (path: string) => (site.url ? new URL(path, site.url).toString() : path)
  const tokens: Record<string, string> = {
    lang: site.lang,
    title: site.title,
    description: site.description,
    themeColor: site.themeColor,
    url: site.url,
    ogImage: absolute(site.ogImage),
  }
  return {
    name: 'site-meta',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => {
        // og:url must be absolute — drop it until a real URL is configured.
        if (!site.url) html = html.replace(/^\s*<meta property="og:url"[^>]*>\n/m, '')
        return html.replace(/\{\{(\w+)\}\}/g, (match, key: string) => (key in tokens ? escapeHtml(tokens[key]) : match))
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), siteMeta()],
})
