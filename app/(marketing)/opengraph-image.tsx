import { ImageResponse } from 'next/og';
import { OGTemplate, OG_SIZE } from '@/lib/og-template';

export const alt =
  'ThoughtExpense - AI-powered expense tracking. Track expenses. Just by typing.';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <OGTemplate
        title="ThoughtExpense"
        description="Track expenses. Just by typing."
        subtitle="No categories. No dates. Coffee 15, Rent 5000 — done."
      />
    ),
    { ...size }
  );
}
