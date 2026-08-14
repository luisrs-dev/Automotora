#!/usr/bin/env node

import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = 'https://www.joseluisjara.cl';
const CATALOG_URLS = [`${SITE_URL}/`, `${SITE_URL}/autos-usados/`];
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'Vehiculos');
const REQUEST_DELAY_MS = 350;
const MAX_RETRIES = 3;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithRetry(url, options = {}) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45_000);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; AutomotoraImageScraper/1.0)',
          ...options.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) await sleep(attempt * 1_000);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(`${lastError?.message ?? 'Error desconocido'} (${url})`);
}

function decodeHtml(value) {
  const entities = {
    amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ',
    aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú',
    Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú',
    ntilde: 'ñ', Ntilde: 'Ñ', uuml: 'ü', Uuml: 'Ü',
  };

  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) =>
      String.fromCodePoint(code.toLowerCase().startsWith('x')
        ? Number.parseInt(code.slice(1), 16)
        : Number.parseInt(code, 10)))
    .replace(/&([a-z]+);/gi, (match, name) => entities[name] ?? match)
    .replace(/\s+/g, ' ')
    .trim();
}

function safeFolderName(title) {
  return title
    .normalize('NFC')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/[. ]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140) || 'Vehiculo sin titulo';
}

function extractVehicleUrls(html) {
  const urls = new Set();
  const pattern = /href=["']([^"']*\/vehiculo\/[^"'#?]+\/\d+\/?)["']/gi;
  let match;

  while ((match = pattern.exec(html)) !== null) {
    urls.add(new URL(match[1], SITE_URL).href.replace(/\/$/, ''));
  }

  return urls;
}

function extractTitle(html, vehicleUrl) {
  const detailTitle = html.match(/<div[^>]+class=["'][^"']*p-datos[^"']*["'][\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/i)?.[1];
  const heading = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const sourceId = vehicleUrl.match(/\/(\d+)\/?$/)?.[1] ?? 'sin-id';
  return decodeHtml(detailTitle ?? heading ?? `Vehiculo ${sourceId}`);
}

function extractImageUrls(html) {
  const urls = [];
  const seen = new Set();
  const pattern = /<a[^>]+rel=["']gall["'][^>]+href=["']([^"']+)["']/gi;
  let match;

  while ((match = pattern.exec(html)) !== null) {
    const url = new URL(decodeHtml(match[1]), SITE_URL).href;
    if (!seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  }

  return urls;
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

function extensionFor(imageUrl, contentType) {
  const pathname = new URL(imageUrl).pathname;
  const extension = path.extname(pathname).toLowerCase();
  if (/^\.(jpe?g|png|webp|gif)$/.test(extension)) return extension === '.jpeg' ? '.jpg' : extension;
  if (contentType?.includes('png')) return '.png';
  if (contentType?.includes('webp')) return '.webp';
  if (contentType?.includes('gif')) return '.gif';
  return '.jpg';
}

async function downloadImage(imageUrl, destinationWithoutExtension) {
  const response = await fetchWithRetry(imageUrl);
  const extension = extensionFor(imageUrl, response.headers.get('content-type'));
  const destination = `${destinationWithoutExtension}${extension}`;

  if (await exists(destination)) return 'existing';

  const bytes = new Uint8Array(await response.arrayBuffer());
  await writeFile(destination, bytes, { flag: 'wx' });
  return 'downloaded';
}

async function chooseVehicleDirectory(title, vehicleUrl, claimedDirectories) {
  const baseName = safeFolderName(title);
  const sourceId = vehicleUrl.match(/\/(\d+)\/?$/)?.[1] ?? 'sin-id';
  let directory = path.join(OUTPUT_DIR, baseName);

  if (claimedDirectories.has(directory)) {
    directory = path.join(OUTPUT_DIR, `${baseName} - ${sourceId}`);
  }

  claimedDirectories.add(directory);
  await mkdir(directory, { recursive: true });
  return directory;
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const vehicleUrls = new Set();
  for (const catalogUrl of CATALOG_URLS) {
    process.stdout.write(`Revisando catálogo: ${catalogUrl}\n`);
    const html = await (await fetchWithRetry(catalogUrl)).text();
    for (const url of extractVehicleUrls(html)) vehicleUrls.add(url);
  }

  if (vehicleUrls.size === 0) throw new Error('No se encontraron vehículos en el catálogo.');
  process.stdout.write(`Vehículos encontrados: ${vehicleUrls.size}\n\n`);

  const claimedDirectories = new Set();
  let vehiclesCompleted = 0;
  let imagesDownloaded = 0;
  let imagesExisting = 0;
  let errors = 0;
  let position = 0;

  for (const vehicleUrl of vehicleUrls) {
    position += 1;
    try {
      const html = await (await fetchWithRetry(vehicleUrl)).text();
      const title = extractTitle(html, vehicleUrl);
      const imageUrls = extractImageUrls(html);
      const directory = await chooseVehicleDirectory(title, vehicleUrl, claimedDirectories);

      process.stdout.write(`[${position}/${vehicleUrls.size}] ${title}: ${imageUrls.length} imágenes\n`);

      for (let index = 0; index < imageUrls.length; index += 1) {
        const number = String(index + 1).padStart(2, '0');
        try {
          const result = await downloadImage(imageUrls[index], path.join(directory, number));
          if (result === 'downloaded') imagesDownloaded += 1;
          else imagesExisting += 1;
        } catch (error) {
          errors += 1;
          process.stderr.write(`  Error en imagen ${number}: ${error.message}\n`);
        }
        await sleep(REQUEST_DELAY_MS);
      }

      vehiclesCompleted += 1;
    } catch (error) {
      errors += 1;
      process.stderr.write(`[${position}/${vehicleUrls.size}] Error: ${error.message}\n`);
    }
    await sleep(REQUEST_DELAY_MS);
  }

  process.stdout.write('\nProceso terminado\n');
  process.stdout.write(`Vehículos procesados: ${vehiclesCompleted}/${vehicleUrls.size}\n`);
  process.stdout.write(`Imágenes descargadas: ${imagesDownloaded}\n`);
  process.stdout.write(`Imágenes que ya existían: ${imagesExisting}\n`);
  process.stdout.write(`Errores: ${errors}\n`);

  if (errors > 0) process.exitCode = 1;
}

main().catch((error) => {
  process.stderr.write(`Error fatal: ${error.message}\n`);
  process.exitCode = 1;
});
