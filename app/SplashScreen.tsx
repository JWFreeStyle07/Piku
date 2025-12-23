import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Keep the native splash screen visible while we load resources
SplashScreen.preventAutoHideAsync();

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function AnimatedSplashScreen({ onFinish }: SplashScreenProps) {
  const [isReady, setIsReady] = useState(false);

  // Icon animations
  const iconScale = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const iconOpacity = useSharedValue(0);

  // Letter animations
  const letterP = useSharedValue(0);
  const letterI = useSharedValue(0);
  const letterK = useSharedValue(0);
  const letterU = useSharedValue(0);

  // Letter opacity
  const letterPOpacity = useSharedValue(0);
  const letterIOpacity = useSharedValue(0);
  const letterKOpacity = useSharedValue(0);
  const letterUOpacity = useSharedValue(0);

  // Pulsing animation
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    async function prepare() {
      try {
        // Load any resources here (fonts, images, etc.)
        // For example: await Font.loadAsync({...});
        
        // Simulate loading time or wait for actual resources
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Hide the native splash screen
        await SplashScreen.hideAsync();
        
        // Set ready to start animations
        setIsReady(true);
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // Icon animation - bouncy entrance with rotation
    iconOpacity.value = withTiming(1, { duration: 300 });
    iconScale.value = withSpring(1, {
      damping: 8,
      stiffness: 100,
      mass: 1,
    });
    iconRotation.value = withSequence(
      withTiming(360, { duration: 800, easing: Easing.out(Easing.cubic) }),
      withTiming(360, { duration: 0 })
    );

    // Letters animation - cascading wave effect
    const letterDelay = 200;

    // P
    setTimeout(() => {
      letterPOpacity.value = withTiming(1, { duration: 200 });
      letterP.value = withSequence(
        withSpring(1, { damping: 10, stiffness: 100 }),
        withSpring(0.95, { damping: 10, stiffness: 100 })
      );
    }, 800);

    // I
    setTimeout(() => {
      letterIOpacity.value = withTiming(1, { duration: 200 });
      letterI.value = withSequence(
        withSpring(1, { damping: 10, stiffness: 100 }),
        withSpring(0.95, { damping: 10, stiffness: 100 })
      );
    }, 800 + letterDelay);

    // K
    setTimeout(() => {
      letterKOpacity.value = withTiming(1, { duration: 200 });
      letterK.value = withSequence(
        withSpring(1, { damping: 10, stiffness: 100 }),
        withSpring(0.95, { damping: 10, stiffness: 100 })
      );
    }, 800 + letterDelay * 2);

    // U
    setTimeout(() => {
      letterUOpacity.value = withTiming(1, { duration: 200 });
      letterU.value = withSequence(
        withSpring(1, { damping: 10, stiffness: 100 }),
        withSpring(0.95, { damping: 10, stiffness: 100 })
      );
    }, 800 + letterDelay * 3);

    // Gentle pulse after all animations complete
    setTimeout(() => {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, 2400);

    // Call onFinish after total animation duration (3 seconds)
    if (onFinish) {
      setTimeout(() => {
        onFinish();
      }, 3000);
    }
  }, [isReady]);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotation.value}deg` },
    ],
    opacity: iconOpacity.value,
  }));

  const letterPStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - letterP.value) * -50 },
      { scale: letterP.value },
    ],
    opacity: letterPOpacity.value,
  }));

  const letterIStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - letterI.value) * -50 },
      { scale: letterI.value },
    ],
    opacity: letterIOpacity.value,
  }));

  const letterKStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - letterK.value) * -50 },
      { scale: letterK.value },
    ],
    opacity: letterKOpacity.value,
  }));

  const letterUStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: (1 - letterU.value) * -50 },
      { scale: letterU.value },
    ],
    opacity: letterUOpacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (!isReady) {
    return null; // Show nothing while native splash screen is visible
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.contentContainer, pulseAnimatedStyle]}>
        {/* Icon - 216x216 */}
        <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
          <Image
            source={require('../assets/images/splash-icon.png')} 
            style={styles.icon}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Letters */}
        <View style={styles.lettersContainer}>
          <Animated.Text style={[styles.letter, letterPStyle]}>P</Animated.Text>
          <Animated.Text style={[styles.letter, letterIStyle]}>I</Animated.Text>
          <Animated.Text style={[styles.letter, letterKStyle]}>K</Animated.Text>
          <Animated.Text style={[styles.letter, letterUStyle]}>U</Animated.Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFB703',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 216,
    height: 216,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.05,
  },
  icon: {
    width: 216,
    height: 216,
  },
  lettersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: SCREEN_WIDTH * 0.15,
    color: '#000000',
    marginHorizontal: SCREEN_WIDTH * 0.015,
  },
});