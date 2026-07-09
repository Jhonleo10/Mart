"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadFolder } from "@/lib/uploads/local";
import { preferLocalFileUploads } from "@/lib/uploads/strategy";

export interface ShowcaseSlot {
  id: string;
  url: string;
  uploading?: boolean;
}

const MAX_SLOTS = 10;

let slotCounter = 0;
function newSlot(url = ""): ShowcaseSlot {
  slotCounter += 1;
  return { id: `showcase-${slotCounter}`, url };
}

function isValidImageRef(url: string) {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/uploads/")
  );
}

interface VisualShowcaseFieldProps {
  slots: ShowcaseSlot[];
  onChange: (slots: ShowcaseSlot[]) => void;
  minSlots?: number;
  uploadFolder?: UploadFolder;
  className?: string;
}

export function VisualShowcaseField({
  slots,
  onChange,
  minSlots = 2,
  uploadFolder = "products",
  className,
}: VisualShowcaseFieldProps) {
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const slotsRef = useRef(slots);
  slotsRef.current = slots;
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const { startUpload } = useUploadThing("productImages", {
    onUploadError: (err) => {
      const message = err.message.includes("Invalid token")
        ? "Upload not configured. Add UPLOADTHING_TOKEN in Vercel env (UploadThing dashboard → API Keys → V7)."
        : err.message;
      toast.error(`Upload failed: ${message}`);
    },
  });

  const patchSlots = useCallback(
    (patcher: (current: ShowcaseSlot[]) => ShowcaseSlot[]) => {
      onChange(patcher(slotsRef.current));
    },
    [onChange],
  );

  const addSlot = () => {
    if (slotsRef.current.length >= MAX_SLOTS) {
      toast.error(`Maximum ${MAX_SLOTS} screenshots allowed`);
      return;
    }
    patchSlots((current) => [...current, newSlot()]);
  };

  const removeSlot = (id: string) => {
    if (slotsRef.current.length <= minSlots) {
      toast.error(`At least ${minSlots} screenshot slots are required`);
      return;
    }
    patchSlots((current) => current.filter((s) => s.id !== id));
  };

  const uploadFile = useCallback(
    async (id: string, file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }

      patchSlots((current) =>
        current.map((s) => (s.id === id ? { ...s, uploading: true } : s)),
      );

      try {
        let url: string | undefined;

        if (preferLocalFileUploads()) {
          const body = new FormData();
          body.append("file", file);
          body.append("folder", uploadFolder);

          const res = await fetch("/api/upload", { method: "POST", body });
          const data = (await res.json()) as { url?: string; error?: string };

          if (!res.ok || !data.url) {
            throw new Error(data.error ?? "Upload failed");
          }
          url = data.url;
        } else {
          const results = await startUpload([file]);
          url = results?.[0]?.ufsUrl ?? results?.[0]?.url;
          if (!url) {
            throw new Error("Upload failed — no URL returned");
          }
        }

        patchSlots((current) =>
          current.map((s) =>
            s.id === id ? { ...s, url: url!, uploading: false } : s,
          ),
        );
        toast.success("Image uploaded");
      } catch (err) {
        patchSlots((current) =>
          current.map((s) => (s.id === id ? { ...s, uploading: false } : s)),
        );
        toast.error(err instanceof Error ? err.message : "Upload failed");
      }
    },
    [patchSlots, startUpload, uploadFolder],
  );

  return (
    <div
      className={cn(
        "group rounded-3xl border border-slate-200 bg-white p-1 shadow-sm transition-all hover:shadow-md",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-[22px] bg-indigo-50/50 px-6 py-5 sm:px-8 sm:py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 ring-4 ring-indigo-50">
            <ImagePlus className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-none text-slate-900">Visual Showcase</h2>
            <p className="mt-1.5 text-sm font-medium text-slate-500">
              {preferLocalFileUploads()
                ? "Upload screenshots — stored in public/uploads (local dev)"
                : "Upload product screenshots — stored in cloud (UploadThing)"}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSlot}
          disabled={slots.length >= MAX_SLOTS}
          className="h-10 rounded-xl border-indigo-200 bg-white text-indigo-600 hover:bg-indigo-50"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add screenshot
        </Button>
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
        {slots.map((item, index) => {
          const isOver = dragOverId === item.id;
          const hasPreview = Boolean(item.url);

          return (
            <div key={item.id} className="group/slot flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Screenshot {index + 1}
                  {index === 0 ? <span className="ml-2 text-brand-blue">● Featured</span> : null}
                </span>
                {slots.length > minSlots ? (
                  <button
                    type="button"
                    onClick={() => removeSlot(item.id)}
                    className="text-slate-300 transition-colors hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverId(item.id);
                }}
                onDragLeave={() => setDragOverId(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverId(null);
                  const file = e.dataTransfer.files[0];
                  if (file) void uploadFile(item.id, file);
                }}
                className={cn(
                  "relative aspect-[16/10] overflow-hidden rounded-2xl border-2 shadow-inner transition-all duration-300",
                  isOver
                    ? "scale-[0.99] border-brand-blue bg-blue-50/50 ring-8 ring-brand-blue/5"
                    : hasPreview
                      ? "border-slate-100 bg-slate-50"
                      : "border-dashed border-slate-300 bg-slate-50/50 hover:border-brand-blue/30 hover:bg-white",
                )}
              >
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                  ref={(el) => {
                    fileInputRefs.current[item.id] = el;
                  }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadFile(item.id, file);
                    e.target.value = "";
                  }}
                />

                {hasPreview ? (
                  <>
                    <img
                      src={item.url}
                      alt={`Screenshot ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {item.uploading ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                      </div>
                    ) : null}
                    <button
                      type="button"
                      onClick={() =>
                        patchSlots((current) =>
                          current.map((s) => (s.id === item.id ? { ...s, url: "" } : s)),
                        )
                      }
                      className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-600 opacity-0 shadow-lg transition-all hover:bg-red-50 hover:text-red-600 group-hover/slot:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={item.uploading}
                    onClick={() => fileInputRefs.current[item.id]?.click()}
                    className="flex h-full w-full flex-col items-center justify-center px-4"
                  >
                    {item.uploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
                    ) : (
                      <>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                          <Upload className="h-7 w-7 text-slate-400" />
                        </div>
                        <p className="mt-4 text-sm font-bold text-slate-700">Upload image</p>
                        <p className="mt-1 text-xs font-medium text-slate-400">
                          Drop or click — JPG, PNG, WebP
                        </p>
                      </>
                    )}
                  </button>
                )}
              </div>

              <Input
                value={item.url}
                onChange={(e) =>
                  patchSlots((current) =>
                    current.map((s) =>
                      s.id === item.id ? { ...s, url: e.target.value } : s,
                    ),
                  )
                }
                className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-xs focus:bg-white"
                placeholder="Or paste image URL (https://...)"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function createDefaultShowcaseSlots(
  count = 2,
  existingUrls: string[] = [],
): ShowcaseSlot[] {
  if (existingUrls.length > 0) {
    const slots = existingUrls.map((url) => newSlot(url));
    while (slots.length < count) {
      slots.push(newSlot());
    }
    return slots;
  }
  return Array.from({ length: count }, () => newSlot());
}

export function showcaseUrls(slots: ShowcaseSlot[]): string[] {
  return slots.map((s) => s.url.trim()).filter(isValidImageRef);
}

export function hasShowcaseImage(slots: ShowcaseSlot[]): boolean {
  return slots.some((s) => isValidImageRef(s.url.trim()));
}
