import * as React from "react";
import { cn } from "@/lib/utils";
import { AIMagicButton } from "@/components/ai/AIMagicButton";

interface TextareaWithAIProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  aiFieldType?: 'headline' | 'subheadline' | 'button' | 'body' | 'benefit' | 'benefit_desc' | 'testimonial' | 'faq_question' | 'faq_answer' | 'offer' | 'section_title' | 'richtext' | 'default';
  showAI?: boolean;
}

const TextareaWithAI = React.forwardRef<HTMLTextAreaElement, TextareaWithAIProps>(
  ({ className, aiFieldType = 'default', showAI = true, onChange, value, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    // Merge refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

    const handleAISelect = (text: string) => {
      if (textareaRef.current) {
        // Create a synthetic event to trigger onChange
        const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          'value'
        )?.set;
        
        if (nativeTextAreaValueSetter) {
          nativeTextAreaValueSetter.call(textareaRef.current, text);
          const event = new Event('input', { bubbles: true });
          textareaRef.current.dispatchEvent(event);
        }
      }
    };

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            showAI && "pr-10",
            className
          )}
          ref={textareaRef}
          onChange={onChange}
          value={value}
          {...props}
        />
        {showAI && (
          <div className="absolute right-1 top-2">
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

TextareaWithAI.displayName = "TextareaWithAI";

export { TextareaWithAI };
