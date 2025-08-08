import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Loader2, FileUp, Share2 } from "lucide-react";
import useDrivePicker from "react-google-drive-picker";

const FileAttachmentPopup = ({ onUpload, isDisabled, fileLoading }) => {
  const fileInputRef = useRef(null);
  const [driveLoading, setDriveLoading] = useState(false);
  const [openPicker] = useDrivePicker();

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      onUpload(Array.from(e.target.files));
      e.target.value = ""; // Reset input
    }
  };

  const handleDriveSelect = async () => {
    try {
      setDriveLoading(true);

      openPicker({
        clientId: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID,
        developerKey: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY,
        viewId: "DOCS",
        showUploadView: true,
        showUploadFolders: true,
        supportDrives: true,
        multiselect: true,
        callbackFunction: (data) => {
          if (data.action === "picked") {
            const files = data.docs.map((file) => ({
              fileName: file.name,
              link: `https://drive.google.com/file/d/${file.id}/view`,
              mimeType: file.mimeType,
              size: file.sizeBytes,
              iconUrl: file.iconUrl,
            }));
            onUpload(files, true);
          }
          setDriveLoading(false);
        },
      });
    } catch (error) {
      console.error("Google Drive picker error:", error);
      setDriveLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isDisabled || fileLoading}
        className="flex-1 bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-800/30 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20"
      >
        {fileLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-violet-600" />
        ) : (
          <FileUp className="mr-2 h-4 w-4 text-violet-600" />
        )}
        Upload Local File
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={handleDriveSelect}
        disabled={isDisabled || driveLoading || fileLoading}
        className="flex-1 bg-white dark:bg-slate-900 border-violet-200 dark:border-violet-800/30 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20"
      >
        {driveLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-violet-600" />
        ) : (
          <Share2 className="mr-2 h-4 w-4 text-violet-600" />
        )}
        Google Drive
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
        disabled={isDisabled || fileLoading}
        multiple
      />
    </div>
  );
};

export default FileAttachmentPopup;
