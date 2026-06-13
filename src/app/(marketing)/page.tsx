import { Hero } from "@/components/sections/hero";
import { Partners } from "@/components/sections/partners";
import { TechMarquee } from "@/components/sections/marquee";
import { Services } from "@/components/sections/services";
import { AICapabilities } from "@/components/sections/ai-capabilities";
import { ManagedSupport } from "@/components/sections/managed-support";
import { Process } from "@/components/sections/process";
import { CTA } from "@/components/sections/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <div className="space-y-14 py-14">
        <Partners />
        <TechMarquee />
      </div>
      <Services />
      <AICapabilities />
      <ManagedSupport />
      <Process />
      <CTA />
    </>
  );
}
