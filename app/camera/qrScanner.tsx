import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../firebase/firebaseConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function QRScanner() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const userId = params.userId as string;
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const extractEventId = (url: string): string | null => {
    try {
      // Match patterns like https://piku.app/event/event_1766387542466_nunajjcko
      const match = url.match(/piku\.app\/event\/(event_\d+_[a-z0-9]+)/i);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting event ID:', error);
      return null;
    }
  };

  const fetchEventDetails = async (eventId: string) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      const eventSnap = await getDoc(eventRef);

      if (eventSnap.exists()) {
        const eventData = eventSnap.data();
        return {
          eventId: eventData.eventId,
          eventName: eventData.eventName,
          coverImageURL: eventData.coverImageURL,
          endDate: eventData.endDate,
          userId: eventData.userId,
          joinedUsers: eventData.joinedUsers || [],
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  };

  const joinEvent = async (eventId: string, userId: string) => {
    try {
      const eventRef = doc(db, 'events', eventId);
      
      // Add user to joinedUsers array if not already joined
      await updateDoc(eventRef, {
        joinedUsers: arrayUnion(userId),
      });

      console.log('User successfully joined event:', eventId);
      return true;
    } catch (error) {
      console.error('Error joining event:', error);
      return false;
    }
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || isProcessing) return;

    setScanned(true);
    setIsProcessing(true);

    console.log('QR Code scanned:', data);

    // Extract event ID from the scanned URL
    const eventId = extractEventId(data);

    if (!eventId) {
      Alert.alert(
        'Invalid QR Code',
        'This QR code is not a valid Piku event. Please scan a Piku event QR code.',
        [
          {
            text: 'Scan Again',
            onPress: () => {
              setScanned(false);
              setIsProcessing(false);
            },
          },
        ]
      );
      return;
    }

    // Fetch event details from Firebase
    const eventDetails = await fetchEventDetails(eventId);

    if (!eventDetails) {
      Alert.alert(
        'Event Not Found',
        'This event does not exist or has been deleted.',
        [
          {
            text: 'Scan Again',
            onPress: () => {
              setScanned(false);
              setIsProcessing(false);
            },
          },
        ]
      );
      return;
    }

    // Check if user is already joined or is the event creator
    if (eventDetails.userId === userId) {
      // User is the creator, just navigate
      setIsProcessing(false);
      router.push({
        pathname: '../../camera/cameraShot',
        params: {
          eventId: eventDetails.eventId,
          eventName: eventDetails.eventName,
          userId: userId,
        },
      });
      return;
    }

    // Check if already joined
    if (eventDetails.joinedUsers.includes(userId)) {
      // Already joined, just navigate
      setIsProcessing(false);
      router.push({
        pathname: '../../camera/cameraShot',
        params: {
          eventId: eventDetails.eventId,
          eventName: eventDetails.eventName,
          userId: userId,
        },
      });
      return;
    }

    // Join the event
    const joined = await joinEvent(eventId, userId);

    if (!joined) {
      Alert.alert(
        'Error',
        'Failed to join the event. Please try again.',
        [
          {
            text: 'Scan Again',
            onPress: () => {
              setScanned(false);
              setIsProcessing(false);
            },
          },
        ]
      );
      return;
    }

    // Successfully joined, navigate to the event camera screen
    setIsProcessing(false);
    Alert.alert(
      'Success!',
      `You've joined "${eventDetails.eventName}"`,
      [
        {
          text: 'OK',
          onPress: () => {
            router.push({
              pathname: '../../camera/cameraShot',
              params: {
                eventId: eventDetails.eventId,
                eventName: eventDetails.eventName,
                userId: userId,
              },
            });
          },
        },
      ]
    );
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFB703" />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
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
              We need access to your camera to scan QR codes.
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={28} color="#FFFFFC" />
        </TouchableOpacity>

        <Text style={styles.title}>Scan QR Code</Text>
        <Text style={styles.subtitle}>
          Point your camera at a Piku event QR code
        </Text>

        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          />
          
          {/* QR Code Frame Overlay */}
          <View style={styles.overlay}>
            <View style={styles.overlayTop} />
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scanArea}>
                {/* Corner borders */}
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
                
                {isProcessing && (
                  <View style={styles.processingContainer}>
                    <ActivityIndicator size="large" color="#FFB703" />
                    <Text style={styles.processingText}>Processing...</Text>
                  </View>
                )}
              </View>
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom} />
          </View>
        </View>

        <View style={styles.instructionsContainer}>
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={32}
            color="#FFB703"
            style={styles.instructionIcon}
          />
          <Text style={styles.instructionText}>
            Align the QR code within the frame
          </Text>
        </View>

        {scanned && !isProcessing && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color="#000000"
              style={styles.scanAgainIcon}
            />
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
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
  title: {
    fontFamily: 'Poppins',
    fontWeight: '800',
    fontSize: 28,
    lineHeight: 42,
    color: '#FFFFFC',
    textAlign: 'center',
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 20,
    color: '#8B8C83',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  cameraContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#FFB703',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  processingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 10,
  },
  processingText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#FFFFFC',
    marginTop: 10,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SCREEN_HEIGHT * 0.04,
    paddingHorizontal: SCREEN_WIDTH * 0.1,
  },
  instructionIcon: {
    marginRight: 12,
  },
  instructionText: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#FFFFFC',
    flex: 1,
  },
  scanAgainButton: {
    width: SCREEN_WIDTH * 0.5,
    height: 50,
    backgroundColor: '#E5A602',
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: SCREEN_HEIGHT * 0.03,
  },
  scanAgainIcon: {
    marginRight: 8,
  },
  scanAgainText: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: '#000000',
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
});