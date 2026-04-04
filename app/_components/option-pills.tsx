"use client";

interface OptionPillsProps {
  options: string[];
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export function OptionPills({ options, onSelect, disabled }: OptionPillsProps) {
  return (
    <div className="flex flex-wrap gap-2 pl-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          disabled={disabled}
          className="px-4 py-2 text-sm font-medium rounded-full
            bg-white text-on-surface
            hover:bg-primary hover:text-on-primary
            active:bg-primary active:text-on-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors cursor-pointer"
          style={{
            boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
