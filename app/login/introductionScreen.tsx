import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db, storage } from '../../firebase/firebaseConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function IntroductionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get account info from navigation params with fallbacks
  const photoPath = (params.photoPath as string) || 'beanDestroyer';
  const defaultUserName = (params.name as string) || '';
  const defaultNickname = (params.nickname as string) || '';
  
  const [userName, setUserName] = useState(defaultUserName);
  const [nickname, setNickname] = useState(defaultNickname);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  // Map photo paths to actual require() calls
  const getPhotoSource = (path: string) => {
    const photos: { [key: string]: any } = {
      'beanDestroyer': require('../../assets/images/login/beanDestroyer.png'),
      'gremlinHam': require('../../assets/images/login/gremlinHam.png'),
      'skibidiCatlord': require('../../assets/images/login/skibidiCatlord.png'),
      'ohioChase': require('../../assets/images/login/ohioChase.png'),
    };
    return photos[path];
  };

  const pickImage = async () => {
    try {
      if (!ImagePicker.launchImageLibraryAsync) {
        Alert.alert(
          'Feature Unavailable',
          'Image picker is not available. Please make sure expo-image-picker is properly installed.\n\nRun: npx expo install expo-image-picker',
          [{ text: 'OK' }]
        );
        return;
      }

      if (ImagePicker.requestMediaLibraryPermissionsAsync) {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
          Alert.alert('Permission Required', 'Please allow access to your photo library to select a profile picture.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Error', 
        'Failed to pick image. Please ensure expo-image-picker is installed:\n\nnpx expo install expo-image-picker\n\nThen restart: npx expo start --clear'
      );
    }
  };

  const uploadImageToFirebase = async (uri: string, userId: string): Promise<string> => {
    try {
      console.log('Starting image upload for:', userId);
      
      const response = await fetch(uri);
      const blob = await response.blob();
      console.log('Blob created, size:', blob.size);

      const fileName = `${userId}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `profilePhotos/${fileName}`);
      console.log('Storage ref created:', fileName);

      const uploadResult = await uploadBytes(storageRef, blob);
      console.log('Upload successful:', uploadResult);

      const downloadURL = await getDownloadURL(storageRef);
      console.log('Download URL obtained:', downloadURL);
      return downloadURL;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      throw error;
    }
  };

  const checkExistingUser = async (userName: string) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userName', '==', userName));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
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

  const showSuccessAnimation = (callback: () => void) => {
    setShowSuccess(true);
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.spring(checkmarkScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(callback, 1500);
      });
    });
  };

  const saveUserToFirebase = async () => {
    if (!userName.trim() || !nickname.trim()) {
      Alert.alert('Error', 'Please fill in both username and nickname');
      return;
    }

    setIsLoading(true);

    try {
      // Check if user already exists
      const existingUser = await checkExistingUser(userName);
      
      if (existingUser.exists) {
        // User already exists, just sign them in
        console.log('User already exists, signing in:', existingUser.userId);
        
        setIsLoading(false);
        
        showSuccessAnimation(() => {
          setShowSuccess(false);
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
        });
        
        return;
      }

      // User doesn't exist, create new account
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      let photoURL = '';

      if (selectedImage) {
        console.log('Uploading selected image...');
        try {
          photoURL = await uploadImageToFirebase(selectedImage, userId);
          console.log('Image uploaded successfully');
        } catch (uploadError: any) {
          console.error('Upload failed:', uploadError);
          
          let errorMessage = 'Failed to upload profile photo. ';
          if (uploadError?.code === 'storage/unauthorized') {
            errorMessage += 'Please check Firebase Storage permissions.';
          } else if (uploadError?.code === 'storage/unknown') {
            errorMessage += 'Check your Firebase Storage configuration and rules.';
          } else {
            errorMessage += uploadError?.message || 'Unknown error';
          }
          
          Alert.alert('Upload Error', errorMessage);
          setIsLoading(false);
          return;
        }
      }

      // Save new user data to Firestore
      const userRef = doc(collection(db, 'users'), userId);
      await setDoc(userRef, {
        userId: userId,
        userName: userName,
        nickname: nickname,
        photoURL: photoURL || '',
        defaultPhotoPath: photoPath || 'beanDestroyer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log('New user saved successfully:', userId);
      
      setIsLoading(false);

      // Show success animation then navigate
      showSuccessAnimation(() => {
        setShowSuccess(false);
        router.push({
          pathname: '../../createEvent/eventMaker',
          params: {
            userId: userId,
            photoPath: photoPath,
            photoURL: photoURL,
            name: userName,
            nickname: nickname,
          },
        });
      });

    } catch (error) {
      console.error('Error saving user:', error);
      Alert.alert('Error', 'Failed to save user data. Please try again.');
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    saveUserToFirebase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {showSuccess && (
          <View style={styles.successOverlay}>
            <Animated.View
              style={[
                styles.successCircle,
                {
                  transform: [{ scale: successScale }],
                  opacity: successOpacity,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.checkmarkContainer,
                  {
                    transform: [{ scale: checkmarkScale }],
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={SCREEN_WIDTH * 0.2}
                  color="#000000"
                />
              </Animated.View>
            </Animated.View>
            <Animated.Text
              style={[
                styles.successText,
                {
                  opacity: successOpacity,
                },
              ]}
            >
              Successfully Signed In
            </Animated.Text>
          </View>
        )}

        {/* Profile Photo */}
        <TouchableOpacity 
          style={styles.photoContainer}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          <Image
            source={selectedImage ? { uri: selectedImage } : getPhotoSource(photoPath)}
            style={styles.photo}
            resizeMode="cover"
          />
          <View style={styles.cameraOverlay}>
            <MaterialCommunityIcons name="camera" size={24} color="#FFB703" />
          </View>
        </TouchableOpacity>
        
        <Text style={styles.photoHint}>Tap to change photo</Text>

        {/* Username Rectangle (Editable) */}
        <TouchableOpacity
          style={styles.infoRectangle}
          onPress={() => setIsEditingUsername(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="account-circle"
            size={24}
            color="#8B8C83"
            style={styles.icon}
          />
          {isEditingUsername ? (
            <TextInput
              style={styles.usernameInput}
              value={userName}
              onChangeText={setUserName}
              onBlur={() => setIsEditingUsername(false)}
              autoFocus
              placeholderTextColor="#8B8C83"
              placeholder="Enter username"
            />
          ) : (
            <Text style={styles.infoText}>{userName}</Text>
          )}
        </TouchableOpacity>

        {/* Nickname Rectangle (Editable) */}
        <TouchableOpacity
          style={styles.nicknameRectangle}
          onPress={() => setIsEditingNickname(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="at"
            size={24}
            color="#8B8C83"
            style={styles.icon}
          />
          {isEditingNickname ? (
            <TextInput
              style={styles.nicknameInput}
              value={nickname}
              onChangeText={setNickname}
              onBlur={() => setIsEditingNickname(false)}
              autoFocus
              placeholderTextColor="#8B8C83"
              placeholder="Enter nickname"
            />
          ) : (
            <Text style={styles.infoText}>{nickname}</Text>
          )}
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity 
          style={[styles.continueButton, isLoading && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
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
  photoContainer: {
    width: SCREEN_WIDTH * 0.369,
    height: SCREEN_WIDTH * 0.379,
    marginTop: SCREEN_HEIGHT * 0.13,
    borderWidth: 3,
    borderColor: '#FFB703',
    borderRadius: 368,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 368,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFB703',
  },
  photoHint: {
    marginTop: 8,
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#8B8C83',
  },
  infoRectangle: {
    width: SCREEN_WIDTH * 0.798,
    height: 69,
    marginTop: SCREEN_HEIGHT * 0.024,
    backgroundColor: '#292A24',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  nicknameRectangle: {
    width: SCREEN_WIDTH * 0.798,
    height: 69,
    marginTop: 9,
    backgroundColor: '#292A24',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    marginRight: 15,
  },
  infoText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#E4D7D1',
  },
  usernameInput: {
    flex: 1,
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#E4D7D1',
    padding: 0,
  },
  nicknameInput: {
    flex: 1,
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#E4D7D1',
    padding: 0,
  },
  continueButton: {
    width: SCREEN_WIDTH * 0.93,
    height: 73,
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.093,
    backgroundColor: '#E5A602',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 30,
    color: '#000000',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successCircle: {
    width: SCREEN_WIDTH * 0.4,
    height: SCREEN_WIDTH * 0.4,
    borderRadius: SCREEN_WIDTH * 0.2,
    backgroundColor: '#E5A602',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    marginTop: SCREEN_HEIGHT * 0.03,
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: SCREEN_WIDTH * 0.045,
    color: '#FFFFFC',
    textAlign: 'center',
  },
});