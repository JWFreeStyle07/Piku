import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock Google accounts - Replace with actual Google Sign-In data
const mockGoogleAccounts = [
  {
    id: '1',
    email: 'beandestroyer@gmail.com',
    name: 'Bean Destroyer',
    photo: 'https://via.placeholder.com/50',
  },
  {
    id: '2',
    email: 'gremlinham@gmail.com',
    name: 'Gremlin Ham',
    photo: 'https://via.placeholder.com/50',
  },
];

export default function OnBoard() {
  const [showModal, setShowModal] = useState(false);
  
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

  const handleSignInPress = () => {
    // Animate logo to smaller size and move up
    logoScale.value = withSpring(0.8);
    logoTranslateY.value = withSpring(-80);
    
    // Show modal with delay for smooth animation
    setTimeout(() => setShowModal(true), 100);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Reset logo animation
    logoScale.value = withSpring(1);
    logoTranslateY.value = withSpring(0);
  };

  const handleAccountSelect = async (account: any) => {
    console.log('Selected account:', account);
    // TODO: Implement Google Sign-In verification
    // This will trigger the native Google authentication flow
  };

  const renderGoogleAccount = (account: any, index: number, total: number) => {
    const isFirst = index === 0;
    const isLast = index === total - 1;
    
    let borderRadiusStyle;
    if (isFirst && isLast) {
      borderRadiusStyle = { borderRadius: 40 };
    } else if (isFirst) {
      borderRadiusStyle = { borderTopLeftRadius: 40, borderTopRightRadius: 40, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 };
    } else if (isLast) {
      borderRadiusStyle = { borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 };
    } else {
      borderRadiusStyle = { borderRadius: 10 };
    }

    return (
      <TouchableOpacity
        key={account.id}
        style={[styles.accountContainer, borderRadiusStyle]}
        onPress={() => handleAccountSelect(account)}
      >
        <Image source={{ uri: account.photo }} style={styles.accountPhoto} />
        <View style={styles.accountTextContainer}>
          <Text style={styles.accountEmail}>{account.email}</Text>
          <Text style={styles.accountSubtext}>
            {account.name} • Sign in with Google
          </Text>
        </View>
      </TouchableOpacity>
    );
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
        <TouchableOpacity style={styles.signInButton} onPress={handleSignInPress}>
          <Text style={styles.signInButtonText}>Sign In with Google</Text>
        </TouchableOpacity>
      </View>

      {/* Google Sign-In Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View style={styles.modalContent}>
                {/* Google Icon Container */}
                <View style={styles.googleIconContainer}>
                  <Image
                    source={require('../../assets/images/login/googleIcon.png')}
                    style={styles.googleIcon}
                  />
                </View>

                {/* Modal Title */}
                <Text style={styles.modalTitle}>Sign in with Google</Text>

                {/* Modal Subtitle */}
                <Text style={styles.modalSubtitle}>Choose a sign-in for Piku</Text>

                {/* Google Accounts List */}
                <ScrollView
                  style={styles.accountsList}
                  showsVerticalScrollIndicator={false}
                >
                  {mockGoogleAccounts.map((account, index) =>
                    renderGoogleAccount(account, index, mockGoogleAccounts.length)
                  )}
                </ScrollView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
    width: SCREEN_WIDTH * 0.466, // ~187px on 401px screen
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
    width: SCREEN_WIDTH * 0.488, // ~196px on 401px screen
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
    width: SCREEN_WIDTH * 0.93, // ~373px on 401px screen
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.713, // ~592px on 830px screen
    backgroundColor: '#423733',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 34,
    alignItems: 'center',
  },
  googleIconContainer: {
    width: 39,
    height: 37,
    backgroundColor: '#FFFFFC',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    width: 33,
    height: 32,
  },
  modalTitle: {
    marginTop: 7,
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 15,
    lineHeight: 22,
    color: '#F5F5F5',
  },
  modalSubtitle: {
    marginTop: 25,
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 30,
    color: '#F5F5F5',
  },
  accountsList: {
    width: '100%',
    marginTop: 24,
    paddingHorizontal: SCREEN_WIDTH * 0.087, // ~35px on 401px screen
  },
  accountContainer: {
    width: '100%',
    height: 71,
    backgroundColor: '#312823',
    marginBottom: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SCREEN_WIDTH * 0.095, // ~38px on 401px screen
  },
  accountPhoto: {
    width: 33,
    height: 34,
    borderRadius: 368,
  },
  accountTextContainer: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  accountEmail: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 18,
    color: '#E4D7D1',
  },
  accountSubtext: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 18,
    color: '#D9D0CB',
  },
});