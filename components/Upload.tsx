import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useOutletContext } from "react-router";
import {
  PROGRESS_INTERVAL_MS,
  PROGRESS_STEP,
  REDIRECT_DELAY_MS,
} from "../lib/constants";

interface UploadProps {
  onComplete?: (base64Data: string) => void;
}
const Upload: React.FC<UploadProps> = ({ onComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);  
  const [progress, setProgress] = useState(0);

  const { isSignedIn } = useOutletContext<AuthContext>();

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) return;

    setFile(selectedFile);
    setProgress(0);

    const reader = new FileReader();

    reader.onerror = () => {
        setFile(null);
        setProgress(0);
    };

    reader.onload = () => {
      const base64 = reader.result as string;

      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + PROGRESS_STEP;

          if (next >= 100) {
            clearInterval(interval);

            setTimeout(() => {
              console.log("DONE → send to API", base64);
            }, REDIRECT_DELAY_MS);

            return 100;
          }

          return next;
        });
      }, PROGRESS_INTERVAL_MS);
    };

    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="upload">
      {!file ? (
        <div
          className={`dropzone${isDragging ? " is-dragging" : ""}`}
          onDragOver={(e) => {
            e.preventDefault(); 
            if (!isSignedIn) return;
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault(); 
            if (!isSignedIn) return;

            setIsDragging(false);

            const droppedFile = e.dataTransfer.files?.[0];
            const allowedTypes = ["image/jpeg", "image/png"];
            
            if (droppedFile && allowedTypes.includes(droppedFile.type)) {
                processFile(droppedFile);
          }}
        }
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg,.jpeg,.png"
            disabled={!isSignedIn}
            onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) processFile(selectedFile);
            }}
          />
          <div className="drop-content">
            <div className="drop-icon">
              <UploadIcon size={20} />
            </div>
            <p>
              {isSignedIn
                ? "Click to upload or drag and drop"
                : "Sign in or sign up with Puter to upload"}
            </p>
            <p className="help">
              Maximum file size: 10MB. Supported formats: JPG, PNG.
            </p>
          </div>
        </div>
      ) : (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image " />
              )}
            </div>
            <h3> {file.name} </h3>
            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />

              <p className="status-text">
                {progress < 100 ? "Uploading..." : "Redirecting..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload
