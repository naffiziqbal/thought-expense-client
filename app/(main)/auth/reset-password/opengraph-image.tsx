import { ImageResponse } from 'next/og';
import { OGTemplate, OG_SIZE } from '@/lib/og-template';

export const alt = 'Set new password | ThoughtExpense';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <OGTemplate
        title="Set new password"
        description="ThoughtExpense"
        subtitle="Enter your new password below."
      />
    ),
    { ...size }
  );
}
