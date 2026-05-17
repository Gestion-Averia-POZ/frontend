/**
 * Combina clases CSS condicionalmente.
 * Útil para composición de clases de Tailwind.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
