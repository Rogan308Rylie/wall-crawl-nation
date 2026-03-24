export default function RandomTheme() {
  const scriptStr = `
    const PALETTES = [
      { primary: "#A3FF12", accent: "#9D00FF" }, 
      { primary: "#00F0FF", accent: "#FF007F" },
      { primary: "#FFD700", accent: "#FF0055" }, 
      { primary: "#FF5500", accent: "#5500FF" }, 
      { primary: "#FF3300", accent: "#0033FF" },
      { primary: "#D4FF00", accent: "#FF0044" },
    ];
    const idx = Math.floor(Math.random() * PALETTES.length);
    
    // Generate a <style> tag to append into <head>. 
    // This prevents React hydration from blowing away the style attribute.
    const style = document.createElement('style');
    style.innerHTML = \`
      :root {
        --dynamic-primary: \${PALETTES[idx].primary} !important;
        --dynamic-accent: \${PALETTES[idx].accent} !important;
      }
    \`;
    document.head.appendChild(style);
  `;

  return (
    <script dangerouslySetInnerHTML={{ __html: scriptStr }} suppressHydrationWarning />
  );
}
