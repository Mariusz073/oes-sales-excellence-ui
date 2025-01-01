"use client";

import { useEffect, useRef } from "react";

interface IndeterminateCheckboxProps {
  id: string;
  name: string;
  checked: boolean;
  indeterminate?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  "aria-label"?: string;
}

export default function IndeterminateCheckbox({
  id,
  name,
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  className = "",
  label,
  "aria-label": ariaLabel,
}: IndeterminateCheckboxProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={checkboxRef}
      type="checkbox"
      id={id}
      name={name}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-label={ariaLabel || label}
      title={label}
      className={`h-4 w-4 rounded border-gray-300 
                ${checked ? 'text-[#FF6B8A]' : indeterminate ? 'text-gray-400' : ''} 
                focus:ring-[#FF6B8A] ${className}`}
    />
  );
}
