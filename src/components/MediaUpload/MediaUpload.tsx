import axios from "axios";
import { ImagePlus, Loader2 } from "lucide-react";
import { ChangeEvent, useState } from "react";

import { getApiURL } from "@/util/constants";

type MediaPurpose = "avatar" | "cover" | "chapter";

type Props = {
  purpose: MediaPurpose;
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
};

export default function MediaUpload({ purpose, value, onChange, label = "Upload image", required }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      body.append("purpose", purpose);
      const response = await axios.post<{ imageUrl: string }>(`${getApiURL()}/media/upload`, body, {
        headers: { },
      });
      onChange(response.data.imageUrl);
    } catch (uploadError) {
      const message = axios.isAxiosError(uploadError)
        ? uploadError.response?.data?.error || "Image upload failed"
        : "Image upload failed";
      setError(message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="mb-4 rounded-md border border-dashed p-4">
      <label className="flex cursor-pointer items-center gap-2 font-medium">
        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
        {uploading ? "Uploading and creating thumbnail..." : label}
        <input
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={uploading}
          required={required && !value}
          onChange={upload}
        />
      </label>
      <p className="mt-1 text-xs text-gray-500">JPEG, PNG, WebP, atau AVIF. Maksimum 8 MB.</p>
      {value && <img className="mt-3 max-h-48 rounded object-cover" src={value} alt="Upload preview" />}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
