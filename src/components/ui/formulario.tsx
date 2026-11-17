"use client";

import { createContext, useActionState, useContext, useId, type ComponentProps, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { ESTADO_INICIAL, type EstadoFormulario } from "@/lib/validacion";
import { clasesBoton } from "./boton";

type Accion = (previo: EstadoFormulario, datos: FormData) => Promise<EstadoFormulario>;

const ContextoEstado = createContext<EstadoFormulario>(ESTADO_INICIAL);

// Formulario ligado a una acción de servidor. Muestra errores por campo y el resultado.
export function Formulario({
  accion,
  children,
  className = "",
}: {
  accion: Accion;
  children: ReactNode;
  className?: string;
}) {
  const [estado, enviar] = useActionState(accion, ESTADO_INICIAL);
  return (
    <ContextoEstado value={estado}>
      <form action={enviar} noValidate className={`flex flex-col gap-4 ${className}`}>
        {children}
        <p
          role="status"
          aria-live="polite"
          className={
            estado.mensaje
              ? `aparecer rounded-lg px-3 py-2 text-sm ${estado.ok ? "bg-acento-tenue text-acento-fuerte" : "bg-error-tenue text-error"}`
              : "sr-only"
          }
        >
          {estado.mensaje ?? ""}
        </p>
      </form>
    </ContextoEstado>
  );
}

const CLASES_CONTROL =
  "min-h-11 w-full rounded-lg border border-linea bg-superficie px-3 text-base text-tinta " +
  "placeholder:text-tinta-suave/70 transition-colors duration-150 hover:border-tinta-suave " +
  "aria-[invalid=true]:border-error";

export function Campo({
  etiqueta,
  ayuda,
  name,
  ...resto
}: ComponentProps<"input"> & { etiqueta: string; ayuda?: string; name: string }) {
  const estado = useContext(ContextoEstado);
  const id = useId();
  const error = estado.errores?.[name];
  const descripciones = [ayuda ? `${id}-ayuda` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-tinta">
        {etiqueta}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={descripciones || undefined}
        className={CLASES_CONTROL}
        {...resto}
      />
      {ayuda ? (
        <p id={`${id}-ayuda`} className="text-sm text-tinta-suave">
          {ayuda}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Casilla({ etiqueta, ayuda, name, ...resto }: ComponentProps<"input"> & { etiqueta: string; ayuda?: string; name: string }) {
  const id = useId();
  return (
    <div className="flex items-start gap-3">
      <input
        id={id}
        name={name}
        type="checkbox"
        aria-describedby={ayuda ? `${id}-ayuda` : undefined}
        className="mt-1 size-5 shrink-0 accent-acento"
        {...resto}
      />
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="text-sm font-medium text-tinta">
          {etiqueta}
        </label>
        {ayuda ? (
          <p id={`${id}-ayuda`} className="text-sm text-tinta-suave">
            {ayuda}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function Enviar({
  children,
  variante = "principal",
}: {
  children: ReactNode;
  variante?: "principal" | "secundario" | "peligro";
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={clasesBoton(variante, "self-start")}>
      {pending ? "Enviando…" : children}
    </button>
  );
}

export function Selector({
  etiqueta,
  name,
  children,
  ...resto
}: ComponentProps<"select"> & { etiqueta: string; name: string }) {
  const estado = useContext(ContextoEstado);
  const id = useId();
  const error = estado.errores?.[name];
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-tinta">
        {etiqueta}
      </label>
      <select
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={CLASES_CONTROL}
        {...resto}
      >
        {children}
      </select>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
