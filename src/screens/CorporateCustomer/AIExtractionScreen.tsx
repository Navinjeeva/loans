import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";

const AnimatedG = Animated.createAnimatedComponent(G);
import { useTheme } from "@src/common/ThemeContext";
import { useDispatch } from "react-redux";
import { applyExtraction } from "@src/store/corporate";

// ── SVG icon set (color is required; callers pass theme tokens) ──
type IconProps = { size?: number; color: string; stroke?: number };
const SvgBase = ({
  size = 14,
  color,
  stroke = 1.75,
  children,
}: IconProps & { children: React.ReactNode }) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </Svg>
);

const GlobeIcon = (p: IconProps) => (
  <SvgBase {...p}>
    <Circle cx={12} cy={12} r={9} />
    <Path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
  </SvgBase>
);
const HashIcon = (p: IconProps) => (
  <SvgBase {...p}>
    <Path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />
  </SvgBase>
);
const MapPinIcon = (p: IconProps) => (
  <SvgBase {...p}>
    <Path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z" />
    <Circle cx={12} cy={10} r={2.5} />
  </SvgBase>
);
const FactoryIcon = (p: IconProps) => (
  <SvgBase {...p}>
    <Path d="M3 21V10l6 4V10l6 4V8l6 3v10z" />
    <Path d="M3 21h18M8 21v-4M13 21v-4" />
  </SvgBase>
);
const UsersIcon = (p: IconProps) => (
  <SvgBase {...p}>
    <Circle cx={9} cy={8} r={3} />
    <Path d="M3 19c0-3 2.7-5 6-5s6 2 6 5" />
    <Path d="M16 5.2a3 3 0 0 1 0 5.6M21 19c0-2.3-1.3-4-3.5-4.6" />
  </SvgBase>
);
const IdCardIcon = (p: IconProps) => (
  <SvgBase {...p}>
    <Rect x={3} y={5} width={18} height={14} rx={2} />
    <Circle cx={8.5} cy={11} r={2} />
    <Path d="M5.5 16c.6-1.6 4.4-1.6 5 0" />
    <Path d="M14 9.5h4M14 12.5h4M14 15.5h2.5" />
  </SvgBase>
);
const ChartIcon = (p: IconProps) => (
  <SvgBase {...p}>
    <Path d="M3 3v18h18" />
    <Rect x={7} y={11} width={3} height={6} rx={0.6} />
    <Rect x={12} y={7} width={3} height={10} rx={0.6} />
    <Rect x={17} y={13} width={3} height={4} rx={0.6} />
  </SvgBase>
);
const BriefcaseIcon = (p: IconProps) => (
  <SvgBase {...p}>
    <Rect x={3} y={7} width={18} height={13} rx={2} />
    <Path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <Path d="M3 13h18" />
  </SvgBase>
);
const DocIcon = (p: IconProps) => (
  <SvgBase {...p}>
    <Path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <Path d="M14 3v5h5" />
    <Path d="M9 13h6M9 16h4" />
  </SvgBase>
);
const CheckCircleIcon = (p: IconProps) => (
  <SvgBase {...p}>
    <Circle cx={12} cy={12} r={9} />
    <Path d="M8.5 12.5l2.5 2.5 4.5-5" />
  </SvgBase>
);
const LockIcon = (p: IconProps) => (
  <SvgBase {...p}>
    <Rect x={5} y={11} width={14} height={9} rx={2} />
    <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </SvgBase>
);

const EXTRACT_STEPS: { label: string; Icon: (p: IconProps) => JSX.Element }[] = [
  { label: "Identifying company classification", Icon: GlobeIcon },
  { label: "Verifying company identity & name", Icon: DocIcon },
  { label: "Fetching CIN / registration number", Icon: HashIcon },
  { label: "Collecting registered office details", Icon: MapPinIcon },
  { label: "Detecting operational office location", Icon: FactoryIcon },
  { label: "Identifying directors & shareholders", Icon: UsersIcon },
  { label: "Fetching company PAN & GST details", Icon: IdCardIcon },
  { label: "Collecting financial information", Icon: ChartIcon },
  { label: "Preparing loan onboarding profile", Icon: BriefcaseIcon },
];

// Total animation completes in ~1.5s (8 steps × 150ms + small finish delays).
const STEP_INTERVAL = 500;
const DONE_DELAY = 500;
const NAV_DELAY = 500;

const AIExtractionScreen = ({ onDone }: { onDone: () => void }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const dispatch = useDispatch();
  const [active, setActive] = useState(0);
  const [done, setDone] = useState(false);

  // continuous spin for the active step's ring
  const spinRef = useRef(new Animated.Value(0)).current;

  // vertical scanning line on the hero icon
  const scanRef = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinRef, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: false, // SVG <G rotation={animated}> requires JS driver
      }),
    );
    const scan = Animated.loop(
      Animated.timing(scanRef, {
        toValue: 1,
        duration: 1300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    spin.start();
    scan.start();
    return () => {
      spin.stop();
      scan.stop();
    };
  }, [scanRef, spinRef]);

  useEffect(() => {
    let i = 0;
    const tick = setInterval(() => {
      i += 1;
      if (i >= EXTRACT_STEPS.length) {
        clearInterval(tick);
        setActive(EXTRACT_STEPS.length);
        setTimeout(() => setDone(true), DONE_DELAY);
        setTimeout(() => {
          dispatch(applyExtraction());
          onDone();
        }, NAV_DELAY);
      } else {
        setActive(i);
      }
    }, STEP_INTERVAL);
    return () => clearInterval(tick);
  }, []);

  const pct = Math.min(Math.round((active / EXTRACT_STEPS.length) * 100), 100);
  const currentLabel = done ? "All details collected" : EXTRACT_STEPS[Math.min(active, EXTRACT_STEPS.length - 1)].label;

  // numeric rotation (degrees) for SVG <G rotation={...} />
  const spinDegNum = spinRef.interpolate({ inputRange: [0, 1], outputRange: [0, 360] });

  // scan moves from 15% → 85% of the 64-tall hero icon via translateY (native-driver friendly)
  const scanTranslateY = scanRef.interpolate({
    inputRange: [0, 1],
    outputRange: [9.6, 54.4],
  });

  const scanOpacity = scanRef.interpolate({
    inputRange: [0, 0.25, 0.75, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>

        {/* Hero */}
        <View style={styles.heroSection}>

          <View style={styles.heroIcon}>
             {!done && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    opacity: scanOpacity,
                    transform: [{ translateY: scanTranslateY }],
                  },
                ]}
              />
            )}

            {done ? (
              <CheckCircleIcon size={35} color={colors.brand600} stroke={2} />
            ) : (
              <DocIcon size={35} color={colors.brand600} stroke={2} />
            )}
          </View>

          <Text style={styles.heroTitle}>Setting up your application</Text>
          <Text style={styles.heroDesc}>
            We're securely collecting your company information.
          </Text>
        </View>

        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel} numberOfLines={1}>
              {currentLabel}
            </Text>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` }]} />
          </View>
        </View>

        {/* Steps */}
        <View style={styles.stepList}>

          {EXTRACT_STEPS.map((s, i) => {

            const state = i < active ? "done" : i === active ? "active" : "idle";
            const iconColor = state === "idle" ? colors.faint : colors.brand600;

            return (
              <View
                key={i}
                style={[ styles.stepRow,
                  state === "active" && { backgroundColor: colors.brandTint },
                  { opacity: state === "idle" ? 0.5 : 1 },
                ]}
              >
                <View
                  style={[
                    styles.stepIconBox,
                    {
                      backgroundColor:
                        state === "done"
                          ? colors.brandTint
                          : state === "active"
                          ? colors.card
                          : colors.buttonDisabledBackground,
                    },
                  ]}
                >
                  {state === "active" && (
                    <View style={styles.activeRing} pointerEvents="none">
                      <Svg width={40} height={40} viewBox="0 0 40 40">
                        {/* faint full track */}
                        <Circle
                          cx={20}
                          cy={20}
                          r={18}
                          stroke={colors.brandBorder}
                          strokeWidth={2.5}
                          fill="none"
                        />
                        {/* spinning arc — rotated -90 so it starts at TOP, then animated */}
                        <AnimatedG
                          rotation={spinDegNum as unknown as number}
                          originX={20}
                          originY={20}
                        >
                          <Circle
                            cx={20}
                            cy={20}
                            r={18}
                            stroke={colors.brand}
                            strokeWidth={2.5}
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${0.28 * 2 * Math.PI * 18} ${
                              2 * Math.PI * 18
                            }`}
                            rotation={-90}
                            originX={20}
                            originY={20}
                          />
                        </AnimatedG>
                      </Svg>
                    </View>
                  )}
                  <s.Icon size={18} color={iconColor} stroke={2} />
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: state === "idle" ? colors.muted : colors.ink,
                      fontWeight: state === "idle" ? "500" : "600",
                    },
                  ]}
                >
                  {s.label}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />
        <View style={styles.securityNote}>
          <LockIcon size={12} color={colors.faint} stroke={1.75} />
          <Text style={styles.securityText}>
            Securely sourced from public business registries
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AIExtractionScreen;

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1 },
    content: {
      flex: 1,
      paddingTop: 20,
      paddingHorizontal: 20,
      paddingBottom: 24,
      minHeight: "70%",
    },
    heroSection: { alignItems: "center", marginBottom: 20 },
    heroIcon: {
      width: 74,
      height: 78,
      borderRadius: 16,
      backgroundColor: colors.brandTint,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
      marginBottom: 14,
      overflow: "hidden",
      position: "relative",
    },
    scanLine: {
      position: "absolute",
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: colors.brand,
      opacity: 0.85,
    },
    heroTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.ink,
      letterSpacing: -0.3,
      textAlign: "center",
    },
    heroDesc: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 4,
      lineHeight: 18,
      textAlign: "center",
    },
    progressSection: { marginBottom: 18 },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 7,
    },
    progressLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.ink2,
      flex: 1,
      marginRight: 8,
    },
    progressPct: {
      fontSize: 11.5,
      fontWeight: "600",
      color: colors.buttonPrimaryHover,
      flexShrink: 0,
    },
    progressTrack: {
      height: 6,
      borderRadius: 99,
      backgroundColor: colors.hairline,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: colors.brand,
      borderRadius: 99,
    },
    stepList: { gap: 6 },
    stepRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
      paddingVertical: 9,
      paddingHorizontal: 11,
      borderRadius: 11,
    },
    stepIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      position: "relative",
    },
    activeRing: {
      position: "absolute",
      top: -2,
      left: -2,
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    stepLabel: { flex: 1, fontSize: 12.5 },
    securityNote: {
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      marginTop: 18,
    },
    securityText: {
      fontSize: 11,
      color: colors.faint,
      fontWeight: "500",
      textAlign: "center",
    },
  });
