import { Hero } from "@/components/sections/hero";
import { Stats } from "@/components/sections/stats";
import { TechMarquee } from "@/components/sections/marquee";
import { Services } from "@/components/sections/services";
import { AICapabilities } from "@/components/sections/ai-capabilities";
import { Process } from "@/components/sections/process";
import { Work } from "@/components/sections/work";
import { CTA } from "@/components/sections/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="space-y-14 py-14">
        <Stats />
        <TechMarquee />
      </div>
      <Services />
      <AICapabilities />
      <Process />
      <Work />
      <CTA />
    </>
  );
}
