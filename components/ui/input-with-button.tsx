'use client';

import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { cn } from '@/lib/utils';

export interface InputWithButtonProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Value of the input */
  value?: string;
  /** Callback when input value changes */
  onChange?: (value: string) => void;
  /** Callback when button is clicked (only called if value is not empty) */
  onButtonClick?: () => void;
  /** Button text */
  buttonText?: string;
  /** Icon element to display inside input (on the left) */
  icon?: React.ReactNode;
  /** Input placeholder text */
  placeholder?: string;
  /** Additional className for the container */
  containerClassName?: string;
  /** Additional className for the input */
  inputClassName?: string;
  /** Additional className for the button */
  buttonClassName?: string;
  /** Whether button should show loading/shake animation */
  buttonShake?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

export const InputWithButton = forwardRef<
  HTMLInputElement,
  InputWithButtonProps
>(
  (
    {
      value,
      onChange,
      onButtonClick,
      buttonText = 'Submit',
      icon,
      placeholder,
      containerClassName,
      inputClassName,
      buttonClassName,
      buttonShake = false,
      disabled = false,
      ...inputProps
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Expose the input ref to parent components
    useImperativeHandle(ref, () => inputRef.current!);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    };

    const handleButtonClick = () => {
      // If input is empty, focus it instead of calling callback
      if (!value || value.trim() === '') {
        inputRef.current?.focus();
        return;
      }

      // Otherwise, call the provided callback
      onButtonClick?.();
    };

    return (
      <div className={cn('relative flex items-center', containerClassName)}>
        <div className="relative flex w-full items-center">
          {icon && (
            <span className="pointer-events-none absolute left-3 text-gray-500 dark:text-gray-400">
              {icon}
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'flex w-full rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none transition-colors',
              'hover:bg-gray-150 focus:bg-gray-150',
              'dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:bg-gray-600',
              'disabled:cursor-not-allowed disabled:opacity-50',
              icon && 'pl-9',
              inputClassName
            )}
            {...inputProps}
          />
        </div>
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled}
          className={cn(
            'ml-1.5 flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors',
            'bg-gray-900 text-white hover:bg-gray-800',
            'dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200',
            'disabled:cursor-not-allowed disabled:opacity-50',
            buttonShake && 'animate-shake',
            buttonClassName
          )}
        >
          {buttonText}
        </button>
      </div>
    );
  }
);

InputWithButton.displayName = 'InputWithButton';
