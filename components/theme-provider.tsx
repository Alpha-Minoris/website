import { createClient } from '@/lib/supabase/server'

function hexToHsl(hex: string): string {
  // Remove hash if present
  hex = hex.replace(/^#/, '');

  // Parse r, g, b
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Convert to fractions
  r /= 255;
  g /= 255;
  b /= 255;

  // Find max and min
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // Convert to specific format: "H S% L%" (no commas, suitable for tailwind hsl space-separated)
  // Tailwind config uses `hsl(var(--param))`. So var should be `H S% L%`
  return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`;
}

export async function ThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Fetch site settings
  const { data: settings } = await supabase
    .from('website_settings')
    .select('theme_json')
    .eq('key', 'global')
    .single()

  let cssVariables = ''

  if (settings?.theme_json) {
    const theme = settings.theme_json as any
    const colors = theme.colors || {}

    // Map DB JSON keys to CSS Variables
    // Note: We need to handle foregrounds too if they are in DB, or auto-calculate?
    // The seed data has explicit keys.
    const map = {
      background: '--background',
      surface: '--card', // logical mapping
      text: '--foreground',
      accent: '--primary', // mapping accent to primary for now as per design intention
      border: '--border',
      muted: '--muted',
    }

    // We also need to map the "foreground" counterparts. 
    // Ideally the DB provides them, or we assume the seed data is complete?
    // The seed data is: background, surface, text, accent, border, muted.
    // Missing: primary-foreground, card-foreground, popover, etc.
    // For now, let's map what we have and fallback to globals.css for others.

    const vars: string[] = []

    if (colors.background) vars.push(`${map.background}: ${hexToHsl(colors.background)};`)
    if (colors.surface) {
      vars.push(`${map.surface}: ${hexToHsl(colors.surface)};`)
      vars.push(`--popover: ${hexToHsl(colors.surface)};`)
    }
    if (colors.text) {
      vars.push(`${map.text}: ${hexToHsl(colors.text)};`)
      vars.push(`--card-foreground: ${hexToHsl(colors.text)};`)
      vars.push(`--popover-foreground: ${hexToHsl(colors.text)};`)
    }
    if (colors.accent) {
      vars.push(`${map.accent}: ${hexToHsl(colors.accent)};`)
      vars.push(`--accent: ${hexToHsl(colors.accent)};`)
      vars.push(`--ring: ${hexToHsl(colors.accent)};`)
    }
    if (colors.border) vars.push(`${map.border}: ${hexToHsl(colors.border)};`)
    if (colors.muted) vars.push(`${map.muted}: ${hexToHsl(colors.muted)};`)

    // Radius
    if (theme.radius) {
      vars.push(`--radius: ${theme.radius};`)
    }

    cssVariables = `
      :root {
        ${vars.join('\n')}
      }
    `
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      {children}
    </>
  )
}
