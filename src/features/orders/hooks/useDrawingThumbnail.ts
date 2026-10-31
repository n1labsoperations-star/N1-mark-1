import { useEffect, useState } from 'react';
import type { Attachment } from '../../../shared/types';
import { drawingThumbnail } from '../drawingStamp';

// Thumbnails by file and customer: a stored drawing is downloaded and drawn
// once for each customer whose details it blanks.
const thumbnails = new Map<string, Promise<string | null>>();

// A failed download (a network blip, an expired session) is tried again
// once, then forgotten so the next view retries instead of keeping the
// placeholder for the rest of the session.
function thumbnailOf(doc: Attachment, company: string) {
  const key = `${doc.id}\n${company}`;
  let thumbnail = thumbnails.get(key);
  if (!thumbnail) {
    thumbnail = drawingThumbnail(doc, company)
      .catch(() => drawingThumbnail(doc, company))
      .catch(() => {
        thumbnails.delete(key);
        return null;
      });
    thumbnails.set(key, thumbnail);
  }
  return thumbnail;
}

/**
 * The drawing's first page as an image, once drawn, with the customer's
 * (`company`) name, address and logo blanked; null until then, and for
 * files that can't be drawn (the placeholder shows instead).
 */
export function useDrawingThumbnail(
  doc: Attachment | undefined,
  company: string,
) {
  const [uri, setUri] = useState<string | null>(null);
  useEffect(() => {
    setUri(null);
    if (!doc) {
      return;
    }
    let current = true;
    thumbnailOf(doc, company).then(next => current && setUri(next));
    return () => {
      current = false;
    };
  }, [doc, company]);
  return uri;
}
