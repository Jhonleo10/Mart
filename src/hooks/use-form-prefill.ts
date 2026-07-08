"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clearFormDraft,
  loadFormDraft,
  mergePrefillValues,
  saveFormDraft,
} from "@/lib/form-prefill";

export function useFormPrefill(
  formKey: string,
  serverDefaults?: Record<string, string | undefined | null>,
) {
  const [ready, setReady] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const draft = loadFormDraft(formKey);
    setValues(mergePrefillValues(serverDefaults, draft));
    setReady(true);
  }, [formKey]);

  const setField = useCallback(
    (name: string, value: string) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        saveFormDraft(formKey, next);
        return next;
      });
    },
    [formKey],
  );

  const bind = useCallback(
    (name: string) => ({
      name,
      id: name,
      value: values[name] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setField(name, e.target.value),
    }),
    [setField, values],
  );

  const clearDraft = useCallback(() => {
    clearFormDraft(formKey);
    setValues(mergePrefillValues(serverDefaults, {}));
  }, [formKey, serverDefaults]);

  return { ready, values, bind, setField, clearDraft, get: (name: string) => values[name] ?? "" };
}
