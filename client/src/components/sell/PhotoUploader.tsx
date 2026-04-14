import { useRef } from 'react'
import { Upload, X, Image } from 'lucide-react'
import styles from './PhotoUploader.module.css'

interface PhotoUploaderProps {
  photos: File[]
  onChange: (photos: File[]) => void
  maxPhotos?: number
}

const MAX = 5

export default function PhotoUploader({ photos, onChange, maxPhotos = MAX }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const incoming = Array.from(files).filter(f => f.type.startsWith('image/'))
    const combined = [...photos, ...incoming].slice(0, maxPhotos)
    onChange(combined)
  }

  function remove(idx: number) {
    onChange(photos.filter((_, i) => i !== idx))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  const canAdd = photos.length < maxPhotos

  return (
    <div className={styles.wrapper}>
      {/* Drop zone */}
      {canAdd && (
        <button
          type="button"
          className={styles.dropZone}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          aria-label="Upload photos"
        >
          <Upload size={20} className={styles.uploadIcon} aria-hidden="true" />
          <span className={styles.dropLabel}>
            Click to upload or drag & drop
          </span>
          <span className={styles.dropHint}>
            Up to {maxPhotos} photos · JPG, PNG, WEBP
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className={styles.hiddenInput}
            onChange={e => handleFiles(e.target.files)}
          />
        </button>
      )}

      {/* Previews */}
      {photos.length > 0 && (
        <div className={styles.previews}>
          {photos.map((file, i) => {
            const url = URL.createObjectURL(file)
            return (
              <div key={i} className={styles.preview}>
                <img
                  src={url}
                  alt={`Photo ${i + 1}`}
                  className={styles.previewImg}
                  onLoad={() => URL.revokeObjectURL(url)}
                />
                {i === 0 && <span className={styles.coverBadge}>Cover</span>}
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => remove(i)}
                  aria-label={`Remove photo ${i + 1}`}
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </div>
            )
          })}
          {canAdd && (
            <button
              type="button"
              className={styles.addMore}
              onClick={() => inputRef.current?.click()}
              aria-label="Add more photos"
            >
              <Image size={18} aria-hidden="true" />
              <span>Add more</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
