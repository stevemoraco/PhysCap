#!/bin/bash
# verify_links.sh - Verify all markdown links in business plan files

echo "=== Business Plan Link Verification ==="
echo ""

# Count total files
TOTAL_FILES=$(ls -1 section_*.md appendix_*.md 2>/dev/null | wc -l | tr -d ' ')
echo "📁 Total files to check: $TOTAL_FILES"
echo ""

# Extract all red-teaming references
echo "🔍 Extracting all red-teaming references..."
grep -roh "red-teaming/[0-9][0-9]_[^)]*\.md" section_*.md appendix_*.md \
  | sed 's/#.*//' | sed 's/`.*//' | sed 's/ .*//' \
  | sort -u > /tmp/link_check.txt

TOTAL_REFS=$(wc -l < /tmp/link_check.txt | tr -d ' ')
echo "📎 Unique references found: $TOTAL_REFS"
echo ""

# Check each reference
echo "✅ Verifying each reference exists..."
MISSING=0
while IFS= read -r file; do
  if [ ! -f "$file" ]; then
    echo "❌ MISSING: $file"
    MISSING=$((MISSING + 1))
  fi
done < /tmp/link_check.txt

echo ""
if [ $MISSING -eq 0 ]; then
  echo "✅ SUCCESS: All $TOTAL_REFS references are valid!"
  echo "✅ No broken links found"
else
  echo "❌ FAILED: $MISSING broken links found"
  exit 1
fi

echo ""
echo "=== Verification Complete ==="
