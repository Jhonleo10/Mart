export const FORM_AUTOCOMPLETE = {
  email: "email",
  username: "username",
  name: "name",
  givenName: "given-name",
  familyName: "family-name",
  organization: "organization",
  tel: "tel",
  url: "url",
  currentPassword: "current-password",
  newPassword: "new-password",
  oneTimeCode: "one-time-code",
} as const;

const STORAGE_PREFIX = "dgm-form:";

export function loadFormDraft(formKey: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${formKey}`);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function saveFormDraft(formKey: string, data: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${formKey}`, JSON.stringify(data));
  } catch {
    /* quota */
  }
}

export function saveFormField(formKey: string, name: string, value: string) {
  const draft = loadFormDraft(formKey);
  draft[name] = value;
  saveFormDraft(formKey, draft);
}

export function clearFormDraft(formKey: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(`${STORAGE_PREFIX}${formKey}`);
}

/** Server/database values take priority over saved drafts. */
export function mergePrefillValues(
  server?: Record<string, string | undefined | null>,
  draft?: Record<string, string>,
): Record<string, string> {
  const merged: Record<string, string> = { ...draft };
  if (server) {
    for (const [key, value] of Object.entries(server)) {
      if (value != null && value !== "") merged[key] = String(value);
    }
  }
  return merged;
}
