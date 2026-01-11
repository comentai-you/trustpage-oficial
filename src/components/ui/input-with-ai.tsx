import * as React from "react";
import { cn } from "@/lib/utils";
import { AIMagicButton } from "@/components/ai/AIMagicButton";

interface InputWithAIProps extends React.ComponentProps<"input"> {
  aiFieldType?: 'headline' | 'subheadline' | 'button' | 'body' | 'benefit' | 'benefit_desc' | 'testimonial' | 'faq_question' | 'faq_answer' | 'offer' | 'section_title' | 'richtext' | 'default';
  showAI?: boolean;
}

const InputWithAI = React.forwardRef<HTMLInputElement, InputWithAIProps>(
  ({ className, type, aiFieldType = 'default', showAI = true, onChange, value, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    // Merge refs
    React.useImperativeHandle(ref, () => inputRef.current!);

    const handleAISelect = (text: string) => {
      if (inputRef.current) {
        // Create a synthetic event to trigger onChange
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;
        
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(inputRef.current, text);
          const event = new Event('input', { bubbles: true });
          inputRef.current.dispatchEvent(event);
        }
      }
    };

    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            showAI && "pr-10",
            className
          )}
          ref={inputRef}
          onChange={onChange}
          value={value}
          {...props}
        />
        {showAI && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2">
            <AIMagicButton
              fieldType={aiFieldType}
              currentText={typeof value === 'string' ? value : ''}
              onSelect={handleAISelect}
            />
          </div>
        )}
      </div>
    );
  }
);

InputWithAI.displayName = "InputWithAI";

export { InputWithAI };
