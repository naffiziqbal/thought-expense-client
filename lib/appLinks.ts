/** Google Play listing — keep in sync with app.json android.package */
export const ANDROID_PACKAGE = 'com.nafiziqbal.thoughtexpense';

export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;

/** Custom URL scheme from Expo app.json (`scheme`) */
export const APP_SCHEME = 'thoughtexpense';

/** Marketing path: use in emails and QR codes; redirects to Play or opens the app on Android */
export const GET_APP_PATH = '/get-app';

export function getAppUrl(siteOrigin: string): string {
  const base = siteOrigin.replace(/\/$/, '');
  return `${base}${GET_APP_PATH}`;
}
