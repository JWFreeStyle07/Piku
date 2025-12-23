import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useEffect, useRef, useState } from 'react';
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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db, storage } from '../../firebase/firebaseConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EditProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const userId = params.userId as string;
  
  const [nickname, setNickname] = useState('');
  const [profileImageUri, setProfileImageUri] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    if (!userId) {
      console.log('No userId provided');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Fetching profile for userId:', userId);
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setNickname(userData.nickname || '');
        setProfileImageUri(userData.photoURL || '');
        console.log('Profile loaded:', userData.nickname);
      } else {
        console.log('User document does not exist');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleChangeProfilePicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to change your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadProfileImageToFirebase = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileName = `${userId}_profile_${Date.now()}.jpg`;
      const storageRef = ref(storage, `profilePhotos/${fileName}`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  };

  const showSuccessAnimation = (message: string, callback: () => void) => {
    setSuccessMessage(message);
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
        setTimeout(() => {
          successScale.setValue(0);
          successOpacity.setValue(0);
          checkmarkScale.setValue(0);
          setShowSuccess(false);
          callback();
        }, 1500);
      });
    });
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('Error', 'Please enter a display name');
      return;
    }

    setIsSaving(true);

    try {
      let photoURL = profileImageUri;

      // Upload new profile image if changed
      if (profileImageUri && !profileImageUri.startsWith('https://')) {
        photoURL = await uploadProfileImageToFirebase(profileImageUri);
      }

      // Update user in Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        nickname: nickname.trim(),
        photoURL: photoURL,
        updatedAt: new Date().toISOString(),
      });

      setIsSaving(false);

      showSuccessAnimation('Successfully Saved Changes', () => {
        router.back();
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setIsSaving(false);
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'LOGOUT',
          style: 'destructive',
          onPress: async () => {
            try {
              await auth.signOut();
              router.replace('../../login/introductionScreen');
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'DELETE',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ]
    );
  };

  const confirmDeleteAccount = async () => {
    try {
      // Delete user document from Firestore
      await deleteDoc(doc(db, 'users', userId));

      // Delete user's profile image from Storage if exists
      if (profileImageUri && profileImageUri.startsWith('https://')) {
        try {
          const imageRef = ref(storage, profileImageUri);
          await deleteObject(imageRef);
        } catch (error) {
          console.log('Profile image already deleted or does not exist');
        }
      }

      // Delete user authentication
      const currentUser = auth.currentUser;
      if (currentUser) {
        await currentUser.delete();
      }

      showSuccessAnimation('Successfully Deleted Account', () => {
        router.replace('../../login/introductionScreen');
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert('Error', 'Failed to delete account. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFB703" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation Overlay */}
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
              {successMessage}
            </Animated.Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color="#FFFFFC"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFC" />
            ) : (
              <Text style={styles.saveText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Profile Picture */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: profileImageUri || 'https://via.placeholder.com/132' }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.editImageButton}
            onPress={handleChangeProfilePicture}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color="#FFFFFC"
            />
          </TouchableOpacity>
        </View>

        {/* Display Nickname */}
        <Text style={styles.displayNickname}>{nickname}</Text>

        {/* Display Name Section */}
        <Text style={styles.sectionLabel}>DISPLAY NAME</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="Enter your display name"
            placeholderTextColor="#8B8C83"
          />
        </View>

        {/* Manage Account Section */}
        <Text style={[styles.sectionLabel, styles.manageAccountLabel]}>
          MANAGE ACCOUNT
        </Text>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="logout"
            size={28}
            color="#FFFFFC"
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>Logout</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#8B8C83"
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDeleteAccount}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="delete-outline"
            size={28}
            color="#F81C1F"
            style={styles.actionIcon}
          />
          <Text style={styles.deleteText}>Delete Account</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#8B8C83"
            style={styles.chevronIcon}
          />
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.0372,
    marginTop: SCREEN_HEIGHT * 0.032,
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  saveText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '700',
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFC',
  },
  profileImageContainer: {
    width: 132,
    height: 136,
    alignSelf: 'center',
    marginTop: SCREEN_HEIGHT * 0.01,
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  profileImage: {
    width: 132,
    height: 136,
    borderRadius: 368,
    borderWidth: 3,
    borderColor: '#FFB703',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 0,
    width: 35,
    height: 33,
    backgroundColor: '#292A24',
    borderRadius: 24.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayNickname: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFC',
    textAlign: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  sectionLabel: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 12.5,
    lineHeight: 19,
    color: '#FFFFFC',
    marginLeft: SCREEN_WIDTH * 0.073,
    marginBottom: 10,
  },
  manageAccountLabel: {
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  inputContainer: {
    width: SCREEN_WIDTH * 0.883,
    height: 52,
    backgroundColor: '#292A24',
    borderRadius: 20,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  input: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFC',
    padding: 0,
  },
  actionButton: {
    width: SCREEN_WIDTH * 0.883,
    height: 52,
    backgroundColor: '#292A24',
    borderRadius: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  actionIcon: {
    marginRight: 7,
  },
  actionText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFC',
    flex: 1,
  },
  deleteText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 22,
    color: '#F81C1F',
    flex: 1,
  },
  chevronIcon: {
    marginLeft: 'auto',
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