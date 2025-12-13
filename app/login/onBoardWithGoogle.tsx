import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface UserInfo {
  name: string;
  email: string;
  picture: string;
}

export default function OnBoard() {
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  
  // Google Sign-In configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '942551126016-enj7tg1kbk0mgeobu4tbdna3ej3sphfn.apps.googleusercontent.com',
    iosClientId: '942551126016-enj7tg1kbk0mgeobu4tbdna3ej3sphfn.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });

  // Animated values
  const logoScale = useSharedValue(1);
  const logoTranslateY = useSharedValue(0);

  // Animated styles for logo container (scales the whole container including the image inside)
  const animatedLogoContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: logoScale.value },
        { translateY: logoTranslateY.value },
      ],
    };
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication) {
        getUserInfo(authentication.accessToken);
      }
    }
  }, [response]);

  const getUserInfo = async (token: string) => {
    try {
      const response = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const user = await response.json();
      setUserInfo(user);
      console.log('User Info:', user);
      
      // TODO: Navigate to main app or save user data
      Alert.alert('Success!', `Welcome ${user.name}!`);
    } catch (error) {
      console.error('Error getting user info:', error);
      Alert.alert('Error', 'Failed to get user information');
    }
  };

  const handleSignInPress = async () => {
    // Animate logo to smaller size and move up
    logoScale.value = withSpring(0.8);
    logoTranslateY.value = withSpring(-80);
    
    // Trigger Google Sign-In
    try {
      const result = await promptAsync();
      if (result?.type === 'success') {
        console.log('Google Sign-In successful');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
      // Reset animation on error
      logoScale.value = withSpring(1);
      logoTranslateY.value = withSpring(0);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Reset logo animation
    logoScale.value = withSpring(1);
    logoTranslateY.value = withSpring(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Container with Border */}
        <Animated.View style={[styles.logoContainer, animatedLogoContainerStyle]}>
          {/* Logo Image */}
          <Image
            source={require('../../assets/images/login/loginIcon.png')}
            style={styles.logoImage}
          />
        </Animated.View>

        {/* App Title */}
        <Text style={styles.title}>Piku</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>Start capturing moments</Text>

        {/* Sign In Button */}
        <TouchableOpacity 
          style={styles.signInButton} 
          onPress={handleSignInPress}
          disabled={!request}
        >
          <Text style={styles.signInButtonText}>Sign In with Google</Text>
        </TouchableOpacity>

        {/* Display user info if signed in */}
        {userInfo && (
          <View style={styles.userInfoContainer}>
            <Image source={{ uri: userInfo.picture }} style={styles.userPhoto} />
            <Text style={styles.userName}>{userInfo.name}</Text>
            <Text style={styles.userEmail}>{userInfo.email}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  logoContainer: {
    width: SCREEN_WIDTH * 0.466,
    height: SCREEN_WIDTH * 0.466,
    backgroundColor: '#000000',
    borderRadius: 58,
    borderWidth: 3,
    borderColor: '#FFB703',
    alignSelf: 'center',
    marginTop: SCREEN_HEIGHT * 0.15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: SCREEN_WIDTH * 0.488,
    height: SCREEN_WIDTH * 0.488,
    borderRadius: 108,
  },
  title: {
    marginTop: 20,
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 64,
    lineHeight: 96,
    color: '#FFB703',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: SCREEN_HEIGHT * 0.15,
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 30,
    color: '#FFFFFC',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  signInButton: {
    width: SCREEN_WIDTH * 0.93,
    height: 73,
    marginTop: 30,
    backgroundColor: '#E5A602',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 30,
    color: '#000000',
  },
  userInfoContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  userPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 18,
    color: '#FFB703',
    marginBottom: 5,
  },
  userEmail: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    color: '#FFFFFC',
  },
});