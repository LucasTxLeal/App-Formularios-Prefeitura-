"use client";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  required?: boolean;
  placeholder?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  placeholder = "Selecione...",
}: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-slate-700 mb-1.5">
        {label}
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
}

export function TextField({
  label,
  value,
  onChange,
  required,
  type = "text",
  placeholder,
  maxLength,
}: TextFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-slate-700 mb-1.5">
        {label}
      </label>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="input"
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
    <div className="sm:col-span-2">
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
