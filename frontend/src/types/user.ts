import type { Profile } from "@/types/auth";

export type ManagedUser = Profile & {
  email: string | null;
};

export type UserFormState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};
