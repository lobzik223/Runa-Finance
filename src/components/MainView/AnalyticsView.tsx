import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DONUT_TRACK_COLOR = '#A8C5E0';
const DONUT_PROGRESS_COLOR = '#F4A460';

interface AnalyticsViewProps {
  onBack: () => void;
}

type DonutChartProps = {
  size: number;
  strokeWidth: number;
  /** 0..1 */
  fraction: number;
  trackColor: string;
  progressColor: string;
};

const DonutChart: React.FC<DonutChartProps> = ({
  size,
  strokeWidth,
  fraction,
  trackColor,
  progressColor,
}) => {
  const clamped = Math.max(0, Math.min(1, fraction));
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const progressLen = circumference * clamped;

  return (
    <Svg width={size} height={size}>
      {/* start at 12 o'clock */}
      <G rotation={-90} origin={`${cx}, ${cy}`}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="butt"
          strokeDasharray={`${progressLen} ${Math.max(0, circumference - progressLen)}`}
          strokeDashoffset={0}
        />
      </G>
    </Svg>
  );
};

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onBack }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  const expensePercent = 70;
  const incomePercent = 30;

  return (
    <View style={styles.wrapper}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Аналитика</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Summary Card with Chart */}
        <View style={styles.summaryCard}>
          <View style={styles.chartContainer}>
            <View style={styles.donutWrap}>
              <DonutChart
                size={120}
                strokeWidth={22}
                fraction={incomePercent / 100}
                trackColor={DONUT_TRACK_COLOR}
                progressColor={DONUT_PROGRESS_COLOR}
              />
            </View>
          </View>
          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryLabel}>Расходы</Text>
            <Text style={styles.summaryPercent}>{expensePercent}%</Text>
            <Text style={[styles.summaryLabel, styles.incomeLabel]}>Доходы</Text>
            <Text style={[styles.summaryPercent, styles.incomePercent]}>{incomePercent}%</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'expense' && styles.tabActive]}
            onPress={() => setActiveTab('expense')}
          >
            <Text style={[styles.tabText, activeTab === 'expense' && styles.tabTextActive]}>Расходы</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'income' && styles.tabActive]}
            onPress={() => setActiveTab('income')}
          >
            <Text style={[styles.tabText, activeTab === 'income' && styles.tabTextActive]}>Доходы</Text>
          </TouchableOpacity>
        </View>

        {/* Current Selection Percent */}
        <View style={styles.selectionPercentBadge}>
          <Text style={styles.selectionPercentText}>70%</Text>
        </View>

        {/* Categories Progress List */}
        <View style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <Text style={[styles.categoryTitle, { color: '#8B4513' }]}>Аренда жилья</Text>
            <Text style={styles.categoryPercent}>35%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '35%', backgroundColor: '#8B4513' }]} />
          </View>
          <Text style={styles.amountText}>12 500₽</Text>
        </View>

        <View style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <Text style={[styles.categoryTitle, { color: '#1D4981' }]}>Продукты</Text>
            <Text style={styles.categoryPercent}>55%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '55%', backgroundColor: '#1D4981' }]} />
          </View>
          <Text style={styles.amountText}>20 000₽</Text>
        </View>

        <View style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <Text style={[styles.categoryTitle, { color: '#000000' }]}>Ремонт</Text>
            <Text style={styles.categoryPercent}>10%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '10%', backgroundColor: '#FDEBD0' }]} />
          </View>
          <Text style={styles.amountText}>5 000₽</Text>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#788FAC',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#788FAC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    zIndex: 10,
  },
  backArrow: {
    fontSize: 32,
    color: '#000000',
    fontWeight: '400',
  },
  headerTitle: {
    flex: 1,
    fontSize: 42,
    fontWeight: '700',
    color: '#E8E0D4',
    textAlign: 'center',
    marginRight: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: '#1D4981',
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  chartContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4981',
  },
  donutTrack: {
    stroke: DONUT_TRACK_COLOR,
  },
  donutProgress: {
    stroke: DONUT_PROGRESS_COLOR,
  },
  summaryTextContainer: {
    marginLeft: 24,
    flex: 1,
  },
  summaryLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  summaryPercent: {
    fontSize: 20,
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 12,
    opacity: 0.8,
  },
  incomeLabel: {
    color: '#D4A373',
  },
  incomePercent: {
    color: '#D4A373',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FDEBD0',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#1D4981',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1D4981',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  selectionPercentBadge: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1D4981',
    marginBottom: 20,
  },
  selectionPercentText: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  categoryCard: {
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryPercent: {
    fontSize: 14,
    color: '#333',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  amountText: {
    fontSize: 13,
    color: '#333',
    textAlign: 'right',
    marginTop: 2,
  },
});

export default AnalyticsView;
