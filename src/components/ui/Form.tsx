import { type LucideIcon } from "lucide-react";
import { AlertCircle } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import CustomSelect from "./CustomSelect";

interface Field {
  icon?: React.ElementType;
  label: string;
  placeholder: string;
  type?: string;
  options?: string[];
  disabled?: boolean;
  // Props opcionales para inputs controlados
  value?: string;
  onChange?: (value: string) => void;
}

interface FormProps {
  textButton: string;
  classes?: string;
  submitClasses?: string;
  noBorder?: boolean;
  gridFields?: number;
  fields: Field[];
  submitIcon?: LucideIcon;
  // Callback que se ejecuta al hacer submit (opcional)
  onSubmit?: (e: { preventDefault(): void }) => void;
  // Mensaje de error a mostrar sobre el botón (opcional)
  error?: string;
}

export default function Form({
  classes = "",
  fields,
  submitIcon,
  textButton,
  submitClasses = "w-[219px] h-[56px]",
  noBorder = false,
  gridFields,
  onSubmit,
  error,
}: FormProps) {
  const containerClasses = noBorder
    ? classes
    : `border border-[#E2E8F0] rounded-xl p-8 ${classes}`;

  const renderField = ({
    icon: Icon,
    label,
    placeholder,
    type = "text",
    options,
    disabled,
    value,
    onChange,
  }: Field) => (
    <div key={label}>
      <label className="label mb-1">
        {Icon && <Icon color="#2563EB" size={16} />}
        <span className="label-text font-medium">{label}</span>
      </label>

      {type === "select" ? (
        <CustomSelect
          placeholder={placeholder}
          options={options ?? []}
          value={value}
          onChange={onChange}
        />
      ) : label === "Mensaje" ? (
        <textarea
          className="textarea w-full resize-none"
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <Input
          typeInput={type}
          placeholder={placeholder}
          classes="w-full"
          disabled={disabled}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );

  const gridSection = gridFields ? fields.slice(0, gridFields) : [];
  const stackSection = gridFields ? fields.slice(gridFields) : fields;

  return (
    <form className={containerClasses} onSubmit={onSubmit}>
      <div className="flex flex-col gap-4">
        {gridSection.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {gridSection.map(renderField)}
          </div>
        )}
        {stackSection.map(renderField)}
      </div>

      {/* Mensaje de error — solo se muestra si se pasa la prop error */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm mt-4">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <Button
        text={textButton}
        variant_classes={`btn-primary mt-6 ${submitClasses}`}
        icon={submitIcon}
      />
    </form>
  );
}
