import React from "react";

type Project = {
  title: string;
  description: string;
  tech: string[];
  link?: string;
};

const projects: Project[] = [
  {
    title: "API CRUD de Tareas",
    description:
      "API REST con autenticación básica y operaciones CRUD para gestionar tareas. Enfoque en claridad y tests.",
    tech: ["Node.js", "Express", "TypeScript"],
  },
  {
    title: "Landing Page Moderna",
    description:
      "Landing responsiva con SEO básico y Lighthouse >90. Ideal para validar productos y captar leads.",
    tech: ["Next.js", "Tailwind CSS"],
  },
  {
    title: "Dashboard con Autenticación",
    description:
      "Panel con sesiones, roles y consumo de API. Foco en DX y mantenibilidad.",
    tech: ["Next.js", "React", "APIs"],
  },
];

export default function Projects(): JSX.Element {
  return (
    <section id="proyectos" className="border-t border-gray-200 py-14 dark:border-gray-800">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-2xl font-semibold md:text-3xl">Proyectos</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Muestras rápidas para evaluar calidad de código y entrega.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {projects.map((p) => (
            <article key={p.title} className="rounded-lg border border-gray-200 p-5 dark:border-gray-800">
              <h3 className="text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{p.description}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {p.tech.map((t) => (
                  <li key={t} className="rounded-md bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-sm">
                <span className="text-gray-500">Repositorio:</span> <span className="font-medium">Pronto</span>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-8 rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
          <p>
            Ofrezco el <span className="font-semibold">primer proyecto gratis</span> (alcance reducido) para demostrar
            velocidad, calidad y comunicación.
          </p>
        </div>
      </div>
    </section>
  );
}



