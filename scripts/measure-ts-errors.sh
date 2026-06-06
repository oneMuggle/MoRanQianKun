#!/usr/bin/env bash
set -euo pipefail
LAYER="${1:-core}"
TSCONFIG="tsconfig.${LAYER}.json"
OUT="${OUT_FILE:-tsc-error-trend.txt}"
COUNT=$(npx tsc --noEmit -p "$TSCONFIG" 2>&1 | grep -E "error TS[0-9]+" | wc -l)
echo "Day-$(date +%j), ${LAYER}, ${COUNT}, $(date -Iseconds)" >> "$OUT"
echo "Layer ${LAYER}: ${COUNT} errors"
