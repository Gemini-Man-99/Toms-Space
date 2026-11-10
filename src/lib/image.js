/**
 * Reads an image file and returns a downscaled JPEG data URL (max 1400px on the
 * long side). Screenshots are often several MB; this keeps stored entries small
 * and the library fast.
 */
export async function imageToDataUrl(file, maxSize = 1400, quality = 0.86) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Not an image');
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  // JPEG has no transparency, so paint a backdrop first
  context.fillStyle = '#f8f4e9';
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return canvas.toDataURL('image/jpeg', quality);
}
