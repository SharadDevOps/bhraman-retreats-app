# Media Inventory

## Tracked/reference media files

| File | Type | Size | Dimensions/pages | Runtime usage |
|---|---|---:|---|---|
| `public/hero-himalayan-dawn.png` | PNG | 1,673,203 bytes | 1717×916 | Phase 2 hero CSS background |
| `public/og.png` | PNG | 1,904,956 bytes | 1731×909 | Phase 2 Open Graph/Twitter card |
| `docs/HomeIntroduction.pdf` | PDF | 73,211 bytes | 3 pages | Reference only |
| `docs/Google Keep document.docx` | DOCX | 571,849 bytes | Document source | Reference only |
| `docs/five days retreat schedule..docx` | DOCX | 566,399 bytes | Document source | Reference only |

The two PNG files are present only in the newer feature working tree and are not part of `origin/main`.

## Runtime image slots

`MediaSlots` defines:

- `retreat`;
- `founder`;
- `hero`.

### Active consumers

| Slot | Upload UI | API support | Homepage consumer |
|---|---|---|---|
| retreat | Yes | Yes | Upcoming Retreat image |
| founder | Yes | Yes | Meet Your Guide portrait |
| hero | No | Yes | None |

When retreat/founder slots are empty, the public site renders visible placeholder text rather than an image.

## Hero media by version

### Current merged version

- No tracked raster hero image.
- Hero visual is generated from CSS gradients, a rotating element wheel, orbits, leaves, and mist.
- `HeroNature` renders leaf/mist decorations.
- Dynamic `media.hero` is not consumed.

### Newer feature phase

- Uses `/hero-himalayan-dawn.png` as a CSS background.
- Adds a full-screen canvas particle layer.
- Adds an optional generated Web Audio wind effect; there is no audio file.
- Keeps the old `HeroNature` implementation in the repository but does not render it.

## Founder and retreat media

- No founder portrait is tracked.
- No upcoming-retreat photograph is tracked.
- Both are expected to come from `SiteContent["mediaSlots"]`.
- The actual deployed URLs are database values and therefore cannot be inventoried from source alone.

## Azure Blob integration

- URL base: `https://${AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`.
- Container: `AZURE_STORAGE_CONTAINER_NAME`, default `retreat-media`.
- Authentication: `DefaultAzureCredential`, intended to use App Service managed identity.
- Returned blob URLs are used directly in `<img src>`.
- Code assumes public anonymous blob reads.

Accepted upload formats:

- JPEG;
- PNG;
- WebP;
- AVIF.

Maximum size: 8 MiB.

## Local media integration

- Without Azure configuration, uploads are written to `public/uploads`.
- `public/uploads` is ignored by Git and Docker.
- The local fallback is not durable in a container deployment.

## Media database records

`MediaAsset` stores:

- unique blob name;
- URL;
- alt text;
- MIME type;
- optional width/height;
- creation time.

Current gaps:

- dimensions are never populated;
- no list API/UI;
- no delete API/UI;
- replacement does not remove old blobs/records;
- no orphan detection;
- no focal point/crop metadata;
- no attribution/source metadata.

## Logo/media gaps

- No logo image or vector asset exists.
- Brand marks are Unicode glyphs in JSX.
- No favicon/app icon was found.
- No dedicated founder media alt text is editable; the public founder alt text is hardcoded.
- Upload alt text is supported by the API but the admin UI does not submit it.

## Image delivery risks

- The Phase 2 hero is a 1.67 MB PNG rather than a responsive AVIF/WebP set.
- It is preloaded and also referenced by CSS.
- CSS backgrounds bypass Next image optimization.
- Dynamic images use raw `<img>` tags with no dimensions, `srcset`, or loading policy.
- Missing dimensions can cause cumulative layout shift.
- The 1.90 MB OG image is larger than necessary for most social clients.
- `next.config.ts` permits Azure Blob hostnames for Next Image, but active public/admin rendering does not use `next/image`.

## Video and audio inventory

- No video files.
- No video URLs.
- No YouTube/Vimeo integrations.
- No `<video>` component.
- No audio files.
- Phase 2 wind is synthesized at runtime through Web Audio after user interaction.

## Blog media/content inventory

No blog implementation was found:

- no blog/post routes;
- no post models;
- no Markdown/MDX posts;
- no CMS connector;
- no author/category/tag data;
- no blog images or videos.

