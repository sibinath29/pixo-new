export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  // Minimum 8 characters
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // At least 1 uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // At least 1 lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  // At least 1 number
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // At least 1 symbol
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one symbol (!@#$%^&* etc.)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function getPasswordRequirements(): string {
  return "Password must be at least 8 characters and include: 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol";
}














