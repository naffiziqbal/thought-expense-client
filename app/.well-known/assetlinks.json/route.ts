import assetLinks from '@/lib/assetlinks.json';

/** Android App Links — must be 200 JSON at /.well-known/assetlinks.json (no redirect). */
export const dynamic = 'force-static';

export function GET() {
  return Response.json(assetLinks, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
