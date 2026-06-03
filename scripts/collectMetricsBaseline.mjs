#!/usr/bin/env node
/**
 * scripts/collectMetricsBaseline.mjs
 *
 * 收集项目质量基线指标：
 *   - 循环依赖（madge）
 *   - 未引用导出（ts-prune）
 *   - 未使用依赖（knip）
 *   - 测试覆盖率（vitest run --coverage）
 *
 * 输出到 .tmp/baseline-*.txt，可在 Phase 8 时对比改进幅度。
 *
 * 用法：
 *   node scripts/collectMetricsBaseline.mjs
 *
 * 设计原则：
 *   - 任一命令失败不阻塞其他测量（fail-soft）
 *   - 输出文件统一用 .tmp/baseline-*.txt，方便 .gitignore
 *   - 末尾打印每个工具的退出码
 */

import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, '.tmp');

mkdirSync(OUT_DIR, { recursive: true });

/**
 * 执行命令并把 stdout/stderr 写入指定文件。
 * @param {string} cmd
 * @param {string} outFile
 * @returns {{ ok: boolean, code: number|null }}
 */
function run(cmd, outFile) {
    const fullPath = resolve(OUT_DIR, outFile);
    const header = `# baseline collected at ${new Date().toISOString()}\n# command: ${cmd}\n\n`;
    try {
        const out = execSync(cmd, {
            cwd: ROOT,
            stdio: ['ignore', 'pipe', 'pipe'],
            maxBuffer: 64 * 1024 * 1024,
        });
        writeFileSync(fullPath, header + out.toString());
        return { ok: true, code: 0 };
    } catch (err) {
        const stdout = err.stdout ? err.stdout.toString() : '';
        const stderr = err.stderr ? err.stderr.toString() : '';
        const code = typeof err.status === 'number' ? err.status : null;
        writeFileSync(fullPath, header + stdout + '\n--- STDERR ---\n' + stderr);
        return { ok: false, code };
    }
}

const steps = [
    { name: 'circular',  cmd: 'pnpm exec madge --circular --extensions ts,tsx --warning .', out: 'baseline-circular.txt' },
    { name: 'dead',      cmd: 'pnpm exec ts-prune',                                        out: 'baseline-dead.txt' },
    { name: 'unused',    cmd: 'pnpm exec knip --no-progress',                              out: 'baseline-unused.txt' },
    { name: 'tests',     cmd: 'pnpm exec vitest run',  out: 'baseline-tests.txt' },
];

const main = async () => {
console.log('Collecting metrics baseline ...');
const results = [];
for (const step of steps) {
    process.stdout.write(`  - ${step.name} ... `);
    const r = run(step.cmd, step.out);
    results.push({ ...step, ...r });
    console.log(r.ok ? 'OK' : `FAIL (code=${r.code})`);
}

// 附加：测试文件数 / 用例数（与 vitest 失败无关，永远成功）
{
    process.stdout.write('  - test-files ... ');
    const { readdirSync, readFileSync, statSync } = await import('node:fs');
    const { join } = await import('node:path');
    const skipDirs = new Set(['node_modules', '.git', 'dist', 'coverage', '.tmp', '.vite']);
    const tests = [];
    function walk(dir) {
        for (const entry of readdirSync(dir)) {
            if (skipDirs.has(entry)) continue;
            const p = join(dir, entry);
            const s = statSync(p);
            if (s.isDirectory()) walk(p);
            else if (/\.test\.(ts|tsx)$/.test(entry)) tests.push(p);
        }
    }
    walk(ROOT);
    let cases = 0;
    for (const f of tests) {
        const txt = readFileSync(f, 'utf8');
        const m = txt.match(/^\s*(?:it|test)\s*\(/gm);
        if (m) cases += m.length;
    }
    const header = `# baseline collected at ${new Date().toISOString()}\n# command: manual glob + it/test counter\n\n`;
    writeFileSync(
        resolve(OUT_DIR, 'baseline-test-count.txt'),
        header + `test files: ${tests.length}\ntest cases (it|test): ${cases}\n`,
    );
    console.log(`OK (${tests.length} files, ${cases} cases)`);
    results.push({ name: 'test-files', out: 'baseline-test-count.txt', ok: true, code: 0 });
}

console.log('\nSummary:');
for (const r of results) {
    const flag = r.ok ? '✓' : '✗';
    console.log(`  ${flag} ${r.name.padEnd(10)} -> .tmp/${r.out}`);
}
console.log(`\nAll baselines written to: ${OUT_DIR}`);
console.log('Next: cp .tmp/baseline-*.txt docs/technical/metrics-baseline-2026-06/  for archival.');
};

main().catch((err) => {
    console.error(err);
    process.exit(1);
});

