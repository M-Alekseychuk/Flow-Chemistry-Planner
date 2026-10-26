#!/usr/bin/env bash
set -e

echo "=== Flow Chemistry Designer Boundary & Quality Check ==="

# 1. TypeScript Verification
echo "1. Checking TypeScript compilation..."
npx tsc --noEmit
echo "✓ TypeScript compiled successfully with 0 errors."

# 2. Documentation Architecture Verification
echo "2. Checking core documentation files..."
REQUIRED_DOCS=(
  "docs/context/architecture.md"
  "docs/context/domain-flow-chemistry.md"
  "docs/context/system-patterns.md"
  "docs/spec/data-models.md"
  "docs/spec/simulation-engine.md"
  "docs/spec/features-spec.md"
  "docs/memory/decisions.md"
  "docs/memory/state-reference.md"
  "docs/task/backlog.md"
  "docs/task/completed.md"
  "AGENTS.md"
  "CLAUDE.md"
  "README.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
  if [ ! -f "$doc" ]; then
    echo "✗ Missing required documentation: $doc"
    exit 1
  fi
done
echo "✓ All core documentation files are present."

# 3. Environment & Secrets Check
echo "3. Checking environment templates..."
if [ ! -f ".env.example" ]; then
  echo "✗ Missing .env.example"
  exit 1
fi
echo "✓ Environment templates verified."

echo "=== All Boundary Checks Passed Successfully! ==="
