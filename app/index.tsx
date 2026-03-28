import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing, withRepeat, withSequence } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';
import { ArrowRight, Clock, Video, TrendingUp, Briefcase } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// ─── Animations ────────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, duration = 800, translateY = 30, style }: any) {
  const opacity = useSharedValue(0);
  const transY = useSharedValue(translateY);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration, easing: Easing.out(Easing.cubic) }));
    transY.value = withDelay(delay, withTiming(0, { duration, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: transY.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}

// ─── Main Landing Page ────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* Navigation Bar */}
        <Animated.View style={styles.navBar}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Briefcase color={COLORS.white} size={20} />
            </View>
            <Text style={styles.brand}>blindspot.</Text>
          </View>
          <Pressable style={styles.navBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.navBtnText}>Dashboard</Text>
          </Pressable>
        </Animated.View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <FadeIn delay={100}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>Senior Developer Intelligence Tool</Text>
            </View>
          </FadeIn>
          
          <FadeIn delay={300}>
            <Text style={styles.title}>
              Stop guessing your{'\n'}
              <Text style={styles.goldText}>true hourly value.</Text>
            </Text>
          </FadeIn>
          
          <FadeIn delay={500}>
            <Text style={styles.subtitle}>
              A premium time-tracking and financial analytics engine designed exclusively for elite technical consultants. Accurately measure effective rates across development execution and mandatory communication overhead.
            </Text>
          </FadeIn>
          
          <FadeIn delay={700}>
            <Pressable style={styles.ctaButton} onPress={() => router.push('/(tabs)')}>
              <Text style={styles.ctaText}>Launch Intelligence Dashboard</Text>
              <ArrowRight color={COLORS.bg} size={20} />
            </Pressable>
          </FadeIn>
        </View>

        {/* Feature Grid */}
        <View style={styles.featuresContainer}>
          <FadeIn delay={900}>
            <Text style={styles.sectionTitle}>Built for complex, modern consulting.</Text>
          </FadeIn>
          
          <View style={styles.features}>
            <FeatureCard 
              delay={1000} 
              icon={<Clock color={COLORS.gold} size={28} />} 
              title="Global PiP Time Tracking" 
              desc="Deploy an always-on-top micro timer (Picture-in-Picture) that persists across browser tabs to capture every billable coding minute frictionlessly." 
            />
            <FeatureCard 
              delay={1100} 
              icon={<Video color={COLORS.gold} size={28} />} 
              title="Automated Meet Syncing" 
              desc="Directly tracks background Google Meet sessions. Once the meeting ends, the tool classifies overhead automatically at your rate floor." 
            />
            <FeatureCard 
              delay={1200} 
              icon={<TrendingUp color={COLORS.gold} size={28} />} 
              title="Profitability Floor Engines" 
              desc="Calculate non-billable time against revenue dynamically. If your average effective rate drops below your accepted minimum floor, the system will warn you." 
            />
          </View>
        </View>

        {/* Footer */}
        <FadeIn delay={1400} style={styles.footer}>
          <Text style={styles.footerText}>© 2026 Blind Spot. High-Signal Tools for Senior Engineers.</Text>
        </FadeIn>

      </ScrollView>
    </View>
  );
}

// ─── Feature Card Component ───────────────────────────────────────────────
function FeatureCard({ delay, icon, title, desc }: any) {
  return (
    <FadeIn delay={delay} style={styles.featureCard}>
      <View style={styles.featureIconBox}>{icon}</View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </FadeIn>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isWeb ? '10%' : 24,
    paddingVertical: 32,
    width: '100%',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    backgroundColor: COLORS.fg,
    padding: 8,
    borderRadius: 8,
  },
  brand: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: COLORS.fg,
    letterSpacing: -0.5,
  },
  navBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  navBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: COLORS.fg,
  },
  hero: {
    alignItems: isWeb ? 'center' : 'flex-start',
    paddingHorizontal: isWeb ? '10%' : 24,
    paddingTop: isWeb ? 80 : 40,
    paddingBottom: 80,
    maxWidth: isWeb ? 1000 : '100%',
    alignSelf: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(197,160,89,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 24,
    gap: 8,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },
  badgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: COLORS.goldDark,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: isWeb ? 72 : 48,
    lineHeight: isWeb ? 85 : 56,
    color: COLORS.fg,
    textAlign: isWeb ? 'center' : 'left',
    marginBottom: 24,
  },
  goldText: {
    color: COLORS.goldDark,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: isWeb ? 20 : 16,
    lineHeight: isWeb ? 32 : 26,
    color: COLORS.muted,
    textAlign: isWeb ? 'center' : 'left',
    maxWidth: 700,
    marginBottom: 48,
  },
  ctaButton: {
    backgroundColor: COLORS.fg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 999,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  } as any,
  ctaText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: COLORS.bg,
    letterSpacing: 0.5,
  },
  featuresContainer: {
    paddingHorizontal: isWeb ? '10%' : 24,
    maxWidth: isWeb ? 1200 : '100%',
    alignSelf: 'center',
    width: '100%',
    paddingBottom: 80,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 28,
    color: COLORS.fg,
    marginBottom: 40,
    textAlign: isWeb ? 'center' : 'left',
  },
  features: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 24,
    justifyContent: 'space-between',
  },
  featureCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 32,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  } as any,
  featureIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(197,160,89,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 22,
    color: COLORS.fg,
    marginBottom: 12,
  },
  featureDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.muted,
  },
  footer: {
    marginTop: 60,
    paddingVertical: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: COLORS.muted,
  },
});
