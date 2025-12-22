import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function CameraShot() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const eventId = params.eventId as string;
  const eventName = params.eventName as string;
  const userId = params.userId as string;

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
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

          {/* Event Name */}
          <Text style={styles.eventName} numberOfLines={1}>
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
              color="#000000"
            />
          </TouchableOpacity>
        </View>

        {/* Camera view and other elements will go here */}
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.placeholderText}>Camera View</Text>
          <Text style={styles.placeholderSubtext}>
            Camera functionality to be implemented
          </Text>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.048,
    marginTop: SCREEN_HEIGHT * 0.018,
    height: 60,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventName: {
    flex: 1,
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '800',
    fontSize: 21,
    lineHeight: 32,
    color: '#000000',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  qrButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  placeholderText: {
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFC',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#8B8C83',
  },
});