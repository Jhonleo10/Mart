import type { FormEvent } from "react";
import type { ZodType } from "zod";

/**
 * Must be called from onSubmit. Prevents default navigation and runs native
 * HTML5 validation (required, minLength, type=email, etc.).
 */
export function getValidatedForm(
  e: FormEvent<HTMLFormElement>,
): HTMLFormElement | null {
  e.preventDefault();
  const form = e.currentTarget;
  if (!form.reportValidity()) return null;
  return form;
}

export function formDataFromForm(form: HTMLFormElement): FormData {
  return new FormData(form);
}

export function parseFormWithSchema<T>(
  schema: ZodType<T>,
  formData: FormData,
): { success: true; data: T } | { success: false; error: string } {
  const result = parseFormFieldErrors(schema, formData);
  if (!result.success) {
    const firstKey = Object.keys(result.errors)[0];
    return { success: false, error: result.errors[firstKey] ?? "Invalid input" };
  }
  return { success: true, data: result.data };
}

function formDataToRawObject(formData: FormData): Record<string, unknown> {
  const raw: Record<string, unknown> = {};
  for (const key of new Set(formData.keys())) {
    const values = formData.getAll(key);
    raw[key] = values.length === 1 ? values[0] : values.map(String);
  }
  return raw;
}

export function parseFormFieldErrors<T>(
  schema: ZodType<T>,
  formData: FormData,
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const raw = formDataToRawObject(formData);
  const parsed = schema.safeParse(raw);
  if (parsed.success) {
    return { success: true, data: parsed.data };
  }

  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const key = issue.path[0]?.toString() ?? "_form";
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return { success: false, errors };
}
