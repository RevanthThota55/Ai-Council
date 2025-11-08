/**
 * Validation Utility Functions
 * Validates user input for authentication
 *
 * Why validation matters:
 * - Prevents invalid data from entering database
 * - Provides clear error messages to users
 * - Enhances security (prevents injection attacks)
 * - Improves data quality
 */

/**
 * Validation Result Interface
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate Email Format
 * Checks if email is in valid format using regex
 *
 * @param email - Email address to validate
 * @returns ValidationResult with isValid flag and error message
 *
 * Example:
 * const result = validateEmail('user@example.com')
 * if (!result.isValid) {
 *   console.error(result.error)
 * }
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return {
      isValid: false,
      error: 'Email is required',
    }
  }

  if (typeof email !== 'string') {
    return {
      isValid: false,
      error: 'Email must be a string',
    }
  }

  // Trim whitespace
  email = email.trim()

  // Check minimum length
  if (email.length < 3) {
    return {
      isValid: false,
      error: 'Email is too short',
    }
  }

  // Check maximum length (prevents DoS attacks)
  if (email.length > 254) {
    return {
      isValid: false,
      error: 'Email is too long',
    }
  }

  // RFC 5322 compliant email regex (simplified version)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format',
    }
  }

  // Additional checks
  const parts = email.split('@')
  if (parts.length !== 2) {
    return {
      isValid: false,
      error: 'Invalid email format',
    }
  }

  const [localPart, domain] = parts

  if (localPart.length === 0 || localPart.length > 64) {
    return {
      isValid: false,
      error: 'Invalid email format',
    }
  }

  if (domain.length === 0 || domain.length > 253) {
    return {
      isValid: false,
      error: 'Invalid email format',
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Validate Password Strength
 * Ensures password meets minimum security requirements
 *
 * Requirements:
 * - Minimum 8 characters
 * - Maximum 128 characters
 * - At least one letter (for better security, can add more rules)
 *
 * @param password - Password to validate
 * @returns ValidationResult with isValid flag and error message
 *
 * Example:
 * const result = validatePassword('mySecurePass123')
 * if (!result.isValid) {
 *   console.error(result.error)
 * }
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return {
      isValid: false,
      error: 'Password is required',
    }
  }

  if (typeof password !== 'string') {
    return {
      isValid: false,
      error: 'Password must be a string',
    }
  }

  // Minimum length check
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
    }
  }

  // Maximum length check (prevents DoS attacks)
  if (password.length > 128) {
    return {
      isValid: false,
      error: 'Password is too long (max 128 characters)',
    }
  }

  // Check for at least one letter (helps prevent pure number passwords)
  const hasLetter = /[a-zA-Z]/.test(password)
  if (!hasLetter) {
    return {
      isValid: false,
      error: 'Password must contain at least one letter',
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Validate Name (Optional Field)
 * If provided, name should be reasonable
 *
 * @param name - Name to validate (can be undefined for optional)
 * @returns ValidationResult with isValid flag and error message
 */
export function validateName(name: string | undefined): ValidationResult {
  // Name is optional, so undefined is valid
  if (name === undefined || name === null || name === '') {
    return {
      isValid: true,
    }
  }

  if (typeof name !== 'string') {
    return {
      isValid: false,
      error: 'Name must be a string',
    }
  }

  // Trim whitespace
  name = name.trim()

  // Minimum length if provided
  if (name.length < 1) {
    return {
      isValid: true, // Empty after trim is okay (treated as not provided)
    }
  }

  // Maximum length
  if (name.length > 100) {
    return {
      isValid: false,
      error: 'Name is too long (max 100 characters)',
    }
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/
  if (!nameRegex.test(name)) {
    return {
      isValid: false,
      error: 'Name contains invalid characters',
    }
  }

  return {
    isValid: true,
  }
}

/**
 * Validate Signup Data
 * Validates all required fields for user signup
 *
 * @param data - Signup data object
 * @returns ValidationResult with combined validation
 */
export interface SignupData {
  email: string
  password: string
  name?: string
}

export function validateSignupData(data: SignupData): ValidationResult {
  // Validate email
  const emailResult = validateEmail(data.email)
  if (!emailResult.isValid) {
    return emailResult
  }

  // Validate password
  const passwordResult = validatePassword(data.password)
  if (!passwordResult.isValid) {
    return passwordResult
  }

  // Validate name (if provided)
  const nameResult = validateName(data.name)
  if (!nameResult.isValid) {
    return nameResult
  }

  return {
    isValid: true,
  }
}

/**
 * Validate Login Data
 * Validates required fields for user login
 *
 * @param data - Login data object
 * @returns ValidationResult with combined validation
 */
export interface LoginData {
  email: string
  password: string
}

export function validateLoginData(data: LoginData): ValidationResult {
  // Validate email
  const emailResult = validateEmail(data.email)
  if (!emailResult.isValid) {
    return emailResult
  }

  // For login, we just check password is provided (not strength)
  if (!data.password) {
    return {
      isValid: false,
      error: 'Password is required',
    }
  }

  return {
    isValid: true,
  }
}
