import Hero from "@/components/Hero";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-gray-900 dark:bg-black dark:text-gray-100">
      <main>
        <Hero />
        <Skills />
        <Projects />
        <Contact />
      </main>
      <footer className="border-t border-gray-200 py-10 text-center text-sm text-gray-500 dark:border-gray-800">
        Hecho por Carlos Alberto Juarez — Tafí Viejo, Tucumán, Argentina
      </footer>
    </div>
  );
}
