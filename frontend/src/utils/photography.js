export const buildPhotoPayload = ({ title, caption, imageData, mimeType }) => {
  const normalizedTitle = String(title || '').trim();
  const normalizedCaption = String(caption || '').trim();

  if (!imageData) {
    throw new Error('Image is required');
  }

  return {
    title: normalizedTitle,
    caption: normalizedCaption,
    imageData,
    mimeType: mimeType || 'image/jpeg',
  };
};
