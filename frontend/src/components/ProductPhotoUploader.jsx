import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Star, ImagePlus, Info } from 'lucide-react';
const MAX_PHOTOS = 5;
const MAX_SIZE_MB = 5;
function ProductPhotoUploader({ images, onChange }) {
  const fileInputRef = useRef(null);
  const [draggingSlot, setDraggingSlot] = useState(null);
  const [pendingSlot, setPendingSlot] = useState(null);
  const openPicker = (slotIndex) => {
    setPendingSlot(slotIndex);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };
  // images: array of { url, file? }.
  //   - `url` is what gets rendered (a local blob: preview for a freshly
  //     picked file, or the real Cloudinary URL for an image the product
  //     already has, when editing).
  //   - `file` is the actual File object, only present for newly picked
  //     photos — this is what gets appended to the FormData sent to the
  //     backend. Existing (already-saved) images have no `file`, since
  //     there's nothing new to upload for them.
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || pendingSlot === null) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return;
    const entry = { url: URL.createObjectURL(file), file };
    const next = [...images];
    if (pendingSlot < next.length) {
      next[pendingSlot] = entry;
    } else {
      while (next.length < pendingSlot) next.push(null);
      next.push(entry);
    }
    onChange(next.filter(Boolean));
    setPendingSlot(null);
  };
  const removeImage = (e, index) => {
    e.stopPropagation();
    const next = images.filter((_, i) => i !== index);
    onChange(next);
  };
  const handleDrop = (e, slotIndex) => {
    e.preventDefault();
    setDraggingSlot(null);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return;
    const entry = { url: URL.createObjectURL(file), file };
    const next = [...images];
    if (slotIndex < next.length) {
      next[slotIndex] = entry;
    } else {
      next.push(entry);
    }
    onChange(next.filter(Boolean));
  };
  const slots = Array.from({ length: MAX_PHOTOS }, (_, i) => images[i]?.url || null);
  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Instructions banner */}
      <div
        className="flex items-start gap-2.5 p-3 rounded-xl mb-4"
        style={{ backgroundColor: '#f2efe3', border: '1px solid #ded5bd' }}
      >
        <Info size={14} className="text-[#c98a2b] shrink-0 mt-0.5" />
        <div>
          <p
            className="text-xs font-semibold text-[#211d15]"
            style={{ fontFamily: 'Inter,sans-serif' }}
          >
            Up to 5 product photos · First photo is the cover shown to buyers
          </p>
          <p
            className="text-[11px] text-[#8a7f6a] mt-0.5"
            style={{ fontFamily: 'Inter,sans-serif' }}
          >
            JPG, PNG or WEBP · Max 5 MB each · Minimum 400×400 px recommended
          </p>
        </div>
      </div>

      {/* Slot grid: slot 0 is large (cover), slots 1–4 are smaller */}
      <div className="grid grid-cols-4 gap-2.5" style={{ gridTemplateRows: 'auto auto' }}>
        {/* Cover photo — spans 2 rows, 2 cols */}
        <div className="col-span-2 row-span-2" style={{ minHeight: 220 }}>
          <PhotoSlot
            image={slots[0]}
            index={0}
            isCover
            isDragging={draggingSlot === 0}
            onDragOver={(e) => {
              e.preventDefault();
              setDraggingSlot(0);
            }}
            onDragLeave={() => setDraggingSlot(null)}
            onDrop={(e) => handleDrop(e, 0)}
            onClick={() => openPicker(0)}
            onRemove={(e) => removeImage(e, 0)}
          />
        </div>

        {/* Slots 1–4 in a 2×2 grid on the right */}
        {[1, 2, 3, 4].map((i) => (
          <PhotoSlot
            key={i}
            image={slots[i]}
            index={i}
            isCover={false}
            isDragging={draggingSlot === i}
            onDragOver={(e) => {
              e.preventDefault();
              setDraggingSlot(i);
            }}
            onDragLeave={() => setDraggingSlot(null)}
            onDrop={(e) => handleDrop(e, i)}
            onClick={() => openPicker(i)}
            onRemove={(e) => removeImage(e, i)}
          />
        ))}
      </div>

      {/* Photo count indicator */}
      <div className="mt-2.5 flex items-center justify-between">
        <div className="flex gap-1">
          {slots.map((img, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-colors"
              style={{ backgroundColor: img ? '#1f3b2c' : '#ded5bd' }}
            />
          ))}
        </div>
        <p className="text-[11px] text-[#9a9080]" style={{ fontFamily: 'Inter,sans-serif' }}>
          {images.length} / {MAX_PHOTOS} photos added
        </p>
      </div>
    </div>
  );
}
function PhotoSlot({
  image,
  index,
  isCover,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  onRemove,
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="relative rounded-xl overflow-hidden cursor-pointer transition-all"
      style={{
        height: isCover ? '100%' : 100,
        minHeight: isCover ? 220 : 100,
        border: isDragging
          ? '2px dashed #c98a2b'
          : image
            ? '2px solid #ded5bd'
            : '2px dashed #d4ccb8',
        backgroundColor: isDragging ? 'rgba(201,138,43,0.05)' : image ? 'transparent' : '#faf7f0',
      }}
    >
      <AnimatePresence mode="wait">
        {image ? (
          <motion.div
            key="filled"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            <img
              src={image}
              alt={`Product photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/25 transition-all flex items-center justify-center group">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow">
                  <Upload size={14} className="text-[#1f3b2c]" />
                </div>
              </div>
            </div>
            {/* Remove button */}
            <button
              onClick={onRemove}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 flex items-center justify-center transition-colors z-10"
            >
              <X size={11} className="text-white" />
            </button>
            {/* Cover badge */}
            {isCover && (
              <div
                className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-white"
                style={{ backgroundColor: 'rgba(31,59,44,0.85)', fontFamily: 'Inter,sans-serif' }}
              >
                <Star size={9} className="text-[#c98a2b]" fill="#c98a2b" /> Cover
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2"
          >
            {isCover ? (
              <>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-1"
                  style={{ backgroundColor: '#f0ece0' }}
                >
                  <ImagePlus size={20} className="text-[#c98a2b]" />
                </div>
                <p
                  className="text-xs font-bold text-[#211d15] text-center"
                  style={{ fontFamily: 'Inter,sans-serif' }}
                >
                  Add Cover Photo
                </p>
                <p
                  className="text-[10px] text-[#9a9080] text-center"
                  style={{ fontFamily: 'Inter,sans-serif' }}
                >
                  Drag & drop or click to upload
                </p>
                <div
                  className="mt-1.5 px-3 py-1 rounded-full text-[10px] font-semibold text-white"
                  style={{ backgroundColor: '#1f3b2c', fontFamily: 'Inter,sans-serif' }}
                >
                  Browse
                </div>
              </>
            ) : (
              <>
                <ImagePlus size={16} className="text-[#c0b89e]" />
                <p
                  className="text-[10px] text-[#b0a890] text-center font-medium"
                  style={{ fontFamily: 'Inter,sans-serif' }}
                >
                  Photo {index + 1}
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
export { ProductPhotoUploader };
