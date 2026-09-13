/**
 * Shared shape for the auth forms.
 *
 * Kept out of actions.ts because a "use server" module may only export async
 * functions — a plain object export breaks the build.
 */
export type AuthFormState = {
  error: string | null;
  /** Set when the action succeeded but stays on the page (e.g. "email sent"). */
  done?: boolean;
  fieldErrors: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  /** Echoed back so a failed submit does not wipe what was typed. */
  values: {
    name?: string;
    email?: string;
  };
};

export const emptyAuthFormState: AuthFormState = {
  error: null,
  fieldErrors: {},
  values: {},
};
