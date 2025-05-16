import type { DisplaySettings } from '@/types/display';
import type { SetDisplayResponse } from '@/types/settings.ts';
import { fetchWithErrorHandling } from '@/lib/fetcher.ts';
import { constructUrl } from '@/lib/utils';

export async function updateSettings(
  displaySettings: Partial<DisplaySettings>,
  alertFn: (message: string) => void
): Promise<SetDisplayResponse | null | void> {
  return fetchWithErrorHandling<SetDisplayResponse>(
    constructUrl('settings'),
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: displaySettings.type,
        colour_palette: displaySettings.colourPalette,
        border_colour: displaySettings.borderColour,
        mode: displaySettings.mode
      }),
    },
    alertFn
  ).catch((error: Error) => {
    console.error('Error updating display settings', error);
  });
}