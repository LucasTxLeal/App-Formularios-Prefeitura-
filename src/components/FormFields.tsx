"use client";

import { useId } from "react";
import { formatBrazilianDate, parseBrazilianDate } from "@/lib/date";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  placeholder?: string;
  highlight?: boolean;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  placeholder = "Selecione...",
  highlight,
}: SelectFieldProps) {
  return (
    <div>
      <label
        className={`block text-sm mb-1.5 ${
          highlight ? "font-bold text-brand-slate-900" : "font-medium text-brand-slate-700"
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  highlight?: boolean;
  /** Aceita apenas dígitos (CPF/CNPJ, CEP, telefone, cartão SUS). */
  numericOnly?: boolean;
  /** Converte automaticamente para maiúsculas (UF). */
  uppercase?: boolean;
}

export function TextField({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  maxLength,
  highlight,
  numericOnly,
  uppercase,
}: TextFieldProps) {
  const inputId = useId();

  function handleChange(raw: string) {
    let next = raw;
    if (numericOnly) next = next.replace(/\D/g, "");
    if (uppercase) next = next.toUpperCase();
    onChange(next);
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        className={`block text-sm mb-1.5 ${
          highlight ? "font-bold text-brand-slate-900" : "font-medium text-brand-slate-700"
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        id={inputId}
        required={required}
        type={type === "date" ? "text" : type}
        value={type === "date" ? formatBrazilianDate(value) : value}
        onChange={(e) => {
          if (type !== "date") {
            handleChange(e.target.value);
            return;
          }
          const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
          const formatted = digits.replace(/^(\d{2})(\d)/, "$1/$2").replace(/^(\d{2}\/\d{2})(\d)/, "$1/$2");
          const iso = parseBrazilianDate(formatted);
          e.target.setCustomValidity(formatted && !iso ? "Informe uma data válida no formato DD/MM/AAAA." : "");
          onChange(iso ?? formatted);
        }}
        placeholder={type === "date" ? "DD/MM/AAAA" : placeholder}
        maxLength={type === "date" ? 10 : maxLength}
        inputMode={type === "date" || numericOnly ? "numeric" : undefined}
        pattern={type === "date" ? "[0-9]{2}/[0-9]{2}/[0-9]{4}" : numericOnly ? "[0-9]*" : undefined}
        className="input"
      />
    </div>
  );
}

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}

export function TextAreaField({ label, value, onChange, required, placeholder, rows = 4 }: TextAreaFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea
        required={required}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input resize-none"
      />
    </div>
  );
}

interface CheckboxGroupFieldProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
}

export function CheckboxGroupField({ label, values, onChange, options }: CheckboxGroupFieldProps) {
  function toggle(opt: string) {
    if (values.includes(opt)) {
      onChange(values.filter((v) => v !== opt));
    } else {
      onChange([...values, opt]);
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-brand-slate-700 mb-2">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((opt) => (
          <label
            key={opt}
            className={`flex items-center gap-2 text-sm rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
              values.includes(opt)
                ? "border-brand-blue-500 bg-brand-blue-50 text-brand-blue-700"
                : "border-brand-slate-100 text-brand-slate-700 hover:border-brand-slate-100"
            }`}
          >
            <input
              type="checkbox"
              checked={values.includes(opt)}
              onChange={() => toggle(opt)}
              className="accent-brand-blue-600"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}
