import React from "react";

export default function Contact(): JSX.Element {
  return (
    <section id="contacto" className="border-t border-gray-200 py-14 dark:border-gray-800">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-2xl font-semibold md:text-3xl">Contacto</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          ¿Tenés una idea o tarea concreta? Hablemos y te paso una propuesta en 24 h.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            className="rounded-md bg-sky-600 px-5 py-3 text-white shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
            href="mailto:carlossjuarezz2006@gmail.com?subject=Proyecto%20-%20Contacto%20desde%20portfolio"
          >
            Escribirme por email
          </a>
          <a
            className="rounded-md border border-gray-300 px-5 py-3 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
            href="/cv"
          >
            Ver CV
          </a>
        </div>
      </div>
    </section>
  );
}




