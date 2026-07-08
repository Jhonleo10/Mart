"use client";

import { useCallback, useState } from "react";
import {
  ConfirmDialogUI,
  type ConfirmOptions,
  type ConfirmVariant,
} from "@/components/ui/confirm-dialog";

export type { ConfirmOptions, ConfirmVariant };

export function useConfirmDialog() {
  const [state, setState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ options, resolve });
    });
  }, []);

  function close(result: boolean) {
    state?.resolve(result);
    setState(null);
  }

  const confirmDialog = state ? (
    <ConfirmDialogUI
      open
      options={state.options}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  ) : null;

  return { confirm, confirmDialog };
}
