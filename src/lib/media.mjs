import { getImage } from 'astro:assets';

// Recipe media lives beside the content so it can move to another generator.
const files = import.meta.glob('/content/media/**/*.{png,jpg,jpeg,webp,avif}', { eager: true, import: 'default' });
export const mediaFile = src => files['/content/media/' + src];
export async function picture(src, width) {
  const file = mediaFile(src);
  if (!file) throw new Error(`Missing recipe media: ${src}`);
  const [small, large] = await Promise.all([
    getImage({ src: file, width: Math.min(width, file.width), format: 'webp' }),
    getImage({ src: file, width: Math.min(1600, file.width), format: 'webp' }),
  ]);
  return { src: small.src, width: small.attributes.width ?? small.options.width, height: small.attributes.height ?? small.options.height, full: large.src };
}
