export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters" };
  }
  return { valid: true };
}

export function validateGoalTitle(title: string): boolean {
  return title.trim().length > 0 && title.length <= 100;
}

export function validateCommitment(commitment: string): boolean {
  return commitment.trim().length > 0 && commitment.length <= 200;
}
