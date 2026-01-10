import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EventQR() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const eventId = params.eventId as string;
  const eventName = params.eventName as string;
  const userId = params.userId as string;
  
  const qrRef = useRef<View>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Generate event URL/link
  const eventLink = `https://piku.app/event/${eventId}`;

  const handleClose = () => {
    router.push({
      pathname: '../../createEvent/eventMaker',
      params: {
        userId: userId,
      },
    });
  };

  const handleSaveQR = async () => {
    try {
      setIsSaving(true);

      if (!qrRef.current) {
        Alert.alert('Error', 'QR code not ready for saving.');
        setIsSaving(false);
        return;
      }

      // Capture the QR code as an image
      const uri = await captureRef(qrRef, {
        format: 'png',
        quality: 1.0,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Save or Share QR Code',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Error saving QR code:', error);
      Alert.alert('Error', 'Failed to save QR code. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareLink = async () => {
    try {
      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        // Share via native share sheet
        await Share.share({
          message: `Join my event "${eventName}"!\n\n${eventLink}`,
          url: eventLink,
          title: `Join ${eventName}`,
        });
      } else {
        // Fallback: Just copy to clipboard or show link
        Alert.alert(
          'Event Link',
          eventLink,
          [
            {
              text: 'Copy Link',
              onPress: async () => {
                // You can use expo-clipboard here
                Alert.alert('Copied!', 'Link copied to clipboard');
              },
            },
            { text: 'OK' },
          ]
        );
      }
    } catch (error) {
      console.error('Error sharing link:', error);
      Alert.alert('Error', 'Failed to share link. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="close"
            size={28}
            color="#000000"
          />
        </TouchableOpacity>

        {/* Event Ready Title */}
        <Text style={styles.title}>Event Ready !</Text>

        {/* Description */}
        <Text style={styles.description}>
          Share this QR. code with your friends{'\n'}to join your event. No download needed!
        </Text>

        {/* QR Code Container */}
        <View
          ref={qrRef}
          style={styles.qrContainer}
          collapsable={false}
        >
          <View style={styles.qrBox}>
            <QRCode
              value={eventLink}
              size={SCREEN_WIDTH * 0.6}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Tap to Save Text */}
        <TouchableOpacity onPress={handleSaveQR} activeOpacity={0.7}>
          <Text style={styles.tapToSaveText}>
            {isSaving ? 'Saving...' : 'Tap here to save QR code'}
          </Text>
        </TouchableOpacity>

        {/* Share Link Button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareLink}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="share-variant-outline"
            size={24}
            color="#000000"
            style={styles.shareIcon}
          />
          <Text style={styles.shareButtonText}>Share Link</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFB703',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: SCREEN_WIDTH * 0.053,
    top: SCREEN_HEIGHT * 0.043,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Protest Strike',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 40,
    lineHeight: 48,
    color: '#000000',
    marginTop: SCREEN_HEIGHT * 0.13,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: '#000000',
    marginTop: 8,
    maxWidth: 262,
  },
  qrContainer: {
    marginTop: SCREEN_HEIGHT * 0.04,
  },
  qrBox: {
    width: SCREEN_WIDTH * 0.743,
    height: SCREEN_WIDTH * 0.753,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tapToSaveText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 17,
    lineHeight: 26,
    color: '#000000',
    marginTop: SCREEN_HEIGHT * 0.02,
    textAlign: 'center',
  },
  shareButton: {
    width: SCREEN_WIDTH * 0.761,
    height: 58,
    backgroundColor: '#FFFFFC',
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SCREEN_HEIGHT * 0.04,
  },
  shareIcon: {
    marginRight: 10,
  },
  shareButtonText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 30,
    color: '#000000',
  },
});