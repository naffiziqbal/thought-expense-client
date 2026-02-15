import { ImageResponse } from 'next/og';
import { OGTemplate, OG_SIZE } from '@/lib/og-template';

export const alt = 'Terms of Service | ThoughtExpense';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <OGTemplate
        title="Terms of Service"
        description="Your rights and responsibilities."
        subtitle="ThoughtExpense expense tracker."
      />
    ),
    { ...size }
  );
}
