#!/bin/bash
# P/L Calendar Port Script
# Copies all P/L Calendar files from NemoBlock to Nemo-UndervaluedAI

set -e  # Exit on any error

# Set paths
SRC="/Users/nemotaka/NemoBlock"
DST="/Users/nemotaka/Nemo-UndervaluedAI"

echo "🚀 Starting P/L Calendar port..."
echo "Source: $SRC"
echo "Target: $DST"

# Create target directories
echo "📁 Creating directories..."
mkdir -p "$DST/src/app/(platform)/pl-calendar"
mkdir -p "$DST/src/app/(platform)/pl-calendar-comparison"
mkdir -p "$DST/src/components/pl-calendar"
mkdir -p "$DST/src/lib/hooks"
mkdir -p "$DST/src/lib/settings"

# Copy page routes
echo "📄 Copying pages..."
cp "$SRC/app/(platform)/pl-calendar/page.tsx" "$DST/src/app/(platform)/pl-calendar/page.tsx"
cp "$SRC/app/(platform)/pl-calendar-comparison/page.tsx" "$DST/src/app/(platform)/pl-calendar-comparison/page.tsx"

# Copy components
echo "🧩 Copying components..."
cp "$SRC/components/pl-calendar/DayDetailModal.tsx" "$DST/src/components/pl-calendar/DayDetailModal.tsx"
cp "$SRC/components/pl-calendar/MonthlyPLCalendar.tsx" "$DST/src/components/pl-calendar/MonthlyPLCalendar.tsx"
cp "$SRC/components/pl-calendar/PLCalendarPanel.tsx" "$DST/src/components/pl-calendar/PLCalendarPanel.tsx"
cp "$SRC/components/pl-calendar/PLCalendarSettingsMenu.tsx" "$DST/src/components/pl-calendar/PLCalendarSettingsMenu.tsx"
cp "$SRC/components/pl-calendar/PLComparisonCalendarPanel.tsx" "$DST/src/components/pl-calendar/PLComparisonCalendarPanel.tsx"
cp "$SRC/components/pl-calendar/PLDayView.tsx" "$DST/src/components/pl-calendar/PLDayView.tsx"
cp "$SRC/components/pl-calendar/RomTrendChart.tsx" "$DST/src/components/pl-calendar/RomTrendChart.tsx"
cp "$SRC/components/pl-calendar/StrategyCorrelationMatrix.tsx" "$DST/src/components/pl-calendar/StrategyCorrelationMatrix.tsx"
cp "$SRC/components/pl-calendar/WeekdayAlphaMap.tsx" "$DST/src/components/pl-calendar/WeekdayAlphaMap.tsx"
cp "$SRC/components/pl-calendar/YearHeatmap.tsx" "$DST/src/components/pl-calendar/YearHeatmap.tsx"
cp "$SRC/components/pl-calendar/YearViewBlock.tsx" "$DST/src/components/pl-calendar/YearViewBlock.tsx"
cp "$SRC/components/pl-calendar/YearlyPLTable.tsx" "$DST/src/components/pl-calendar/YearlyPLTable.tsx"

# Copy lib files
echo "📚 Copying library files..."
cp "$SRC/lib/hooks/use-pl-calendar-settings.ts" "$DST/src/lib/hooks/use-pl-calendar-settings.ts"
cp "$SRC/lib/settings/pl-calendar-settings.ts" "$DST/src/lib/settings/pl-calendar-settings.ts"

echo "✅ All files copied successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Run: cd $DST && npm install"
echo "2. Check for missing dependencies (recharts, etc.)"
echo "3. Add sidebar navigation links"
echo "4. Test: npm run dev"
echo ""
