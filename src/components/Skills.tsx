import React from "react";

const skills: string[] = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "APIs REST",
  "Tailwind CSS",
  "Git/GitHub",
];

export default function Skills(): React.ReactElement {
  return (
    <section id="skills" className="border-t border-gray-200 py-14 dark:border-gray-800">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-2xl font-semibold md:text-3xl">Habilidades</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Stack moderno para construir productos web end‑to‑end.
        </p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {skills.map((s) => (
            <li key={s} className="rounded-md border border-gray-200 px-3 py-1 text-sm dark:border-gray-700">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}




