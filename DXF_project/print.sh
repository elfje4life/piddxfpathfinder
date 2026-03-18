#!/bin/bash

set -euo pipefail

html_file="index.html"
src_dir="./src"

if [[ ! -f "$html_file" ]]; then
  echo "Error: HTML file '$html_file' not found." >&2
  exit 1
fi

if [[ ! -d "$src_dir" ]]; then
  echo "Error: Source directory '$src_dir' not found." >&2
  exit 1
fi

# 🧵 CSS block
styles_block="<!--Inject Styles-->"
while IFS= read -r -d '' css_file; do
  href="${css_file#./}"
  styles_block+=$'\n'"<link rel=\"stylesheet\" href=\"$href\">"
done < <(find "$src_dir" -type f -name '*.css' -print0)
styles_block+=$'\n'"<!--End Styles-->"

# 🧵 SVG block
svg_block="<!--Inject Icons-->"
while IFS= read -r -d '' svg_file; do
  svg_block+=$'\n'
  svg_block+=$(tail -n +2 "$svg_file")
done < <(find "$src_dir" -type f -name '*.svg' -print0)
svg_block+=$'\n'"<!--End Icons-->"

# 🧵 JS block with priority sorting
priority_sort() {
  case "$(basename "$1")" in
    ___*) echo "96 $1" ;;
    __*) echo "97 $1" ;;
    _*) echo "98 $1" ;;
    *) echo "99 $1" ;;
  esac
}

mapfile -t sorted_js < <(
  find "$src_dir" -type f -name '*.js' |
  while read -r f; do priority_sort "$f"; done |
  sort -n | cut -d' ' -f2
)

scripts_block="<!--Inject Scripts-->"
for js_file in "${sorted_js[@]}"; do
  href="${js_file#./}"
  module_name="$(basename "$js_file" .js)"
  scripts_block+=$'\n'"<script src=\"$href\" defer data-module=\"$module_name\"></script>"
done
scripts_block+=$'\n'"<!--End Scripts-->"

# 🧩 Replace block function
replace_block() {
  local start="$1"
  local end="$2"
  local content="$3"
  local tmpfile
  tmpfile=$(mktemp)

  awk -v s="$start" -v e="$end" -v r="$content" '
    BEGIN {skip=0}
    {
      if ($0 ~ s) { skip=1; print r; next }
      if (skip && $0 ~ e) { skip=0; next }
      if (!skip) print
    }
  ' "$html_file" > "$tmpfile"

  mv "$tmpfile" "$html_file"
}

# 🚀 Inject blocks
echo "Injecting CSS..."
replace_block "<!--Inject Styles-->" "<!--End Styles-->" "$styles_block"

echo "Injecting SVG..."
replace_block "<!--Inject Icons-->" "<!--End Icons-->" "$svg_block"

echo "Injecting JS..."
replace_block "<!--Inject Scripts-->" "<!--End Scripts-->" "$scripts_block"

echo "✅ Injection complete in $html_file."
