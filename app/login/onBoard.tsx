// import { useRouter } from 'expo-router';
// import { collection, getDocs, query, where } from 'firebase/firestore';
// import React, { useState } from 'react';
// import {
//   Dimensions,
//   Image,
//   Modal,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
// } from 'react-native';
// import Animated, {
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring
// } from 'react-native-reanimated';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { db } from '../../firebase/firebaseConfig';

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // Mock Google accounts - Replace with actual Google Sign-In data
// const mockGoogleAccounts = [
//   {
//     id: '1',
//     email: 'beandestroyer@gmail.com',
//     name: 'Bean Destroyer',
//     photo: require('../../assets/images/login/beanDestroyer.png'),
//     photoPath: 'beanDestroyer',
//   },
//   {
//     id: '2',
//     email: 'gremlinham@gmail.com',
//     name: 'Gremlin Ham',
//     photo: require('../../assets/images/login/gremlinHam.png'),
//     photoPath: 'gremlinHam',
//   },
//   {
//     id: '3',
//     email: 'skibidicatlord@gmail.com',
//     name: 'Skibidi Catlord',
//     photo: require('../../assets/images/login/skibidiCatlord.png'),
//     photoPath: 'skibidiCatlord',
//   },
//   {
//     id: '4',
//     email: 'ohiochase@gmail.com',
//     name: 'Ohio Chase',
//     photo: require('../../assets/images/login/ohioChase.png'),
//     photoPath: 'ohioChase',
//   },
// ];

// export default function OnBoard() {
//   const [showModal, setShowModal] = useState(false);
//   const router = useRouter();
  
//   // Animated values
//   const logoScale = useSharedValue(1);
//   const logoTranslateY = useSharedValue(0);

//   // Animated styles for logo container (scales the whole container including the image inside)
//   const animatedLogoContainerStyle = useAnimatedStyle(() => {
//     return {
//       transform: [
//         { scale: logoScale.value },
//         { translateY: logoTranslateY.value },
//       ],
//     };
//   });

//   const handleSignInPress = () => {
//     // Animate logo to smaller size and move up more
//     logoScale.value = withSpring(0.6);
//     logoTranslateY.value = withSpring(-150);
    
//     // Show modal with delay for smooth animation
//     setTimeout(() => setShowModal(true), 100);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     // Reset logo animation
//     logoScale.value = withSpring(1);
//     logoTranslateY.value = withSpring(0);
//   };

//   const checkExistingUser = async (userName: string) => {
//     try {
//       const usersRef = collection(db, 'users');
//       const q = query(usersRef, where('userName', '==', userName));
//       const querySnapshot = await getDocs(q);
      
//       if (!querySnapshot.empty) {
//         // User exists, return the user data
//         const userData = querySnapshot.docs[0].data();
//         return {
//           exists: true,
//           userId: userData.userId,
//           userName: userData.userName,
//           nickname: userData.nickname,
//           photoURL: userData.photoURL,
//           defaultPhotoPath: userData.defaultPhotoPath,
//         };
//       }
      
//       return { exists: false };
//     } catch (error) {
//       console.error('Error checking existing user:', error);
//       return { exists: false };
//     }
//   };

//   const handleAccountSelect = async (account: any) => {
//     console.log('Selected account:', account);
    
//     // Define nicknames for each account
//     const nicknames: { [key: string]: string } = {
//       '1': 'Beany',
//       '2': 'Gremmy',
//       '3': 'Skibby',
//       '4': 'Chase',
//     };
    
//     // Close modal first
//     handleCloseModal();
    
//     // Check if user already exists
//     const existingUser = await checkExistingUser(account.name);
    
//     if (existingUser.exists) {
//       // User exists, navigate directly to event maker with existing user data
//       console.log('Existing user found, signing in:', existingUser.userId);
//       router.push({
//         pathname: '../../createEvent/eventMaker',
//         params: {
//           userId: existingUser.userId,
//           photoPath: existingUser.defaultPhotoPath,
//           photoURL: existingUser.photoURL || '',
//           name: existingUser.userName,
//           nickname: existingUser.nickname,
//         },
//       });
//     } else {
//       // User doesn't exist, navigate to introduction screen for account creation
//       console.log('New user, navigating to introduction screen');
//       router.push({
//         pathname: '../../login/introductionScreen',
//         params: {
//           photoPath: account.photoPath,
//           name: account.name,
//           nickname: nicknames[account.id],
//         },
//       });
//     }
//   };

//   const handleSignInOptions = () => {
//     handleCloseModal();
//     // Navigate to introduction screen with empty params for custom account
//     router.push({
//       pathname: '../../login/introductionScreen',
//       params: {
//         photoPath: 'beanDestroyer', // Default photo
//         name: '', // Empty name for user to enter
//         nickname: '', // Empty nickname for user to enter
//       },
//     });
//   };

//   const renderGoogleAccount = (account: any, index: number, total: number) => {
//     const isFirst = index === 0;
//     const isLast = index === total - 1;
    
//     let borderRadiusStyle;
//     if (isFirst && isLast) {
//       borderRadiusStyle = { borderRadius: 40 };
//     } else if (isFirst) {
//       borderRadiusStyle = { borderTopLeftRadius: 40, borderTopRightRadius: 40, borderBottomLeftRadius: 10, borderBottomRightRadius: 10 };
//     } else if (isLast) {
//       borderRadiusStyle = { borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 };
//     } else {
//       borderRadiusStyle = { borderRadius: 10 };
//     }

//     return (
//       <TouchableOpacity
//         key={account.id}
//         style={[styles.accountContainer, borderRadiusStyle]}
//         onPress={() => handleAccountSelect(account)}
//       >
//         <Image source={account.photo} style={styles.accountPhoto} />
//         <View style={styles.accountTextContainer}>
//           <Text style={styles.accountEmail}>{account.email}</Text>
//           <Text style={styles.accountSubtext}>
//             {account.name} • Sign in with Google
//           </Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.content}>
//         {/* Logo Container with Border */}
//         <Animated.View style={[styles.logoContainer, animatedLogoContainerStyle]}>
//           {/* Logo Image */}
//           <Image
//             source={require('../../assets/images/login/loginIcon.png')}
//             style={styles.logoImage}
//           />
//         </Animated.View>

//         {/* App Title */}
//         <Text style={styles.title}>Piku</Text>

//         {/* Subtitle */}
//         <Text style={styles.subtitle}>Start capturing moments</Text>

//         {/* Sign In Button */}
//         <TouchableOpacity style={styles.signInButton} onPress={handleSignInPress}>
//           <Text style={styles.signInButtonText}>Sign In with Google</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Google Sign-In Modal */}
//       <Modal
//         visible={showModal}
//         transparent
//         animationType="slide"
//         onRequestClose={handleCloseModal}
//       >
//         <TouchableWithoutFeedback onPress={handleCloseModal}>
//           <View style={styles.modalOverlay}>
//             <TouchableWithoutFeedback>
//               <Animated.View style={styles.modalContent}>
//                 {/* Google Icon Container */}
//                 <View style={styles.googleIconContainer}>
//                   <Image
//                     source={require('../../assets/images/login/googleIcon.png')}
//                     style={styles.googleIcon}
//                   />
//                 </View>

//                 {/* Modal Title */}
//                 <Text style={styles.modalTitle}>Sign in with Google</Text>

//                 {/* Modal Subtitle */}
//                 <Text style={styles.modalSubtitle}>Choose a sign-in for Piku</Text>

//                 {/* Google Accounts List */}
//                 <ScrollView
//                   style={styles.accountsList}
//                   showsVerticalScrollIndicator={false}
//                 >
//                   {mockGoogleAccounts.map((account, index) =>
//                     renderGoogleAccount(account, index, mockGoogleAccounts.length)
//                   )}
//                 </ScrollView>

//                 {/* Sign-in Options Link */}
//                 <TouchableOpacity 
//                   style={styles.signInOptionsContainer}
//                   onPress={handleSignInOptions}
//                 >
//                   <Text style={styles.signInOptionsText}>Sign in a different account</Text>
//                 </TouchableOpacity>
//               </Animated.View>
//             </TouchableWithoutFeedback>
//           </View>
//         </TouchableWithoutFeedback>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000000',
//   },
//   content: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   logoContainer: {
//     width: SCREEN_WIDTH * 0.466,
//     height: SCREEN_WIDTH * 0.466,
//     backgroundColor: '#000000',
//     borderRadius: 58,
//     borderWidth: 3,
//     borderColor: '#FFB703',
//     alignSelf: 'center',
//     marginTop: SCREEN_HEIGHT * 0.15,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logoImage: {
//     width: SCREEN_WIDTH * 0.488,
//     height: SCREEN_WIDTH * 0.488,
//     borderRadius: 108,
//   },
//   title: {
//     marginTop: 20,
//     fontFamily: 'Poppins',
//     fontWeight: '700',
//     fontSize: 64,
//     lineHeight: 96,
//     color: '#FFB703',
//     textAlign: 'center',
//   },
//   subtitle: {
//     marginTop: SCREEN_HEIGHT * 0.15,
//     fontFamily: 'Poppins',
//     fontWeight: '500',
//     fontSize: 20,
//     lineHeight: 30,
//     color: '#FFFFFC',
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },
//   signInButton: {
//     width: SCREEN_WIDTH * 0.93,
//     height: 73,
//     marginTop: 30,
//     backgroundColor: '#E5A602',
//     borderRadius: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   signInButtonText: {
//     fontFamily: 'Poppins',
//     fontWeight: '500',
//     fontSize: 20,
//     lineHeight: 30,
//     color: '#000000',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     width: '100%',
//     height: SCREEN_HEIGHT * 0.713,
//     backgroundColor: '#423733',
//     borderTopLeftRadius: 35,
//     borderTopRightRadius: 35,
//     paddingTop: 34,
//     alignItems: 'center',
//   },
//   googleIconContainer: {
//     width: 39,
//     height: 37,
//     backgroundColor: '#FFFFFC',
//     borderRadius: 10,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   googleIcon: {
//     width: 33,
//     height: 32,
//   },
//   modalTitle: {
//     marginTop: 7,
//     fontFamily: 'Poppins',
//     fontWeight: '500',
//     fontSize: 15,
//     lineHeight: 22,
//     color: '#F5F5F5',
//   },
//   modalSubtitle: {
//     marginTop: 25,
//     fontFamily: 'Poppins',
//     fontWeight: '500',
//     fontSize: 20,
//     lineHeight: 30,
//     color: '#F5F5F5',
//   },
//   accountsList: {
//     width: '100%',
//     marginTop: 24,
//     paddingHorizontal: SCREEN_WIDTH * 0.087,
//   },
//   accountContainer: {
//     width: '100%',
//     height: 71,
//     backgroundColor: '#312823',
//     marginBottom: 3,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingLeft: SCREEN_WIDTH * 0.095,
//   },
//   accountPhoto: {
//     width: 33,
//     height: 34,
//     borderRadius: 368,
//   },
//   accountTextContainer: {
//     marginLeft: 16,
//     justifyContent: 'center',
//   },
//   accountEmail: {
//     fontFamily: 'Poppins',
//     fontWeight: '500',
//     fontSize: 12,
//     lineHeight: 18,
//     color: '#E4D7D1',
//   },
//   accountSubtext: {
//     fontFamily: 'Poppins',
//     fontWeight: '500',
//     fontSize: 12,
//     lineHeight: 18,
//     color: '#D9D0CB',
//   },
//   signInOptionsContainer: {
//     position: 'absolute',
//     left: 42,
//     bottom: 60,
//     paddingVertical: 10,
//   },
//   signInOptionsText: {
//     fontFamily: 'Poppins',
//     fontStyle: 'normal',
//     fontWeight: '500',
//     fontSize: 17,
//     lineHeight: 20,
//     color: '#E4B5A4',
//   },
// });
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
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
import { db } from '../../firebase/firebaseConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock Google accounts - Replace with actual Google Sign-In data
const mockGoogleAccounts = [
  {
    id: '1',
    email: 'beandestroyer@gmail.com',
    name: 'Bean Destroyer',
    photo: require('../../assets/images/login/beanDestroyer.png'),
    photoPath: 'beanDestroyer',
  },
  {
    id: '2',
    email: 'gremlinham@gmail.com',
    name: 'Gremlin Ham',
    photo: require('../../assets/images/login/gremlinHam.png'),
    photoPath: 'gremlinHam',
  },
  {
    id: '3',
    email: 'skibidicatlord@gmail.com',
    name: 'Skibidi Catlord',
    photo: require('../../assets/images/login/skibidiCatlord.png'),
    photoPath: 'skibidiCatlord',
  },
  {
    id: '4',
    email: 'ohiochase@gmail.com',
    name: 'Ohio Chase',
    photo: require('../../assets/images/login/ohioChase.png'),
    photoPath: 'ohioChase',
  },
];

export default function OnBoard() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  
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
    // Animate logo to smaller size and move up more
    logoScale.value = withSpring(0.6);
    logoTranslateY.value = withSpring(-150);
    
    // Show modal with delay for smooth animation
    setTimeout(() => setShowModal(true), 100);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Reset logo animation
    logoScale.value = withSpring(1);
    logoTranslateY.value = withSpring(0);
  };

  const checkExistingUser = async (userName: string) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userName', '==', userName));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // User exists, return the user data
        const userData = querySnapshot.docs[0].data();
        return {
          exists: true,
          userId: userData.userId,
          userName: userData.userName,
          nickname: userData.nickname,
          photoURL: userData.photoURL,
          defaultPhotoPath: userData.defaultPhotoPath,
        };
      }
      
      return { exists: false };
    } catch (error) {
      console.error('Error checking existing user:', error);
      return { exists: false };
    }
  };

  const handleAccountSelect = async (account: any) => {
    console.log('Selected account:', account);
    
    // Define nicknames for each account
    const nicknames: { [key: string]: string } = {
      '1': 'Beany',
      '2': 'Gremmy',
      '3': 'Skibby',
      '4': 'Chase',
    };
    
    // Close modal first
    handleCloseModal();
    
    // Check if user already exists
    const existingUser = await checkExistingUser(account.name);
    
    if (existingUser.exists) {
      // User exists, navigate directly to event maker with existing user data
      console.log('Existing user found, signing in:', existingUser.userId);
      router.push({
        pathname: '../../createEvent/eventMaker',
        params: {
          userId: existingUser.userId,
          photoPath: existingUser.defaultPhotoPath,
          photoURL: existingUser.photoURL || '',
          name: existingUser.userName,
          nickname: existingUser.nickname,
        },
      });
    } else {
      // User doesn't exist, navigate to introduction screen for account creation
      console.log('New user, navigating to introduction screen');
      router.push({
        pathname: '../../login/introductionScreen',
        params: {
          photoPath: account.photoPath,
          name: account.name,
          nickname: nicknames[account.id],
        },
      });
    }
  };

  const handleSignInOptions = () => {
    handleCloseModal();
    // Navigate to introduction screen with empty params for custom account
    router.push({
      pathname: '../../login/introductionScreen',
      params: {
        photoPath: 'defaultPhoto', // Default photo
        name: '', // Empty name for user to enter
        nickname: '', // Empty nickname for user to enter
      },
    });
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
        <Image source={account.photo} style={styles.accountPhoto} />
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
              <View style={styles.modalContent}>
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
                  contentContainerStyle={styles.accountsListContent}
                  showsVerticalScrollIndicator={false}
                >
                  {mockGoogleAccounts.map((account, index) =>
                    renderGoogleAccount(account, index, mockGoogleAccounts.length)
                  )}
                </ScrollView>

                {/* Sign-in Options Link - Now in the flow */}
                <View style={styles.signInOptionsWrapper}>
                  <TouchableOpacity 
                    style={styles.signInOptionsContainer}
                    onPress={handleSignInOptions}
                  >
                    <Text style={styles.signInOptionsText}>Sign in a different account</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.85,
    minHeight: SCREEN_HEIGHT * 0.6,
    backgroundColor: '#423733',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 34,
  },
  googleIconContainer: {
    width: 39,
    height: 37,
    backgroundColor: '#FFFFFC',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
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
    textAlign: 'center',
  },
  modalSubtitle: {
    marginTop: 25,
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 30,
    color: '#F5F5F5',
    textAlign: 'center',
  },
  accountsList: {
    width: '100%',
    marginTop: 24,
    paddingHorizontal: SCREEN_WIDTH * 0.087,
    flex: 1,
  },
  accountsListContent: {
    paddingBottom: 16,
  },
  accountContainer: {
    width: '100%',
    height: 71,
    backgroundColor: '#312823',
    marginBottom: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: SCREEN_WIDTH * 0.095,
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
  signInOptionsWrapper: {
    width: '100%',
    paddingHorizontal: 42,
    paddingVertical: 20,
    paddingBottom: Math.max(20, SCREEN_HEIGHT * 0.03),
  },
  signInOptionsContainer: {
    paddingVertical: 10,
  },
  signInOptionsText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 20,
    color: '#E4B5A4',
  },
});