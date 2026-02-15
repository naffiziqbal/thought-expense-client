import { ImageResponse } from 'next/og';
import { OGTemplate, OG_SIZE } from '@/lib/og-template';

export const alt = 'Forgot password | ThoughtExpense';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <OGTemplate
        title="Forgot password"
        description="Reset your ThoughtExpense password."
        subtitle="We'll send you a reset link."
      />
    ),
    { ...size }
  );
}
