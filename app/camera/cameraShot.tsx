
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
// import React, { useRef, useState } from 'react';
// import {
//   Alert,
//   Animated,
//   Dimensions,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { storage } from '../../firebase/firebaseConfig';

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// export default function CameraShot() {
//   const router = useRouter();
//   const params = useLocalSearchParams();
  
//   const eventId = params.eventId as string;
//   const eventName = params.eventName as string;
//   const userId = params.userId as string;

//   const cameraRef = useRef<any>(null);
//   const [permission, requestPermission] = useCameraPermissions();
//   const [facing, setFacing] = useState<'front' | 'back'>('front');
//   const [flash, setFlash] = useState<'off' | 'on'>('off');
//   const [lastPhoto, setLastPhoto] = useState<string | null>(null);
//   const [isCapturing, setIsCapturing] = useState(false);

//   // Animation values
//   const flashOpacity = useRef(new Animated.Value(0)).current;
//   const photoScale = useRef(new Animated.Value(1)).current;
//   const photoRotation = useRef(new Animated.Value(0)).current;
//   const photoTranslateX = useRef(new Animated.Value(0)).current;
//   const photoTranslateY = useRef(new Animated.Value(0)).current;

//   if (!permission) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.permissionText}>Requesting camera permission...</Text>
//       </View>
//     );
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.permissionText}>Camera permission is required</Text>
//         <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
//           <Text style={styles.permissionButtonText}>Grant Permission</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const handleClose = () => {
//     router.back();
//   };

//   const handleQRCode = () => {
//     router.push({
//       pathname: '../../createEvent/eventQR',
//       params: {
//         eventId: eventId,
//         eventName: eventName,
//         userId: userId,
//       },
//     });
//   };

//   const toggleFlash = () => {
//     setFlash(flash === 'off' ? 'on' : 'off');
//   };

//   const toggleCameraFacing = () => {
//     setFacing(current => (current === 'back' ? 'front' : 'back'));
//   };

//   const animateFlash = () => {
//     Animated.sequence([
//       Animated.timing(flashOpacity, {
//         toValue: 1,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//       Animated.timing(flashOpacity, {
//         toValue: 0,
//         duration: 100,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const animatePhotoToThumbnail = () => {
//     // Reset animations
//     photoScale.setValue(1);
//     photoRotation.setValue(0);
//     photoTranslateX.setValue(0);
//     photoTranslateY.setValue(0);

//     // Calculate target position (left side of shutter button)
//     const targetX = -SCREEN_WIDTH * 0.35;
//     const targetY = 0;

//     Animated.parallel([
//       Animated.spring(photoScale, {
//         toValue: 0.2,
//         useNativeDriver: true,
//       }),
//       Animated.spring(photoRotation, {
//         toValue: -10,
//         useNativeDriver: true,
//       }),
//       Animated.spring(photoTranslateX, {
//         toValue: targetX,
//         useNativeDriver: true,
//       }),
//       Animated.spring(photoTranslateY, {
//         toValue: targetY,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const uploadPhotoToFirebase = async (uri: string): Promise<string> => {
//     try {
//       const response = await fetch(uri);
//       const blob = await response.blob();

//       const fileName = `${eventId}_${userId}_${Date.now()}.jpg`;
//       const storageRef = ref(storage, `eventPhotos/${eventId}/${fileName}`);

//       await uploadBytes(storageRef, blob);
//       const downloadURL = await getDownloadURL(storageRef);
      
//       console.log('Photo uploaded successfully:', downloadURL);
//       return downloadURL;
//     } catch (error) {
//       console.error('Error uploading photo:', error);
//       throw error;
//     }
//   };

//   const takePicture = async () => {
//     if (!cameraRef.current || isCapturing) return;

//     try {
//       setIsCapturing(true);

//       const photo = await cameraRef.current.takePictureAsync({
//         quality: 0.8,
//         base64: false,
//       });

//       console.log('Photo captured:', photo.uri);

//       // Animate flash
//       animateFlash();

//       // Upload to Firebase
//       const downloadURL = await uploadPhotoToFirebase(photo.uri);

//       // Set as last photo and animate
//       setLastPhoto(downloadURL);
//       setTimeout(() => {
//         animatePhotoToThumbnail();
//       }, 200);

//     } catch (error) {
//       console.error('Error taking picture:', error);
//       Alert.alert('Error', 'Failed to capture photo. Please try again.');
//     } finally {
//       setIsCapturing(false);
//     }
//   };

//   const handleThumbnailPress = () => {
//     router.push({
//       pathname: '../../camera/imageGallery',
//       params: {
//         eventId: eventId,
//         eventName: eventName,
//         userId: userId,
//       },
//     });
//   };

//   const photoRotate = photoRotation.interpolate({
//     inputRange: [0, 360],
//     outputRange: ['0deg', '360deg'],
//   });

//   return (
//     <View style={styles.container}>
//       {/* Full Screen Camera */}
//       <CameraView
//         ref={cameraRef}
//         style={styles.camera}
//         facing={facing}
//         enableTorch={flash === 'on'}
//       />

//       {/* Overlay Container - All UI elements with absolute positioning */}
//       <View style={styles.overlayContainer} pointerEvents="box-none">
//         {/* White Flash Overlay */}
//         <Animated.View
//           style={[
//             styles.flashOverlay,
//             {
//               opacity: flashOpacity,
//             },
//           ]}
//           pointerEvents="none"
//         />

//         {/* Header */}
//         <View style={styles.header} pointerEvents="box-none">
//           {/* Close Button */}
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={handleClose}
//             activeOpacity={0.7}
//           >
//             <MaterialCommunityIcons
//               name="close"
//               size={28}
//               color="#FFFFFC"
//             />
//           </TouchableOpacity>

//           {/* Event Name */}
//           <Text style={styles.eventName} numberOfLines={1}>
//             {eventName}
//           </Text>

//           {/* QR Code Button */}
//           <TouchableOpacity
//             style={styles.qrButton}
//             onPress={handleQRCode}
//             activeOpacity={0.7}
//           >
//             <MaterialCommunityIcons
//               name="qrcode"
//               size={28}
//               color="#FFFFFC"
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Flash Toggle Button */}
//         <TouchableOpacity
//           style={styles.flashButton}
//           onPress={toggleFlash}
//           activeOpacity={0.7}
//         >
//           <MaterialCommunityIcons
//             name={flash === 'off' ? 'flash-off' : 'flash'}
//             size={28}
//             color={flash === 'off' ? '#000000' : '#FFB703'}
//           />
//         </TouchableOpacity>

//         {/* Bottom Controls */}
//         <View style={styles.bottomControls} pointerEvents="box-none">
//           {/* Thumbnail Preview */}
//           {lastPhoto && (
//             <TouchableOpacity
//               style={styles.thumbnailContainer}
//               onPress={handleThumbnailPress}
//               activeOpacity={0.8}
//             >
//               <Animated.View
//                 style={[
//                   styles.thumbnailAnimated,
//                   {
//                     transform: [
//                       { scale: photoScale },
//                       { rotate: photoRotate },
//                       { translateX: photoTranslateX },
//                       { translateY: photoTranslateY },
//                     ],
//                   },
//                 ]}
//               >
//                 <Image
//                   source={{ uri: lastPhoto }}
//                   style={styles.thumbnail}
//                   resizeMode="cover"
//                 />
//               </Animated.View>
//             </TouchableOpacity>
//           )}

//           {/* Shutter Button Container */}
//           <View style={styles.shutterContainer} pointerEvents="box-none">
//             <TouchableOpacity
//               style={styles.shutterButton}
//               onPress={takePicture}
//               activeOpacity={0.8}
//               disabled={isCapturing}
//             >
//               <View style={styles.shutterInner} />
//             </TouchableOpacity>
//           </View>

//           {/* Camera Flip Button */}
//           <TouchableOpacity
//             style={styles.flipButton}
//             onPress={toggleCameraFacing}
//             activeOpacity={0.7}
//           >
//             <MaterialCommunityIcons
//               name="sync"
//               size={24}
//               color="#000000"
//             />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000000',
//   },
//   camera: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     width: SCREEN_WIDTH,
//     height: SCREEN_HEIGHT,
//   },
//   overlayContainer: {
//     ...StyleSheet.absoluteFillObject,
//     zIndex: 10,
//   },
//   flashOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: '#FFFFFF',
//     zIndex: 20,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: SCREEN_WIDTH * 0.048,
//     paddingTop: SCREEN_HEIGHT * 0.06,
//     height: 100,
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 15,
//   },
//   closeButton: {
//     width: 40,
//     height: 40,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   eventName: {
//     flex: 1,
//     fontFamily: 'Poppins',
//     fontStyle: 'normal',
//     fontWeight: '800',
//     fontSize: 21,
//     lineHeight: 32,
//     color: '#FFFFFC',
//     textAlign: 'center',
//     marginHorizontal: 10,
//     textShadowColor: 'rgba(0, 0, 0, 0.75)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 3,
//   },
//   qrButton: {
//     width: 40,
//     height: 40,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   flashButton: {
//     position: 'absolute',
//     left: SCREEN_WIDTH * 0.8383,
//     top: SCREEN_HEIGHT * 0.1418,
//     width: 40,
//     height: 40,
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 15,
//   },
//   bottomControls: {
//     position: 'absolute',
//     bottom: SCREEN_HEIGHT * 0.0665,
//     left: 0,
//     right: 0,
//     height: SCREEN_HEIGHT * 0.1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     zIndex: 15,
//   },
//   thumbnailContainer: {
//     position: 'absolute',
//     left: 35,
//     width: 73,
//     height: 74,
//   },
//   thumbnailAnimated: {
//     width: '100%',
//     height: '100%',
//   },
//   thumbnail: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 55,
//     borderWidth: 2,
//     borderColor: '#FFB703',
//   },
//   shutterContainer: {
//     width: SCREEN_WIDTH * 0.2314,
//     height: SCREEN_WIDTH * 0.2314,
//     backgroundColor: '#221C1C',
//     borderWidth: 3,
//     borderColor: '#E5A602',
//     borderRadius: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   shutterButton: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   shutterInner: {
//     width: '75%',
//     height: '75%',
//     backgroundColor: '#E5A602',
//     borderRadius: 50,
//   },
//   flipButton: {
//     position: 'absolute',
//     right: SCREEN_WIDTH * 0.1592,
//     width: SCREEN_WIDTH * 0.1269,
//     height: SCREEN_WIDTH * 0.1269,
//     backgroundColor: '#8B8C83',
//     borderRadius: 45,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   permissionText: {
//     fontFamily: 'Poppins',
//     fontSize: 18,
//     color: '#FFFFFC',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   permissionButton: {
//     backgroundColor: '#E5A602',
//     paddingHorizontal: 30,
//     paddingVertical: 15,
//     borderRadius: 50,
//   },
//   permissionButtonText: {
//     fontFamily: 'Poppins',
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#000000',
//   },
// });
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
  const photoScale = useRef(new Animated.Value(1)).current;
  const photoRotation = useRef(new Animated.Value(0)).current;
  const photoTranslateX = useRef(new Animated.Value(0)).current;
  const photoTranslateY = useRef(new Animated.Value(0)).current;

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleClose = () => {
    router.back();
  };

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

  const animatePhotoToThumbnail = () => {
    // Reset animations
    photoScale.setValue(1);
    photoRotation.setValue(0);
    photoTranslateX.setValue(0);
    photoTranslateY.setValue(0);

    // Calculate target position (left side of shutter button)
    const targetX = -SCREEN_WIDTH * 0.35;
    const targetY = 0;

    // Wiggle animation (rotate back and forth)
    Animated.sequence([
      Animated.parallel([
        Animated.spring(photoTranslateX, {
          toValue: targetX,
          useNativeDriver: true,
        }),
        Animated.spring(photoTranslateY, {
          toValue: targetY,
          useNativeDriver: true,
        }),
      ]),
      // Wiggle effect
      Animated.sequence([
        Animated.timing(photoRotation, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(photoRotation, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(photoRotation, {
          toValue: 5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(photoRotation, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
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

      // Set as last photo and animate
      setLastPhoto(downloadURL);
      setTimeout(() => {
        animatePhotoToThumbnail();
      }, 200);

    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleThumbnailPress = () => {
    router.push({
      pathname: '../../camera/imageGallery',
      params: {
        eventId: eventId,
        eventName: eventName,
        userId: userId,
      },
    });
  };

  const photoRotate = photoRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

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
          {/* Thumbnail Preview */}
          {lastPhoto && (
            <TouchableOpacity
              style={styles.thumbnailContainer}
              onPress={handleThumbnailPress}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.thumbnailAnimated,
                  {
                    transform: [
                      { scale: photoScale },
                      { rotate: photoRotate },
                      { translateX: photoTranslateX },
                      { translateY: photoTranslateY },
                    ],
                  },
                ]}
              >
                <Image
                  source={{ uri: lastPhoto }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              </Animated.View>
            </TouchableOpacity>
          )}

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
  thumbnailContainer: {
    position: 'absolute',
    left: 35,
    width: 73,
    height: 74,
  },
  thumbnailAnimated: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#FFB703',
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
  permissionText: {
    fontFamily: 'Poppins',
    fontSize: 18,
    color: '#FFFFFC',
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#E5A602',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 50,
  },
  permissionButtonText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});