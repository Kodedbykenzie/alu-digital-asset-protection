import { useRef, useState } from "react";
import { generateFileHash } from "../utils/hashFile";
import { getReadableError } from "../utils/formatters";

export default function FileUploader({
  label = "Choose an image file",
  onHashGenerated,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [hash, setHash] = useState("");
  const [error, setError] = useState("");
  const [isHashing, setIsHashing] = useState(false);

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    setError("");
    setHash("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    setFileName(file.name);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const nextPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(nextPreviewUrl);
    setIsHashing(true);

    try {
      const computedHash = await generateFileHash(file);
      setHash(computedHash);
      await onHashGenerated?.({ hash: computedHash, file });
    } catch (hashError) {
      setError(getReadableError(hashError));
    } finally {
      setIsHashing(false);
    }
  }

  return (
    <div className="file-uploader">
      <input
        ref={inputRef}
        className="sr-only"
        id="logo-file"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
      />

      <button
        type="button"
        className="upload-dropzone"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        <span className="upload-icon" aria-hidden="true">
          ↑
        </span>
        <strong>{label}</strong>
        <span>PNG, JPG, JPEG or WEBP</span>
      </button>

      {fileName ? <p className="selected-file">Selected: {fileName}</p> : null}

      {previewUrl ? (
        <div className="image-preview">
          <img src={previewUrl} alt="Selected logo preview" />
        </div>
      ) : null}

      {isHashing ? <p className="helper-text">Generating SHA-256 hash…</p> : null}

      {hash ? (
        <div className="hash-output">
          <span>Generated SHA-256 bytes32 hash</span>
          <code>{hash}</code>
        </div>
      ) : null}

      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
