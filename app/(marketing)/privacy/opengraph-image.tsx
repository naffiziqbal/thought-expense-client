import { ImageResponse } from 'next/og';
import { OGTemplate, OG_SIZE } from '@/lib/og-template';

export const alt = 'Privacy Policy | ThoughtExpense';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <OGTemplate
        title="Privacy Policy"
        description="How ThoughtExpense handles your data."
        subtitle="Privacy-first expense tracking."
      />
    ),
    { ...size }
  );
}
