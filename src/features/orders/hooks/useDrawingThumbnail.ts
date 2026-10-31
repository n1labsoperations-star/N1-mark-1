import { useEffect, useState } from 'react';
import type { Attachment } from '../../../shared/types';
import { drawingThumbnail } from '../drawingStamp';

// Thumbnails by file id: a stored drawing is downloaded and drawn once.
const thumbnails = new Map<string, Promise<string | null>>();

// A failed download (a network blip, an expired session) is tried again
// once, then forgotten so the next view retries instead of keeping the
// placeholder for the rest of the session.
function thumbnailOf(doc: Attachment) {
  let thumbnail = thumbnails.get(doc.id);
  if (!thumbnail) {
    thumbnail = drawingThumbnail(doc)
      .catch(() => drawingThumbnail(doc))
      .catch(() => {
        thumbnails.delete(doc.id);
        return null;
      });
    thumbnails.set(doc.id, thumbnail);
  }
  return thumbnail;
}

/**
 * The drawing's first page as an image, once drawn; null until then, and
 * for files that can't be drawn (the placeholder shows instead).
 */
export function useDrawingThumbnail(doc: Attachment | undefined) {
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    setUri(null);
    if (!doc) {
      return;
    }
    let current = true;
    thumbnailOf(doc).then(next => current && setUri(next));
    return () => {
      current = false;
    };
  }, [doc]);
  return uri;
}
