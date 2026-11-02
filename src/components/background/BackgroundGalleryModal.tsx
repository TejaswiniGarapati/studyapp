import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  OFFICIAL_BACKGROUNDS,
  EXPLORE_BACKGROUNDS,
  DEFAULT_BACKGROUND_CONFIG,
} from '../../data/backgroundsData';
import {
  BackgroundConfig,
  BackgroundOption,
  BackgroundCategory,
  CustomBackground,
} from '../../types';
import {
  X,
  Check,
  Heart,
  Upload,
  Trash2,
  Search,
  Sparkles,
  Sliders,
  Sun,
  Eye,
  RefreshCw,
  Layers,
  Image as ImageIcon,
  AlertCircle,
  FolderHeart,
  Compass,
  Palette,
  Maximize2,
} from 'lucide-react';

interface BackgroundGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'collection' | 'explore' | 'uploads';

export const BackgroundGalleryModal: React.FC<BackgroundGalleryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    backgroundConfig,
    applyBackground,
    customBackgrounds,
    addCustomBackground,
    deleteCustomBackground,
    favoriteBackgroundIds,
    toggleFavoriteBackground,
    resetBackgroundToDefault,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('collection');
  const [selectedCategory, setSelectedCategory] = useState<BackgroundCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Draft config being edited in the modal
  const [draftConfig, setDraftConfig] = useState<BackgroundConfig>(backgroundConfig);

  // Sync draft when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setDraftConfig(backgroundConfig);
      setUploadError(null);
      setConfirmDeleteId(null);
    }
  }, [isOpen, backgroundConfig]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories list for the Official Collection
  const categories: BackgroundCategory[] = [
    'All',
    'Nature & Landscapes',
    'Sky & Sunset',
    'Aesthetic Study',
    'Floral & Botanical',
    'Abstract & Pastel',
  ];

  // Filtered official backgrounds
  const filteredOfficial = useMemo(() => {
    return OFFICIAL_BACKGROUNDS.filter((bg) => {
      const matchesCategory =
        selectedCategory === 'All' || bg.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        bg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bg.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Filtered explore backgrounds
  const filteredExplore = useMemo(() => {
    return EXPLORE_BACKGROUNDS.filter((bg) => {
      const matchesCategory =
        selectedCategory === 'All' || bg.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        bg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bg.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  // Handle selecting an official or explore background
  const handleSelectOption = (opt: BackgroundOption, type: 'official' | 'explore') => {
    setDraftConfig((prev) => ({
      ...prev,
      type,
      id: opt.id,
      title: opt.title,
      url: opt.url,
      fallbackGradient: opt.fallbackGradient,
    }));
  };

  // Handle selecting a custom background
  const handleSelectCustom = (custom: CustomBackground) => {
    setDraftConfig((prev) => ({
      ...prev,
      type: 'custom',
      id: custom.id,
      title: custom.title,
      url: custom.url,
      fallbackGradient: 'linear-gradient(135deg, #FFD6C2 0%, #FFB9B5 100%)',
    }));
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    if (!validFormats.includes(file.type)) {
      setUploadError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    if (file.size > maxSizeBytes) {
      setUploadError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.`);
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setIsUploading(false);
      if (typeof reader.result === 'string') {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
        const format = (['jpg', 'jpeg', 'png', 'webp'].includes(ext)
          ? ext
          : 'png') as 'jpg' | 'jpeg' | 'png' | 'webp';

        const created = addCustomBackground({
          title: file.name.replace(/\.[^/.]+$/, ''),
          dataUrl: reader.result,
          size: file.size,
          format,
        });

        // Automatically select the newly uploaded image
        handleSelectCustom(created);
        setActiveTab('uploads');
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      setUploadError('Failed to read the image file. Please try again.');
    };
    reader.readAsDataURL(file);

    // Reset input value so the same file can be re-uploaded if needed
    e.target.value = '';
  };

  // Save changes
  const handleApply = () => {
    applyBackground(draftConfig);
    onClose();
  };

  // Reset to default signature gradient
  const handleResetToDefault = () => {
    setDraftConfig(DEFAULT_BACKGROUND_CONFIG);
  };

  // Helper for computing overlay background color based on tint & opacity
  const getOverlayBackground = (tint: BackgroundConfig['overlayTint'], opacity: number) => {
    const alpha = (opacity / 100).toFixed(2);
    switch (tint) {
      case 'white':
        return `rgba(255, 255, 255, ${alpha})`;
      case 'dark':
        return `rgba(18, 20, 24, ${alpha})`;
      case 'warm':
        return `rgba(255, 147, 107, ${alpha})`;
      default:
        return 'transparent';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div
        className="bg-white dark:bg-[#171b1e] rounded-3xl w-full max-w-5xl max-h-[92vh] shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col overflow-hidden text-stone-800 dark:text-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4 bg-gradient-to-r from-white via-[#FFF9F3] to-white dark:from-[#171b1e] dark:via-[#1e2327] dark:to-[#171b1e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFE4D6] dark:bg-[#34241d] text-[#FF936B] flex items-center justify-center shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-heading text-stone-900 dark:text-stone-100">
                  Background Gallery & Personalization
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEDE3] text-[#FF936B] border border-[#FFD6C2]">
                  Live
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Choose from official collections, explore community wallpapers, or upload your own photo.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation & Search Bar */}
        <div className="px-5 sm:px-7 pt-3 pb-2 border-b border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/60 dark:bg-[#14181a]">
          {/* Main 3 Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 dark:bg-stone-800/80 rounded-2xl self-start">
            <button
              onClick={() => setActiveTab('collection')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'collection'
                  ? 'bg-white dark:bg-[#1e2327] text-[#FF936B] shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>FocusMate Collection</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-stone-100 dark:bg-stone-700 rounded-full font-mono">
                {OFFICIAL_BACKGROUNDS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'explore'
                  ? 'bg-white dark:bg-[#1e2327] text-[#FF936B] shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Gallery</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-stone-100 dark:bg-stone-700 rounded-full font-mono">
                {EXPLORE_BACKGROUNDS.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('uploads')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'uploads'
                  ? 'bg-white dark:bg-[#1e2327] text-[#FF936B] shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <FolderHeart className="w-3.5 h-3.5" />
              <span>My Uploads</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-stone-100 dark:bg-stone-700 rounded-full font-mono">
                {customBackgrounds.length}
              </span>
            </button>
          </div>

          {/* Search bar (active in collection & explore) */}
          {activeTab !== 'uploads' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by keywords or tag..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-[#1e2327] border border-stone-200 dark:border-stone-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#FF936B] text-stone-800 dark:text-stone-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Categories Chips (Shown for Collection & Explore) */}
        {activeTab !== 'uploads' && (
          <div className="px-5 sm:px-7 py-2.5 border-b border-stone-200/60 dark:border-stone-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#FF936B] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Modal Main Content: Left Gallery Grid + Right Adjustment Controls */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Grid Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* TAB 1: FOCUSMATE COLLECTION */}
            {activeTab === 'collection' && (
              <div>
                {/* Default Signature Gradient Tile */}
                <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-[#FFF5ED] via-[#FFF9F3] to-[#FFF0E6] dark:from-[#251d18] dark:to-[#1a1f22] border border-[#FFD6C2] dark:border-stone-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-12 rounded-xl shadow-xs border border-white/60 relative overflow-hidden flex-shrink-0"
                      style={{ background: DEFAULT_BACKGROUND_CONFIG.fallbackGradient }}
                    >
                      {draftConfig.type === 'default' && (
                        <div className="absolute inset-0 bg-[#FF936B]/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 dark:text-stone-100 font-heading">
                          FocusMate Warm Sunlight (Default)
                        </span>
                        <span className="px-1.5 py-0.5 bg-[#FF936B]/10 text-[#FF936B] text-[10px] rounded font-semibold">
                          Signature
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        The reference soft peach, apricot, warm pastel yellow & blush atmosphere.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleResetToDefault}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      draftConfig.type === 'default'
                        ? 'bg-[#58B98A] text-white shadow-xs'
                        : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-[#FF936B]'
                    }`}
                  >
                    {draftConfig.type === 'default' ? 'Active Default' : 'Select Default'}
                  </button>
                </div>

                {/* Grid of official items */}
                {filteredOfficial.length === 0 ? (
                  <div className="py-12 text-center text-stone-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-medium">No official backgrounds found for this filter.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filteredOfficial.map((item) => {
                      const isSelected = draftConfig.id === item.id;
                      const isFav = favoriteBackgroundIds.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectOption(item, 'official')}
                          className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? 'ring-2 ring-[#FF936B] border-transparent shadow-lg scale-[1.01]'
                              : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                          }`}
                        >
                          {/* Image preview with fallback gradient */}
                          <div
                            className="aspect-video w-full relative bg-cover bg-center overflow-hidden"
                            style={{
                              backgroundImage: `url(${item.thumbnailUrl})`,
                              backgroundColor: '#ebdcd3',
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

                            {/* Top row badges */}
                            <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-xs">
                                {item.category.split(' ')[0]}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavoriteBackground(item.id);
                                }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                  isFav
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/60'
                                }`}
                                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                              </button>
                            </div>

                            {/* Center selected badge */}
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#FF936B]/25 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-[#FF936B] text-white flex items-center justify-center shadow-lg">
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </div>
                              </div>
                            )}

                            {/* Bottom info */}
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-white text-xs font-bold truncate drop-shadow-xs">
                                {item.title}
                              </p>
                              {item.author && (
                                <p className="text-white/70 text-[9px] truncate">
                                  photo by {item.author}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: EXPLORE GALLERY */}
            {activeTab === 'explore' && (
              <div>
                <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50/60 to-teal-50/40 dark:from-emerald-950/20 dark:to-[#171b1e] border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-stone-100 font-heading">
                        Explore Aesthetic Student Wallpapers
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Curated study spaces, peaceful nature escapes, and inspiring atmospheric aesthetics.
                      </p>
                    </div>
                  </div>
                </div>

                {filteredExplore.length === 0 ? (
                  <div className="py-12 text-center text-stone-400">
                    <Compass className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-medium">No explore wallpapers found matching "{searchQuery}".</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filteredExplore.map((item) => {
                      const isSelected = draftConfig.id === item.id;
                      const isFav = favoriteBackgroundIds.includes(item.id);

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectOption(item, 'explore')}
                          className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected
                              ? 'ring-2 ring-[#FF936B] border-transparent shadow-lg scale-[1.01]'
                              : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                          }`}
                        >
                          <div
                            className="aspect-video w-full relative bg-cover bg-center overflow-hidden"
                            style={{
                              backgroundImage: `url(${item.thumbnailUrl})`,
                              backgroundColor: '#d8e2dc',
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

                            <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-xs">
                                {item.category.split(' ')[0]}
                              </span>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavoriteBackground(item.id);
                                }}
                                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                  isFav
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/60'
                                }`}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                              </button>
                            </div>

                            {isSelected && (
                              <div className="absolute inset-0 bg-[#FF936B]/25 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-[#FF936B] text-white flex items-center justify-center shadow-lg">
                                  <Check className="w-4 h-4 stroke-[3]" />
                                </div>
                              </div>
                            )}

                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-white text-xs font-bold truncate drop-shadow-xs">
                                {item.title}
                              </p>
                              {item.author && (
                                <p className="text-white/70 text-[9px] truncate">
                                  photo by {item.author}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MY UPLOADS */}
            {activeTab === 'uploads' && (
              <div className="space-y-4">
                {/* Upload Action Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#FFD6C2] hover:border-[#FF936B] dark:border-stone-700 dark:hover:border-[#FF936B] bg-[#FFF9F5] dark:bg-[#1a1f22] rounded-3xl p-6 text-center cursor-pointer transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <div className="w-12 h-12 rounded-2xl bg-[#FFE4D6] dark:bg-[#34241d] text-[#FF936B] mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-heading">
                    {isUploading ? 'Processing Image...' : 'Click or Drag & Drop to Upload Custom Wallpaper'}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                    Supported formats: <strong>JPG, PNG, WEBP</strong>. Max size: <strong>5MB</strong>.
                  </p>
                </div>

                {/* Upload Validation Error Notice */}
                {uploadError && (
                  <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Uploaded Backgrounds Grid */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-stone-700 dark:text-stone-300 font-heading">
                      Your Uploaded Backgrounds ({customBackgrounds.length})
                    </h4>
                    <span className="text-[11px] text-stone-400">
                      Saved to your account profile
                    </span>
                  </div>

                  {customBackgrounds.length === 0 ? (
                    <div className="py-10 text-center rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30">
                      <FolderHeart className="w-8 h-8 text-stone-400 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                        No custom wallpapers uploaded yet
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Upload your favorite study photos, anime landscapes, or motivational posters!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                      {customBackgrounds.map((custom) => {
                        const isSelected = draftConfig.id === custom.id;
                        const isFav = favoriteBackgroundIds.includes(custom.id);

                        return (
                          <div
                            key={custom.id}
                            onClick={() => handleSelectCustom(custom)}
                            className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 hover:shadow-md ${
                              isSelected
                                ? 'ring-2 ring-[#FF936B] border-transparent shadow-lg scale-[1.01]'
                                : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
                            }`}
                          >
                            <div
                              className="aspect-video w-full relative bg-cover bg-center overflow-hidden"
                              style={{ backgroundImage: `url(${custom.url})` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

                              {/* Top badges */}
                              <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-white uppercase">
                                  {custom.format} • {(custom.size / 1024).toFixed(0)}KB
                                </span>

                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavoriteBackground(custom.id);
                                    }}
                                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                                      isFav
                                        ? 'bg-rose-500 text-white'
                                        : 'bg-black/40 text-white/80 hover:text-white'
                                    }`}
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmDeleteId(custom.id);
                                    }}
                                    className="w-6 h-6 rounded-full bg-black/40 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                                    title="Delete custom wallpaper"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {isSelected && (
                                <div className="absolute inset-0 bg-[#FF936B]/25 flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-[#FF936B] text-white flex items-center justify-center shadow-lg">
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  </div>
                                </div>
                              )}

                              <div className="absolute bottom-2 left-2 right-2">
                                <p className="text-white text-xs font-bold truncate drop-shadow-xs">
                                  {custom.title}
                                </p>
                              </div>
                            </div>

                            {/* Confirm Delete Overlay */}
                            {confirmDeleteId === custom.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute inset-0 bg-stone-900/90 backdrop-blur-xs p-3 flex flex-col items-center justify-center text-center animate-fadeIn"
                              >
                                <p className="text-xs text-white font-bold mb-2">
                                  Delete this wallpaper?
                                </p>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      deleteCustomBackground(custom.id);
                                      setConfirmDeleteId(null);
                                    }}
                                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2.5 py-1 bg-stone-700 hover:bg-stone-600 text-stone-200 text-[11px] font-medium rounded-lg"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Appearance & Readability Controls */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-stone-200 dark:border-stone-800 p-4 sm:p-5 bg-stone-50/70 dark:bg-[#161a1d] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-heading font-bold text-xs uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-[#FF936B]" />
                <span>Appearance Controls</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDraftConfig((prev) => ({
                    ...prev,
                    brightness: 100,
                    blur: 0,
                    overlayOpacity: 0,
                    overlayTint: 'none',
                    imagePosition: 'center',
                    scaling: 'cover',
                  }))
                }
                className="text-[11px] text-stone-500 hover:text-[#FF936B] transition-colors"
                title="Reset sliders to standard values"
              >
                Reset Sliders
              </button>
            </div>

            {/* Interactive Live Mini-Preview of Dashboard readability */}
            <div>
              <span className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1.5 flex items-center justify-between">
                <span>Live View & Legibility Test</span>
                <span className="font-mono text-[10px] text-stone-400">
                  {draftConfig.type === 'default' ? 'Default Gradient' : draftConfig.title || 'Selected Image'}
                </span>
              </span>

              <div
                className="w-full h-28 rounded-2xl relative overflow-hidden shadow-inner border border-stone-300 dark:border-stone-700 flex items-center justify-center p-3"
                style={{
                  background:
                    draftConfig.type === 'default'
                      ? draftConfig.fallbackGradient
                      : draftConfig.url
                      ? `url(${draftConfig.url})`
                      : draftConfig.fallbackGradient,
                  backgroundPosition: draftConfig.imagePosition,
                  backgroundSize: draftConfig.scaling,
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {/* Simulated CSS Filters */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all"
                  style={{
                    backdropFilter: `blur(${draftConfig.blur}px)`,
                    filter: `brightness(${draftConfig.brightness}%)`,
                  }}
                />

                {/* Simulated Overlay Tint Layer */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all"
                  style={{
                    backgroundColor: getOverlayBackground(
                      draftConfig.overlayTint,
                      draftConfig.overlayOpacity
                    ),
                  }}
                />

                {/* Mini mock dashboard card */}
                <div className="relative z-10 w-full max-w-[200px] bg-white/92 dark:bg-[#15191c]/92 backdrop-blur-md rounded-xl p-2.5 shadow-md border border-white/70 dark:border-stone-700 text-center">
                  <p className="text-[11px] font-bold text-stone-900 dark:text-stone-100 font-heading truncate">
                    FocusMate Dashboard
                  </p>
                  <p className="text-[9px] text-stone-600 dark:text-stone-400 truncate">
                    {draftConfig.type === 'default'
                      ? 'Signature Sunlight Warmth'
                      : draftConfig.title || 'Custom Wallpaper'}
                  </p>
                </div>
              </div>
            </div>

            {/* Brightness Slider (50% - 150%) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Brightness</span>
                </span>
                <span className="font-mono text-[11px] text-stone-500">
                  {draftConfig.brightness}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="150"
                step="5"
                value={draftConfig.brightness}
                onChange={(e) =>
                  setDraftConfig((prev) => ({
                    ...prev,
                    brightness: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#FF936B]"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>Dim (50%)</span>
                <span>Normal (100%)</span>
                <span>Vibrant (150%)</span>
              </div>
            </div>

            {/* Blur Effect Slider (0px - 20px) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>Soft Blur (Focus Effect)</span>
                </span>
                <span className="font-mono text-[11px] text-stone-500">
                  {draftConfig.blur}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={draftConfig.blur}
                onChange={(e) =>
                  setDraftConfig((prev) => ({
                    ...prev,
                    blur: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#FF936B]"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>Sharp (0px)</span>
                <span>Subtle (5px)</span>
                <span>Dreamy (20px)</span>
              </div>
            </div>

            {/* Overlay Opacity Slider (0% - 80%) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  <span>Overlay Opacity</span>
                </span>
                <span className="font-mono text-[11px] text-stone-500">
                  {draftConfig.overlayOpacity}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={draftConfig.overlayOpacity}
                onChange={(e) =>
                  setDraftConfig((prev) => ({
                    ...prev,
                    overlayOpacity: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#FF936B]"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>None (0%)</span>
                <span>Soft (30%)</span>
                <span>Muted (80%)</span>
              </div>
            </div>

            {/* Overlay Tint Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-700 dark:text-stone-300">
                Overlay Tint
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                {[
                  { id: 'none', label: 'None', color: 'bg-stone-200 dark:bg-stone-700' },
                  { id: 'white', label: 'Soft Mist', color: 'bg-white border' },
                  { id: 'dark', label: 'Dark Slate', color: 'bg-stone-900 text-white' },
                  { id: 'warm', label: 'Warm Tint', color: 'bg-[#FF936B] text-white' },
                ].map((tint) => (
                  <button
                    key={tint.id}
                    type="button"
                    onClick={() =>
                      setDraftConfig((prev) => ({
                        ...prev,
                        overlayTint: tint.id as BackgroundConfig['overlayTint'],
                        // If selecting a tint for the first time while opacity is 0, give it a pleasant default
                        overlayOpacity:
                          prev.overlayOpacity === 0 && tint.id !== 'none'
                            ? 20
                            : prev.overlayOpacity,
                      }))
                    }
                    className={`py-1.5 px-1 rounded-xl font-medium text-center transition-all truncate ${
                      draftConfig.overlayTint === tint.id
                        ? 'ring-2 ring-[#FF936B] font-bold shadow-xs'
                        : 'opacity-70 hover:opacity-100'
                    } ${tint.color}`}
                  >
                    {tint.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position & Scaling options */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Position
                </label>
                <select
                  value={draftConfig.imagePosition}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      imagePosition: e.target.value as BackgroundConfig['imagePosition'],
                    }))
                  }
                  className="w-full px-2 py-1.5 bg-white dark:bg-[#1e2327] border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 focus:outline-none"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Scaling
                </label>
                <select
                  value={draftConfig.scaling}
                  onChange={(e) =>
                    setDraftConfig((prev) => ({
                      ...prev,
                      scaling: e.target.value as BackgroundConfig['scaling'],
                    }))
                  }
                  className="w-full px-2 py-1.5 bg-white dark:bg-[#1e2327] border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 focus:outline-none"
                >
                  <option value="cover">Cover (Fill Screen)</option>
                  <option value="contain">Contain (Fit Bounds)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 sm:px-7 py-3.5 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-[#171b1e] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="font-semibold text-stone-700 dark:text-stone-300">
              Selected: {draftConfig.title || 'FocusMate Warm Sunlight (Default)'}
            </span>
            {draftConfig.type !== 'default' && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-[#FF936B] hover:underline font-medium inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset to Default</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-[#FF936B] to-[#FF8550] hover:brightness-105 text-white text-xs font-bold shadow-md shadow-[#FF936B]/25 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Apply Background</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
