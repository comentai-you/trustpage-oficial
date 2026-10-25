# Project rules
- Store VSL share-image URLs in page content JSON and include them in both manual and automatic saves; this avoids schema duplication.
- Serve social-crawler metadata through the share-page Edge Function before Vercel's SPA fallback; browser-only metadata cannot produce WhatsApp previews.
- Resolve custom-domain share metadata through the existing domain resolver and published-page RPCs; this preserves tenant and publication boundaries.
- Keep VSL provider URL parsing in src/lib/vsl-video.ts and leave native sound controls accessible; mobile playback restrictions require a direct player interaction fallback.