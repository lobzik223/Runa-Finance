import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddStockView from './AddStockView';
import AssetDetailsView from './AssetDetailsView';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface InvestmentsViewProps {
  onBack?: () => void;
  onNavigate?: (screen: 'main' | 'deposits' | 'goals' | 'investments' | 'profile') => void;
}

const InvestmentsView: React.FC<InvestmentsViewProps> = ({ onBack, onNavigate }) => {
  const insets = useSafeAreaInsets();
  const [showAddStock, setShowAddStock] = useState(false);
  const [showAssetDetails, setShowAssetDetails] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string>('');

  if (showAssetDetails) {
    return (
      <AssetDetailsView
        onBack={() => setShowAssetDetails(false)}
        assetName={selectedAsset}
      />
    );
  }

  if (showAddStock) {
    return (
      <AddStockView
        onBack={() => setShowAddStock(false)}
      />
    );
  }

  // Graph data points (values in range 0-2000)
  const graphData = [
    { month: 'Apr', value: 200 },
    { month: 'May', value: 600 },
    { month: 'Jun', value: 1000 },
    { month: 'Jul', value: 800 },
    { month: 'Aug', value: 1400 },
    { month: 'Sep', value: 1800 },
  ];

  const graphHeight = 180;
  const graphWidth = SCREEN_WIDTH - 100;
  const maxY = 2000;
  const yAxisValues = [0, 400, 800, 1000, 1700, 2000];

  return (
    <View style={[styles.wrapper, { 
      marginTop: -insets.top, 
      marginBottom: -insets.bottom 
    }]}>
      <View style={styles.backgroundOverlay} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 60 }]}>
        <View style={styles.headerPlaceholder} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Инвестиции</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Investment Graph Card */}
        <View style={styles.graphCard}>
          <View style={styles.graphContainer}>
            {/* Y-axis labels */}
            <View style={styles.yAxisLabels}>
              <Text style={styles.yAxisLabel}>2000</Text>
              <Text style={styles.yAxisLabel}>1700</Text>
              <Text style={styles.yAxisLabel}>1000</Text>
              <Text style={styles.yAxisLabel}>800</Text>
              <Text style={styles.yAxisLabel}>400</Text>
              <Text style={styles.yAxisLabel}>0</Text>
            </View>
            
            {/* Graph area */}
            <View style={styles.graphArea}>
              {/* Grid lines */}
              {yAxisValues.map((value) => {
                const yPosition = graphHeight - (value / maxY) * graphHeight;
                return (
                  <View
                    key={value}
                    style={[
                      styles.gridLine,
                      {
                        top: yPosition,
                      },
                    ]}
                  />
                );
              })}
              
              {/* Graph line */}
              <View style={styles.graphLineContainer}>
                {graphData.map((data, index) => {
                  if (index === 0) return null;
                  const prevData = graphData[index - 1];
                  const x1 = ((index - 1) / 5) * graphWidth;
                  const y1 = graphHeight - (prevData.value / maxY) * graphHeight;
                  const x2 = (index / 5) * graphWidth;
                  const y2 = graphHeight - (data.value / maxY) * graphHeight;
                  
                  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
                  
                  return (
                    <View
                      key={index}
                      style={[
                        styles.graphLineSegment,
                        {
                          left: x1,
                          top: y1,
                          width: length,
                          transform: [{ rotate: `${angle}deg` }],
                        },
                      ]}
                    />
                  );
                })}
                
                {/* Graph points */}
                {graphData.map((data, index) => {
                  const x = (index / 5) * graphWidth;
                  const y = graphHeight - (data.value / maxY) * graphHeight;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.graphPoint,
                        {
                          left: x - 4,
                          top: y - 4,
                        },
                      ]}
                    />
                  );
                })}
              </View>
              
              {/* X-axis labels */}
              <View style={styles.xAxisLabels}>
                {graphData.map((data) => (
                  <Text key={data.month} style={styles.xAxisLabel}>
                    {data.month}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Investment Performance Cards */}
        <View style={styles.investmentCards}>
          {/* Yandex Card */}
          <TouchableOpacity 
            style={styles.investmentCard}
            onPress={() => {
              setSelectedAsset('Яндекс');
              setShowAssetDetails(true);
            }}
          >
            <Text style={styles.investmentName}>Яндекс</Text>
            <Text style={styles.investmentAmount}>150 000₽</Text>
            <Text style={styles.investmentChangePositive}>+ 4 250₽ (2,84%)</Text>
          </TouchableOpacity>

          {/* Sberbank Card */}
          <TouchableOpacity 
            style={styles.investmentCard}
            onPress={() => {
              setSelectedAsset('Сбербанк');
              setShowAssetDetails(true);
            }}
          >
            <Text style={styles.investmentName}>Сбербанк</Text>
            <Text style={styles.investmentAmount}>150 000₽</Text>
            <Text style={styles.investmentChangeNegative}>- 1 500₽ (0,75%)</Text>
          </TouchableOpacity>
        </View>

        {/* Add Stock Button */}
        <TouchableOpacity 
          style={styles.addStockButton}
          onPress={() => setShowAddStock(true)}
        >
          <Text style={styles.addStockButtonText}>Добавить акцию</Text>
        </TouchableOpacity>

        {/* Stock Market News Section */}
        <View style={styles.newsSection}>
          <Text style={styles.newsSectionTitle}>Новости фондового рынка</Text>
          
          {/* News Card 1 */}
          <View style={styles.newsCard}>
            <Text style={styles.newsText}>
              Росстат сообщил об историческом росте индекса
            </Text>
          </View>

          {/* News Card 2 */}
          <View style={styles.newsCard}>
            <Text style={styles.newsText}>
              Банк России опубликовал прогноз ключевой ставки...
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNavContainer, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={[styles.navItem, styles.navItemCredit]} 
            onPress={() => onNavigate ? onNavigate('main') : onBack?.()}
          >
            <Image 
              source={require('../icon/home.png')} 
              style={[styles.navIconImage, styles.navIconImageCreditPosition]}
            />
            <Text style={[styles.navLabel, styles.navLabelCreditPosition]}>Главная</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navItem, styles.navItemCredit, styles.navItemCreditDeposits]}
            onPress={() => onNavigate?.('deposits')}
          >
            <Image 
              source={require('../icon/credit.png')} 
              style={[styles.navIconImageCredit, styles.navIconImageCreditPositionDeposits]}
            />
            <Text style={[styles.navLabel, styles.navLabelCreditPositionDeposits]}>Вклады</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navItem, styles.navItemCredit]}
            onPress={() => onNavigate?.('goals')}
          >
            <Image 
              source={require('../icon/analiz.png')} 
              style={[styles.navIconImage, styles.navIconImageCreditPosition]}
            />
            <Text style={[styles.navLabel, styles.navLabelCreditPosition]}>Цели</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, styles.navItemCredit]}>
            <Image 
              source={require('../icon/invist.png')} 
              style={[styles.navIconImage, styles.navIconImageCreditPosition]}
            />
            <Text style={[styles.navLabel, styles.navLabelActive, styles.navLabelCreditPosition]}>Инвестиции</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navItem, styles.navItemCredit]}
            onPress={() => onNavigate?.('profile')}
          >
            <Image 
              source={require('../icon/profile.png')} 
              style={[styles.navIconImage, styles.navIconImageCreditPosition]}
            />
            <Text style={[styles.navLabel, styles.navLabelCreditPosition]}>Профиль</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    height: SCREEN_HEIGHT * 2,
    backgroundColor: '#788FAC',
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1,
  },
  headerPlaceholder: {
    width: 40,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E8E0D4',
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  graphCard: {
    backgroundColor: '#A8C5E0',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  graphContainer: {
    flexDirection: 'row',
    height: 220,
  },
  yAxisLabels: {
    width: 40,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
  },
  graphArea: {
    flex: 1,
    height: 200,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#D4C5B0',
    opacity: 0.3,
  },
  graphLineContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  graphLineSegment: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#1D4981',
  },
  graphPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1D4981',
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  xAxisLabel: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '500',
  },
  investmentCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  investmentCard: {
    flex: 1,
    backgroundColor: '#E8E0D4',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  investmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  investmentAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#A0522D',
    marginBottom: 4,
  },
  investmentChangePositive: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  investmentChangeNegative: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E53935',
  },
  addStockButton: {
    backgroundColor: '#1D4981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addStockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  newsSection: {
    marginBottom: 20,
  },
  newsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4981',
    marginBottom: 16,
  },
  newsCard: {
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
  newsText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
    lineHeight: 22,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 16,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1D4981',
    borderRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 8,
    width: '100%',
    maxWidth: SCREEN_WIDTH - 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  navIconCreditPosition: {
    marginTop: -2,
    marginBottom: 2,
  },
  navIconImage: {
    width: 32,
    height: 32,
    marginBottom: 4,
    tintColor: '#FFFFFF',
  },
  navIconImageCredit: {
    width: 36,
    height: 36,
    marginBottom: 4,
    tintColor: '#FFFFFF',
  },
  navIconImageCreditPosition: {
    marginTop: -2,
    marginBottom: 2,
  },
  navIconImageCreditPositionDeposits: {
    marginTop: -4,
    marginBottom: 0,
  },
  navItemCredit: {
    paddingTop: 2,
  },
  navItemCreditDeposits: {
    paddingTop: 0,
  },
  navLabelCreditPosition: {
    marginTop: -2,
  },
  navLabelCreditPositionDeposits: {
    marginTop: 0,
  },
  navLabel: {
    fontSize: SCREEN_WIDTH < 375 ? 9 : 11,
    color: '#FFFFFF',
    opacity: 0.6,
    textAlign: 'center',
  },
  navLabelActive: {
    opacity: 1,
    fontWeight: '600',
  },
});

export default InvestmentsView;

