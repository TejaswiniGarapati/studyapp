import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Upload,
  Trash2,
  Check,
  Camera,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';

interface ProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, updateProfileAvatar } = useApp();

  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatarUrl || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type: JPG, JPEG, PNG, WEBP
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    // Validate size (max 4MB)
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg('Image size exceeds 4MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfileAvatar(previewUrl);
    onClose();
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    updateProfileAvatar(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs select-none">
      <div className="bg-white dark:bg-[#1a1f22] border border-stone-200 dark:border-stone-800 rounded-[28px] max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FFE7CE] text-[#FF936B] flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#303030] dark:text-stone-100 font-heading">
                Custom Profile Picture
              </h3>
              <p className="text-[11px] text-stone-500">
                Upload a custom photo from your device
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Circular Avatar Preview */}
        <div className="py-6 flex flex-col items-center justify-center">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-[#FFD6C2] dark:ring-[#FFA45F]/30 bg-gradient-to-br from-[#FFB9B5] to-[#FFD6C2] shadow-md flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-white font-heading">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Quick change camera overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[11px] font-semibold"
            >
              <Camera className="w-5 h-5" />
              <span>Change</span>
            </button>
          </div>

          <p className="mt-3 text-xs font-semibold text-stone-700 dark:text-stone-300">
            {profile.name}
          </p>
          <p className="text-[11px] text-stone-400">
            JPG, PNG, or WEBP (Max 4MB)
          </p>

          {errorMsg && (
            <div className="mt-3 p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-900">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Action Buttons */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 rounded-full transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-[#FF936B]" />
              <span>Choose Photo</span>
            </button>

            {previewUrl && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 text-stone-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                title="Remove photo & use default avatar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-[#FF936B] hover:bg-[#ff8454] text-white text-xs font-bold rounded-full shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
