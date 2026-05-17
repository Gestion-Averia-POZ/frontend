/* =====================
   Tipos de dominio compartidos
   ===================== */

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  cedula: string;
}

export interface FormField {
  icon?: React.ElementType;
  label: string;
  placeholder: string;
  type?: string;
}

export type Route = (typeof import("../constants").ROUTES)[keyof typeof import("../constants").ROUTES];
