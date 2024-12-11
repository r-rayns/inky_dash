import { fetchWithErrorHandling } from '@/lib/fetcher';
import { constructUrl } from '@/lib/utils';

export async function ditherImage(
  image: string,
  alertFn: (message: string) => void
): Promise<DitherResponse | null | void> {
  return fetchWithErrorHandling<DitherResponse>(
    constructUrl('utils/dither'),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image,
      }),
    },
    alertFn
  ).catch((error: Error) => {
    console.error('Error dithering image', error);
  });
}

export interface DitherResponse {
  image: string;
}
