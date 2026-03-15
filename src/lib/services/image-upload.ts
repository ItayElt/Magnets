import { createBrowserClient } from '@supabase/ssr';

export async function uploadCroppedImage(dataUrl: string, orderId: string): Promise<string> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Convert data URL to blob
  const res = await fetch(dataUrl);
  const blob = await res.blob();

  const filename = `${orderId}/${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from('magnet-images')
    .upload(filename, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  return filename;
}

export function getImagePublicUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return `${supabaseUrl}/storage/v1/object/public/magnet-images/${path}`;
}
