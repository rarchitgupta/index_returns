"use client";

import React, { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemDelete,
} from "@/components/ui/file-upload";

const ALLOWED_TYPES = [".csv"];

async function uploadSources(filesToUpload: File[]) {
  const formData = new FormData();
  filesToUpload.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch("/api/sources", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Upload failed");
  }

  return response.json();
}

export function AddSourceDialog({
  onUploadSuccess,
}: {
  onUploadSuccess?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const uploadMutation = useMutation({
    mutationFn: uploadSources,
    onSuccess: () => {
      setFiles([]);
      setIsOpen(false);
      onUploadSuccess?.();
    },
  });

  const validateFile = (file: File) => {
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!ALLOWED_TYPES.includes(ext)) {
      return "Only CSV files are supported";
    }
    return null;
  };

  const handleUpload = () => {
    if (files.length === 0) return;
    uploadMutation.mutate(files);
  };

  const isLoading = uploadMutation.isPending;
  const error = uploadMutation.error;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
          + Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Source</DialogTitle>
          <DialogDescription>
            Download the template, fill it out in Excel, and upload it back to
            add a new source to your portfolio.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {/* Download Template Section */}
          <Button
            onClick={() => {
              const link = document.createElement("a");
              link.href = "/template.csv";
              link.download = "template.csv";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="w-full"
            disabled={isLoading}
          >
            Download Template
          </Button>

          {/* Upload Section */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-3">Upload CSV</p>
            <FileUpload
              value={files}
              onValueChange={setFiles}
              onFileValidate={validateFile}
              maxFiles={5}
              accept=".csv"
              disabled={isLoading}
              multiple
            >
              <FileUploadDropzone>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center rounded-full border p-2.5">
                    <Upload className="size-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">
                    Drag & drop CSV files here
                  </p>
                  <p className="text-xs text-muted-foreground">or</p>
                  <FileUploadTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isLoading}>
                      Browse files
                    </Button>
                  </FileUploadTrigger>
                </div>
              </FileUploadDropzone>
              <FileUploadList>
                {files.map((file) => (
                  <FileUploadItem key={file.name} value={file}>
                    <FileUploadItemPreview />
                    <FileUploadItemMetadata />
                    <FileUploadItemDelete asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        disabled={isLoading}
                      >
                        <X className="size-4" />
                      </Button>
                    </FileUploadItemDelete>
                  </FileUploadItem>
                ))}
              </FileUploadList>
            </FileUpload>
            {error && (
              <div className="mt-4 rounded-md bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error.message}</p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isLoading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
