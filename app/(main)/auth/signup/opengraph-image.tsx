import { ImageResponse } from 'next/og';
import { OGTemplate, OG_SIZE } from '@/lib/og-template';

export const alt = 'Get Started Free | ThoughtExpense';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <OGTemplate
        title="Get Started"
        description="Create your free ThoughtExpense account."
        subtitle="Track expenses. Just by typing."
      />
    ),
    { ...size }
  );
}
