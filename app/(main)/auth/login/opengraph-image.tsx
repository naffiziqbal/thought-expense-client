import { ImageResponse } from 'next/og';
import { OGTemplate, OG_SIZE } from '@/lib/og-template';

export const alt = 'Log in to ThoughtExpense';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <OGTemplate
        title="Log in"
        description="ThoughtExpense"
        subtitle="Track expenses. Just by typing."
      />
    ),
    { ...size }
  );
}
