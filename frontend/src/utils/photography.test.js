import { describe, expect, it } from 'vitest';
import { buildPhotoPayload } from './photography';

describe('buildPhotoPayload', () => {
  it('trims and normalizes photo details for upload', () => {
    const payload = buildPhotoPayload({
      title: '  Sunset Over the Sea  ',
      caption: '  Golden hour by the coast  ',
      imageData: 'data:image/jpeg;base64,abc123',
      mimeType: 'image/jpeg',
    });

    expect(payload).toEqual({
      title: 'Sunset Over the Sea',
      caption: 'Golden hour by the coast',
      imageData: 'data:image/jpeg;base64,abc123',
      mimeType: 'image/jpeg',
    });
  });

  it('throws when no image data is provided', () => {
    expect(() => buildPhotoPayload({ title: 'Test', caption: 'Test' })).toThrow('Image is required');
  });
});
