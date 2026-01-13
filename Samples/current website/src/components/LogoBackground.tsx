import {
  OpenAILogo,
  ChatGPTLogo,
  GoogleGeminiLogo,
  ClaudeLogo,
  ZapierLogo,
  N8nLogo,
  MidjourneyLogo,
  HuggingFaceLogo,
  AnthropicLogo,
  IBMWatsonLogo,
  AzureLogo,
  AdobeLogo,
  AppleIntelligenceLogo,
  PerplexityLogo,
  StableDiffusionLogo,
  FirefliesLogo,
  DeepSeekLogo,
  ElevenLabsLogo,
  MetaAILogo,
} from "./AILogos";

const logoComponents = [
  OpenAILogo,
  ChatGPTLogo,
  GoogleGeminiLogo,
  ClaudeLogo,
  ZapierLogo,
  N8nLogo,
  MidjourneyLogo,
  HuggingFaceLogo,
  AnthropicLogo,
  IBMWatsonLogo,
  AzureLogo,
  AdobeLogo,
  AppleIntelligenceLogo,
  PerplexityLogo,
  StableDiffusionLogo,
  FirefliesLogo,
  DeepSeekLogo,
  ElevenLabsLogo,
  MetaAILogo,
];

// Create a pattern of logos for each row
const createLogoPattern = (startIndex: number) => {
  const pattern = [];
  for (let i = 0; i < 12; i++) {
    pattern.push(logoComponents[(startIndex + i) % logoComponents.length]);
  }
  return [...pattern, ...pattern, ...pattern]; // Triple for seamless loop
};

export function LogoBackground() {
  const row1Logos = createLogoPattern(0);
  const row2Logos = createLogoPattern(4);
  const row3Logos = createLogoPattern(8);
  const row4Logos = createLogoPattern(2);
  const row5Logos = createLogoPattern(6);
  const row6Logos = createLogoPattern(10);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 flex flex-col justify-around py-8">
        {/* Row 1 - Scroll right to left */}
        <div className="flex gap-16 animate-scroll-logos-row1">
          {row1Logos.map((LogoComponent, index) => (
            <div key={index} className="flex-shrink-0 text-muted-foreground/13">
              <LogoComponent />
            </div>
          ))}
        </div>

        {/* Row 2 - Scroll left to right (reversed) */}
        <div className="flex gap-16 animate-scroll-logos-row2">
          {row2Logos.map((LogoComponent, index) => (
            <div key={index} className="flex-shrink-0 text-muted-foreground/13">
              <LogoComponent />
            </div>
          ))}
        </div>

        {/* Row 3 - Scroll right to left (slower) */}
        <div className="flex gap-16 animate-scroll-logos-row3">
          {row3Logos.map((LogoComponent, index) => (
            <div key={index} className="flex-shrink-0 text-muted-foreground/13">
              <LogoComponent />
            </div>
          ))}
        </div>

        {/* Row 4 - Scroll left to right */}
        <div className="flex gap-16 animate-scroll-logos-row4">
          {row4Logos.map((LogoComponent, index) => (
            <div key={index} className="flex-shrink-0 text-muted-foreground/13">
              <LogoComponent />
            </div>
          ))}
        </div>

        {/* Row 5 - Scroll right to left */}
        <div className="flex gap-16 animate-scroll-logos-row5">
          {row5Logos.map((LogoComponent, index) => (
            <div key={index} className="flex-shrink-0 text-muted-foreground/13">
              <LogoComponent />
            </div>
          ))}
        </div>

        {/* Row 6 - Scroll left to right */}
        <div className="flex gap-16 animate-scroll-logos-row6">
          {row6Logos.map((LogoComponent, index) => (
            <div key={index} className="flex-shrink-0 text-muted-foreground/13">
              <LogoComponent />
            </div>
          ))}
        </div>
      </div>

      {/* Gradient overlays for fading */}
      <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
      <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background via-background/80 to-transparent z-10"></div>
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background via-background/60 to-transparent z-10"></div>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-muted/30 via-background/40 to-transparent z-10"></div>
    </div>
  );
}
