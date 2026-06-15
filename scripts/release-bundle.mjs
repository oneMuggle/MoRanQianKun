#!/usr/bin/env node
/**
 * scripts/release-bundle.mjs
 *
 * 把 dist/ 打包为可分发的 release bundle：
 *   - 生成 tar.gz 压缩包
 *   - 计算 SHA256 校验和
 *   - 写入 manifest.json 元数据
 *
 * 来源：docs/plans/2026-06-15_yishijie-borrow-plan.md B5
 * 借鉴 yishijie scripts/release-bundle.cjs（OTA 风格），简化为 web-only 平台
 *
 * 用法：
 *   node scripts/release-bundle.mjs                  # 自动用最新 dist/ + 时间戳版本
 *   node scripts/release-bundle.mjs --version=0.4.3 # 指定版本
 *   node scripts/release-bundle.mjs --out=dist-release
 *
 * 输出结构：
 *   dist-release/
 *   ├── mrqk-v0.4.3.tar.gz
 *   ├── mrqk-v0.4.3.tar.gz.sha256
 *   └── manifest.json
 */

import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir, readdir, stat, writeFile, rm, readFile } from 'node:fs/promises';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DEFAULT_INPUT = resolve(ROOT, 'dist');
const DEFAULT_OUTPUT = resolve(ROOT, 'dist-release');

/** 排除项（基于 basename） */
const EXCLUDE_BASENAMES = new Set([
    '.DS_Store',
    'Thumbs.db',
]);

/** 排除后缀 */
const EXCLUDE_SUFFIXES = ['.md', '.map'];

/** 解析命令行参数 */
function parseArgs() {
    const args = process.argv.slice(2);
    const result = { input: DEFAULT_INPUT, output: DEFAULT_OUTPUT, version: null };
    for (const arg of args) {
        if (arg.startsWith('--version=')) {
            result.version = arg.slice('--version='.length);
        } else if (arg.startsWith('--input=')) {
            result.input = resolve(ROOT, arg.slice('--input='.length));
        } else if (arg.startsWith('--out=')) {
            result.output = resolve(ROOT, arg.slice('--out='.length));
        }
    }
    if (!result.version) {
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, '');
        const seq = String(now.getUTCHours() * 60 + now.getUTCMinutes()).padStart(4, '0');
        result.version = `0.0.0-${date}-${seq}`;
    }
    return result;
}

/** 递归列出目录下所有文件（应用排除规则） */
async function listFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (EXCLUDE_BASENAMES.has(entry.name)) continue;
        if (EXCLUDE_SUFFIXES.some((s) => entry.name.endsWith(s))) continue;
        if (entry.isDirectory()) {
            files.push(...(await listFiles(fullPath)));
        } else if (entry.isFile()) {
            files.push(fullPath);
        }
    }
    return files;
}

/** 计算文件 SHA256 */
async function sha256OfFile(filePath) {
    return new Promise((resolveHash, reject) => {
        const hash = createHash('sha256');
        const stream = createReadStream(filePath);
        stream.on('data', (chunk) => hash.update(chunk));
        stream.on('end', () => resolveHash(hash.digest('hex')));
        stream.on('error', reject);
    });
}

/** 构建简单 tar 文件（POSIX ustar 格式） */
async function buildSimpleTar(baseDir, files) {
    const blocks = [];
    for (const file of files) {
        const content = await readFile(file);
        const name = file.slice(baseDir.length + 1);

        const header = Buffer.alloc(512);
        // 写入文件名（前 100 字节）
        const nameBytes = Buffer.from(name);
        nameBytes.copy(header, 0, 0, Math.min(100, nameBytes.length));
        // mode
        header.write('0000644\0', 100, 8);
        // uid / gid
        header.write('0000000\0', 108, 8);
        header.write('0000000\0', 116, 8);
        // size (octal, 11 bytes + null)
        header.write(content.length.toString(8).padStart(11, '0') + '\0', 124, 12);
        // mtime
        header.write(Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + '\0', 136, 12);
        // checksum placeholder (8 spaces)
        header.write('        ', 148, 8);
        // typeflag = regular file
        header.write('0', 156, 1);
        // magic
        header.write('ustar\0', 257, 6);
        // version
        header.write('00', 263, 2);
        // uname / gname
        header.write('root\0', 265, 5);
        header.write('root\0', 297, 5);

        // 计算 checksum
        let sum = 0;
        for (let i = 0; i < 512; i++) sum += header[i];
        header.write(sum.toString(8).padStart(6, '0') + '\0 ', 148, 8);

        blocks.push(header, content);
        // pad to 512
        const pad = 512 - (content.length % 512);
        if (pad < 512) {
            blocks.push(Buffer.alloc(pad));
        }
    }
    // 1024 字节 EOF（两个 512 字节空块）
    blocks.push(Buffer.alloc(1024));
    return Buffer.concat(blocks);
}

/** 主流程 */
async function main() {
    const { input, output, version } = parseArgs();

    // 检查输入目录
    try {
        const stats = await stat(input);
        if (!stats.isDirectory()) {
            console.error(`❌ 输入路径不是目录: ${input}`);
            process.exit(1);
        }
    } catch (e) {
        console.error(`❌ 输入目录不存在: ${input}`);
        console.error(`提示：先运行 'npm run build' 生成 dist/`);
        process.exit(1);
    }

    // 准备输出目录
    await mkdir(output, { recursive: true });
    // 清理旧 bundle
    try {
        const existing = await readdir(output);
        for (const f of existing) {
            if (f.startsWith('mrqk-')) {
                await rm(join(output, f));
            }
        }
    } catch {}

    console.log(`📦 打包 ${input} → ${output}`);
    console.log(`🏷  版本: ${version}`);

    // 列出文件
    const files = await listFiles(input);
    if (files.length === 0) {
        console.error(`❌ 输入目录无文件: ${input}`);
        process.exit(1);
    }

    // 计算文件元数据
    const fileEntries = await Promise.all(
        files.map(async (f) => {
            const relativePath = f.slice(input.length + 1);
            const sha256 = await sha256OfFile(f);
            const stats = await stat(f);
            return {
                path: relativePath,
                size: stats.size,
                sha256,
            };
        })
    );

    // 构建 tar
    const bundleName = `mrqk-v${version}`;
    const tarPath = join(output, `${bundleName}.tar`);
    const tarBuffer = await buildSimpleTar(input, files);
    await writeFile(tarPath, tarBuffer);

    // 简单 gzip 压缩（用 node 自带 zlib）
    const zlib = await import('node:zlib');
    const gzPath = `${tarPath}.gz`;
    const gzipPromise = new Promise((resolveGz, rejectGz) => {
        const gzip = zlib.createGzip();
        const inp = createReadStream(tarPath);
        const out = createWriteStream(gzPath);
        inp.pipe(gzip).pipe(out);
        out.on('finish', resolveGz);
        out.on('error', rejectGz);
        inp.on('error', rejectGz);
    });
    await gzipPromise;

    // 删除中间 tar
    await rm(tarPath);

    // 计算 SHA256
    const bundleSha256 = await sha256OfFile(gzPath);
    const sha256Sidecar = join(output, `${bundleName}.tar.gz.sha256`);
    await writeFile(sha256Sidecar, `${bundleSha256}  ${bundleName}.tar.gz\n`);

    // 生成 manifest.json
    const manifest = {
        version,
        generatedAt: new Date().toISOString(),
        input: input.replace(ROOT + '/', ''),
        bundle: {
            name: `${bundleName}.tar.gz`,
            sha256: bundleSha256,
            size: (await stat(gzPath)).size,
            fileCount: fileEntries.length,
            totalUnpackedSize: fileEntries.reduce((sum, f) => sum + f.size, 0),
        },
        files: fileEntries,
    };
    const manifestPath = join(output, 'manifest.json');
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`\n✅ 打包完成：`);
    console.log(`   - ${basename(gzPath)}  (${manifest.bundle.size} bytes)`);
    console.log(`   - ${basename(sha256Sidecar)}`);
    console.log(`   - manifest.json  (${fileEntries.length} files)`);
    console.log(`   - SHA256: ${bundleSha256}`);
}

main().catch((err) => {
    console.error('❌ 打包失败:', err.message);
    console.error(err.stack);
    process.exit(1);
});
