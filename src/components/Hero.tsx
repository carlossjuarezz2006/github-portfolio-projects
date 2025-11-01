"use client";

import React from "react";

export default function Hero(): JSX.Element {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-sm uppercase tracking-widest text-sky-500">Disponible 100% remoto</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">
          Carlos Alberto Juarez
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
          Programador autodidacta — Desarrollo web full‑stack. Vivo en Tafí Viejo, Tucumán, Argentina.
        </p>
        <p className="mt-4 max-w-3xl text-gray-700 dark:text-gray-300">
          Enfocado en entregar software claro, rápido y mantenible. Para demostrar mi valor, ofrezco el
          <span className="font-semibold"> primer proyecto gratis</span> (alcance acotado) a nuevos clientes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#contacto"
            className="rounded-md bg-sky-600 px-5 py-3 text-white shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            Contáctame
          </a>
          <a
            href="#proyectos"
            className="rounded-md border border-gray-300 px-5 py-3 text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            Ver proyectos
          </a>
        </div>
      </div>
    </section>
  );
}




