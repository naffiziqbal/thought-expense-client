/**
 * Single source of truth for the site's public URL.
 * IMPORTANT: the default must be the domain the site actually lives on —
 * canonical/OG/sitemap URLs pointing at a foreign domain de-index the site.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thoughtexpense.nafiziqbal.com';
