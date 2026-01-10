import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '../../firebase/firebaseConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CameraShot() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const eventId = params.eventId as string;
  const eventName = params.eventName as string;
  const userId = params.userId as string;

  const cameraRef = useRef<any>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [lastPhoto, setLastPhoto] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Animation values
  const flashOpacity = useRef(new Animated.Value(0)).current;

  const handleClose = () => {
    router.back();
  };

  // Loading state while checking permission
  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFB703" />
        </View>
      </SafeAreaView>
    );
  }

  // Permission not granted - show uniform permission UI
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="arrow-left" size={28} color="#FFFFFC" />
          </TouchableOpacity>

          <View style={styles.permissionContainer}>
            <MaterialCommunityIcons
              name="camera-off"
              size={80}
              color="#8B8C83"
              style={styles.permissionIcon}
            />
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionText}>
              We need access to your camera to take photos for the event.
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestPermission}
              activeOpacity={0.8}
            >
              <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleQRCode = () => {
    router.push({
      pathname: '../../createEvent/eventQR',
      params: {
        eventId: eventId,
        eventName: eventName,
        userId: userId,
      },
    });
  };

  const toggleFlash = () => {
    setFlash(flash === 'off' ? 'on' : 'off');
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const animateFlash = () => {
    Animated.sequence([
      Animated.timing(flashOpacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const uploadPhotoToFirebase = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileName = `${eventId}_${userId}_${Date.now()}.jpg`;
      const storageRef = ref(storage, `eventPhotos/${eventId}/${fileName}`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log('Photo uploaded successfully:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      console.log('Photo captured:', photo.uri);

      // Animate flash
      animateFlash();

      // Upload to Firebase
      const downloadURL = await uploadPhotoToFirebase(photo.uri);

      // Set as last photo (it will appear in the fixed position)
      setLastPhoto(downloadURL);

    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleGalleryPress = () => {
    router.push({
      pathname: '../../camera/imageGallery',
      params: {
        eventId: eventId,
        eventName: eventName,
        userId: userId,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Full Screen Camera */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={flash === 'on'}
      />

      {/* Overlay Container - All UI elements with absolute positioning */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {/* White Flash Overlay */}
        <Animated.View
          style={[
            styles.flashOverlay,
            {
              opacity: flashOpacity,
            },
          ]}
          pointerEvents="none"
        />

        {/* Header */}
        <View style={styles.header} pointerEvents="box-none">
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="close"
              size={28}
              color="#FFFFFC"
            />
          </TouchableOpacity>

          {/* Event Name */}
          <Text style={styles.eventName} numberOfLines={3}>
            {eventName}
          </Text>

          {/* QR Code Button */}
          <TouchableOpacity
            style={styles.qrButton}
            onPress={handleQRCode}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="qrcode"
              size={28}
              color="#FFFFFC"
            />
          </TouchableOpacity>
        </View>

        {/* Flash Toggle Button */}
        <TouchableOpacity
          style={styles.flashButton}
          onPress={toggleFlash}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={flash === 'off' ? 'flash-off' : 'flash'}
            size={28}
            color={flash === 'off' ? '#000000' : '#FFB703'}
          />
        </TouchableOpacity>

        {/* Bottom Controls */}
        <View style={styles.bottomControls} pointerEvents="box-none">
          {/* Gallery/Thumbnail Button - Left side */}
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handleGalleryPress}
            activeOpacity={0.8}
          >
            {lastPhoto ? (
              // Show captured image
              <Image
                source={{ uri: lastPhoto }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              // Show default circle with camera-burst icon
              <View style={styles.defaultGalleryIcon}>
                <MaterialCommunityIcons
                  name="camera-burst"
                  size={24}
                  color="#000000"
                />
              </View>
            )}
          </TouchableOpacity>

          {/* Shutter Button Container */}
          <View style={styles.shutterContainer} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.shutterButton}
              onPress={takePicture}
              activeOpacity={0.8}
              disabled={isCapturing}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>
          </View>

          {/* Camera Flip Button */}
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraFacing}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="sync"
              size={24}
              color="#000000"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SCREEN_WIDTH * 0.048,
    marginTop: SCREEN_HEIGHT * 0.018,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.1,
  },
  permissionIcon: {
    marginBottom: 20,
  },
  permissionTitle: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: 22,
    lineHeight: 33,
    color: '#FFFFFC',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#8B8C83',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: 280,
  },
  permissionButton: {
    width: SCREEN_WIDTH * 0.7,
    height: 54,
    backgroundColor: '#E5A602',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
  },
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    zIndex: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.048,
    paddingTop: SCREEN_HEIGHT * 0.06,
    height: 100,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 15,
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventName: {
    flex: 1,
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '800',
    fontSize: 21,
    lineHeight: 26,
    color: '#FFFFFC',
    textAlign: 'center',
    marginHorizontal: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  qrButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButton: {
    position: 'absolute',
    left: SCREEN_WIDTH * 0.8383,
    top: SCREEN_HEIGHT * 0.1418,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  bottomControls: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.0665,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
  },
  galleryButton: {
    position: 'absolute',
    left: SCREEN_WIDTH * 0.1592,
    width: SCREEN_WIDTH * 0.1269,
    height: SCREEN_WIDTH * 0.1269,
    borderRadius: 45,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#FFB703',
  },
  defaultGalleryIcon: {
    width: '100%',
    height: '100%',
    backgroundColor: '#8B8C83',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  shutterContainer: {
    width: SCREEN_WIDTH * 0.2314,
    height: SCREEN_WIDTH * 0.2314,
    backgroundColor: '#221C1C',
    borderWidth: 3,
    borderColor: '#E5A602',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: '75%',
    height: '75%',
    backgroundColor: '#E5A602',
    borderRadius: 50,
  },
  flipButton: {
    position: 'absolute',
    right: SCREEN_WIDTH * 0.1592,
    width: SCREEN_WIDTH * 0.1269,
    height: SCREEN_WIDTH * 0.1269,
    backgroundColor: '#8B8C83',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
});