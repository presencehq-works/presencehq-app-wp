// utils/validation.js

export function validatePassword(password) {
  // Must contain at least:
  // - 8 characters
  // - 1 uppercase
  // - 1 lowercase
  // - 1 number
  // - 1 special character (non-alphanumeric)
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

  return strongPasswordRegex.test(password);
}

