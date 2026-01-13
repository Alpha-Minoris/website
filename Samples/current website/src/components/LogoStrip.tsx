export function LogoStrip() {
  const logos = [
    "OpenAI",
    "Google Gemini",
    "Anthropic",
    "Meta AI",
    "Azure AI",
    "Zapier",
    "Make.com",
    "n8n",
    "Perplexity",
    "Grok",
    "DeepSeek",
    "DALL·E",
    "Parloa",
    "Midjourney",
    "Hugging Face",
    "Cohere",
  ];

  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 flex items-center">
        <div className="flex gap-12 animate-scroll-logos">
          {duplicatedLogos.map((logo, index) => (
            <div
              key={index}
              className="flex-shrink-0 text-muted-foreground/10 select-none whitespace-nowrap"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.5rem)",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
      
      {/* Gradient overlays to fade edges */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>
    </div>
  );
}
