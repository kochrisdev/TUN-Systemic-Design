import { copyFile, mkdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
await mkdir(new URL('dist/', root), { recursive: true });
await copyFile(new URL('src/styles.css', root), new URL('dist/styles.css', root));
await copyFile(new URL('../../styles/tun.css', root), new URL('dist/tokens.css', root));
await copyFile(new URL('../../LICENSE', root), new URL('LICENSE', root));
