"use client";

import { useCallback, useState } from "react";
import type { ZodType } from "zod";
import { parseFormFieldErrors } from "@/lib/validations/form-submit";

export function useZodFormErrors<T>(schema: ZodType<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAll = useCallback(
    (formData: FormData, schemaOverride?: ZodType<T>): formData is FormData => {
      const activeSchema = schemaOverride ?? schema;
      const result = parseFormFieldErrors(activeSchema, formData);
      if (result.success) {
        setErrors({});
        return true;
      }
      setErrors(result.errors);
      return false;
    },
    [schema],
  );

  const validateField = useCallback(
    (form: HTMLFormElement, fieldName: string, schemaOverride?: ZodType<T>) => {
      const activeSchema = schemaOverride ?? schema;
      const result = parseFormFieldErrors(activeSchema, new FormData(form));
      if (result.success) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[fieldName];
          return next;
        });
        return;
      }
      const message = result.errors[fieldName];
      setErrors((prev) => {
        const next = { ...prev };
        if (message) next[fieldName] = message;
        else delete next[fieldName];
        return next;
      });
    },
    [schema],
  );

  const clearErrors = useCallback(() => setErrors({}), []);

  const fieldError = useCallback((name: string) => errors[name], [errors]);

  return { errors, fieldError, validateAll, validateField, clearErrors, setErrors };
}
