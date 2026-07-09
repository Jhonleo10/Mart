"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { UploadFolder } from "@/lib/uploads/local";
import { preferLocalFileUploads } from "@/lib/uploads/strategy";

type UploadEndpoint = "companyLogo" | "productImages";

interface ImageUploadFieldProps {
  label: string;
  endpoint?: UploadEndpoint;
  uploadFolder?: UploadFolder;
  value: string;
  onChange: (url: string) => void;
  inputName?: string;
  hint?: string;
  className?: string;
}

export function ImageUploadField({
  label,
  endpoint = "companyLogo",
  uploadFolder,
  value,
  onChange,
  inputName = "logo",
  hint,
  className,
}: ImageUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [localUploading, setLocalUploading] = useState(false);
  const displayUrl = preview || value;

  const { startUpload, isUploading: isUploadThingUploading } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      const url = res[0]?.ufsUrl ?? res[0]?.url;
      if (url) {
        onChange(url);
        setPreview(null);
        toast.success("Image uploaded");
      }
    },
    onUploadError: (err) => {
      const message = err.message.includes("Invalid token")
        ? "Upload not configured. Add UPLOADTHING_TOKEN to .env (UploadThing dashboard → API Keys → V7)."
        : err.message;
      toast.error(`Upload failed: ${message}`);
      setPreview(null);
    },
  });

  const isUploading = localUploading || isUploadThingUploading;

  async function uploadLocally(file: File) {
    setLocalUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", uploadFolder ?? "companies");

      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Upload failed");
      }

      onChange(data.url);
      setPreview(null);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setPreview(null);
    } finally {
      setLocalUploading(false);
    }
  }

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    if (uploadFolder && preferLocalFileUploads()) {
      await uploadLocally(file);
      return;
    }

    const results = await startUpload([file]);
    const url = results?.[0]?.ufsUrl ?? results?.[0]?.url;
    if (url) {
      onChange(url);
      setPreview(null);
      toast.success("Image uploaded");
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div
          className={cn(
            "relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50",
            displayUrl && "border-solid border-slate-100",
          )}
        >
          {displayUrl ? (
            <>
              <Image src={displayUrl} alt="" fill className="object-cover" unoptimized />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setPreview(null);
                }}
                className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-slate-600 shadow hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isUploading}
              className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400 hover:text-brand-blue"
            >
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span className="text-[10px] font-semibold">Upload</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileRef.current?.click()}
            className="w-full sm:w-auto"
          >
            <ImagePlus className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Choose image"}
          </Button>
          <Input
            name={inputName}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            type="text"
            placeholder="Or paste image URL (https://... or /uploads/...)"
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
