import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@src/common/utils/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { colors } = useTheme();
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const route = state.routes[state.index];
  const nestedRouteName = getFocusedRouteNameFromRoute(route) ?? route.name;

  const allowedRoutes = [
    'Dashboard',
    'DASHBOARD',
    'iBranch',
    'Products',
    'More',
    'Account',
  ];

  if (!allowedRoutes.includes(nestedRouteName)) {
    return null;
  }
  const containerWidth = SCREEN_WIDTH - 40;
  const height = 70;
  const backgroundColor = '#4a4a4a'; // Use theme color or fallback to dark gray
  const activeColor = colors.primary || '#ef4444'; // Use theme primary color or fallback to red
  const inactiveColor = colors.text || '#ffffff'; // Use theme text color or fallback to white
  const circleSize = 60;
  const borderRadius = 48;

  const focusedIndex = state.index;
  const numTabs = state.routes.length;
  const tabWidth = containerWidth / numTabs;
  const centerX = containerWidth / 2;

  // Generate curved path with cut-out for center scan tab - exact match to design
  const generateCurvedPath = () => {
    const curveWidth = 110; // Curve width to match design
    const curveDepth = 55; // Deep curve to create semicircle effect
    const leftCurveStart = centerX - curveWidth / 2;
    const rightCurveEnd = centerX + curveWidth / 2;

    // Ensure curve doesn't go beyond container bounds
    const safeLeftStart = Math.max(borderRadius, leftCurveStart);
    const safeRightEnd = Math.min(containerWidth - borderRadius, rightCurveEnd);

    return `
      M ${borderRadius} 0
      L ${safeLeftStart} 0
      Q ${safeLeftStart + 10} 0 ${safeLeftStart + 20} ${curveDepth * 0.45}
      Q ${centerX} ${curveDepth} ${safeRightEnd - 20} ${curveDepth * 0.45}
      Q ${safeRightEnd - 10} 0 ${safeRightEnd} 0
      L ${containerWidth - borderRadius} 0
      Q ${containerWidth} 0 ${containerWidth} ${borderRadius}
      L ${containerWidth} ${height - borderRadius}
      Q ${containerWidth} ${height} ${containerWidth - borderRadius} ${height}
      L ${borderRadius} ${height}
      Q 0 ${height} 0 ${height - borderRadius}
      L 0 ${borderRadius}
      Q 0 0 ${borderRadius} 0
      Z
    `;
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[styles.container, { width: containerWidth, height: height }]}
      >
        {/* Curved background with cut-out for center scan tab */}
        <Svg
          width={containerWidth}
          height={height}
          style={StyleSheet.absoluteFillObject}
        >
          <Path d={generateCurvedPath()} fill={backgroundColor} />
        </Svg>

        {/* Always visible center scan tab (index 2) */}
        <TouchableOpacity
          style={styles.centerScanTab}
          onPress={() => {
            const route = state.routes[2];
            if (route) {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
            }
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.scanCircle, { backgroundColor: activeColor }]}>
            <View style={styles.circleBorder}>
              {state.routes[2] && (
                <View style={styles.activeIconContainer}>
                  {descriptors[state.routes[2].key].options.tabBarIcon({
                    focused: true,
                    color: '#ffffff',
                    size: 24,
                  })}
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {/* Tab items - static layout */}
        <View style={styles.tabsContainer}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            const isFocused = state.index === index;
            const isCenterTab = index === 2; // Center scan tab

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            // Hide center tab content since it has its own circle
            if (isCenterTab) {
              return (
                <TouchableOpacity
                  key={index}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={[styles.tab, { width: tabWidth }]}
                  activeOpacity={1}
                >
                  <View style={styles.centerTabPlaceholder} />
                </TouchableOpacity>
              );
            }

            // Regular tab styling - highlight selected tab
            const isSelected = isFocused;
            const iconColor = isSelected ? activeColor : inactiveColor;
            const textColor = isSelected ? activeColor : inactiveColor;

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[styles.tab, { width: tabWidth }]}
                activeOpacity={1}
              >
                <View style={styles.tabContent}>
                  <View style={styles.tabIconContainer}>
                    {options.tabBarIcon({
                      focused: isSelected,
                      color: iconColor,
                      size: 24,
                    })}
                  </View>
                  {label && typeof label === 'string' && (
                    <Text
                      style={[styles.tabLabel, { color: textColor }]}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  container: {
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 15,
  },
  centerScanTab: {
    position: 'absolute',
    top: -40,
    left: '50%',
    marginLeft: -40,
    zIndex: 10,
  },
  scanCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  circleBorder: {
    width: '90%',
    height: '90%',
    borderRadius: 36,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'center',
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  centerTabPlaceholder: {
    width: '100%',
    height: '100%',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconContainer: {
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CustomTabBar;
