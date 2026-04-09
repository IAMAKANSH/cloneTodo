interface TaskCheckboxProps {
  checked: boolean;
  isImportant?: boolean;
  onChange: () => void;
  size?: 'sm' | 'md';
}

export function TaskCheckbox({ checked, isImportant, onChange, size = 'md' }: TaskCheckboxProps) {
  const dim = size === 'sm' ? 18 : 22;
  const iconDim = size === 'sm' ? 10 : 13;

  const checkedColor = 'var(--color-primary)';
  const uncheckedColor = isImportant ? 'var(--color-important)' : 'var(--color-text-tertiary)';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className="relative shrink-0 flex items-center justify-center group/cb checkbox-glow rounded-full"
      style={{ width: dim, height: dim }}
      aria-label={checked ? 'Mark as incomplete' : 'Mark as complete'}
    >
      {/* Pulse ring on check */}
      {checked && (
        <span
          className="absolute inset-0 rounded-full"
          style={{
            backgroundColor: checkedColor,
            animation: 'pulse-ring 0.5s ease-out',
            opacity: 0,
          }}
        />
      )}

      {/* Outer ring */}
      <span
        className="absolute inset-0 rounded-full border-2 transition-all duration-300"
        style={{
          borderColor: checked ? checkedColor : uncheckedColor,
          backgroundColor: checked ? checkedColor : 'transparent',
          boxShadow: checked ? `0 0 10px ${isImportant ? 'rgba(232,54,79,0.3)' : 'var(--color-primary-glow)'}` : 'none',
          transform: checked ? 'scale(1)' : 'scale(1)',
        }}
      />

      {/* Hover ring fill */}
      {!checked && (
        <span
          className="absolute inset-0 rounded-full opacity-0 group-hover/cb:opacity-100 transition-all duration-200 scale-75 group-hover/cb:scale-100"
          style={{
            backgroundColor: isImportant
              ? 'rgba(232, 54, 79, 0.08)'
              : 'var(--color-primary-light)',
          }}
        />
      )}

      {/* Checkmark */}
      {checked && (
        <svg
          width={iconDim}
          height={iconDim}
          viewBox="0 0 12 12"
          fill="none"
          className="relative z-10"
        >
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 24,
              strokeDashoffset: 0,
              animation: 'checkmark-draw 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
            }}
          />
        </svg>
      )}

      {/* Hover checkmark preview */}
      {!checked && (
        <svg
          width={iconDim}
          height={iconDim}
          viewBox="0 0 12 12"
          fill="none"
          className="relative z-10 opacity-0 group-hover/cb:opacity-25 transition-all duration-200 scale-75 group-hover/cb:scale-100"
        >
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke={isImportant ? 'var(--color-important)' : 'var(--color-primary)'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
