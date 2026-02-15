import { Input } from "@/components/ui/input";
import { User, Mail, Phone, MessageCircle } from "lucide-react";
import { CaptureFormFields } from "./useCaptureForm";

interface CaptureFormInputsProps {
  formFields: CaptureFormFields;
  formData: { name: string; email: string; phone: string; whatsapp: string };
  onInputChange: (field: string, value: string) => void;
  textColor: string;
  placeholderColor: string;
  inputBgColor?: string;
  inputBorderColor?: string;
  variant?: 'default' | 'light' | 'horizontal';
  className?: string;
}

const CaptureFormInputs = ({
  formFields,
  formData,
  onInputChange,
  textColor,
  placeholderColor,
  inputBgColor,
  inputBorderColor,
  variant = 'default',
  className = '',
}: CaptureFormInputsProps) => {
  const bgStyle = inputBgColor || `${textColor}10`;
  const borderStyle = inputBorderColor || 'transparent';
  const isHorizontal = variant === 'horizontal';

  const inputStyle: React.CSSProperties = {
    backgroundColor: bgStyle,
    color: variant === 'light' ? '#1f2937' : textColor,
    borderColor: borderStyle,
  };

  const iconColor = variant === 'light' ? '#9ca3af' : `${textColor}60`;

  const fields = [
    { show: formFields.showName, icon: User, type: 'text', placeholder: 'Seu nome', field: 'name', value: formData.name },
    { show: formFields.showEmail, icon: Mail, type: 'email', placeholder: 'Seu melhor e-mail', field: 'email', value: formData.email },
    { show: formFields.showPhone, icon: Phone, type: 'tel', placeholder: 'Seu telefone', field: 'phone', value: formData.phone },
    { show: formFields.showWhatsapp, icon: MessageCircle, type: 'tel', placeholder: 'Seu WhatsApp', field: 'whatsapp', value: formData.whatsapp },
  ].filter(f => f.show);

  return (
    <div className={`${isHorizontal ? 'flex flex-wrap gap-2' : 'space-y-3'} ${className}`}>
      {fields.map(({ icon: Icon, type, placeholder, field, value }) => (
        <div key={field} className={`relative ${isHorizontal ? 'flex-1 min-w-[180px]' : ''}`}>
          <Icon
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
            style={{ color: iconColor }}
          />
          <Input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onInputChange(field, e.target.value)}
            required
            className="pl-10 h-12 border text-base placeholder:opacity-100"
            style={inputStyle}
          />
          <style>{`
            input[placeholder="${placeholder}"]::placeholder { color: ${placeholderColor} !important; opacity: 1 !important; }
          `}</style>
        </div>
      ))}
    </div>
  );
};

export default CaptureFormInputs;
