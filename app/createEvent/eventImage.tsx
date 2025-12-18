import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EventImage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const eventId = params.eventId as string;
  const eventName = params.eventName as string;
  const userId = params.userId as string;
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to select a cover image for your event.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 5], // Portrait aspect ratio for cover image
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        
        // Navigate to setup event screen with image
        router.push({
          pathname: '../../createEvent/setupEvent',
          params: {
            eventId: eventId,
            eventName: eventName,
            userId: userId,
            coverImageUri: imageUri,
          },
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={32}
              color="#FFFFFC"
            />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Cover Image</Text>
        </View>

        {/* Main Content Box */}
        <View style={styles.mainBox}>
          {/* Upload Icon */}
          <MaterialCommunityIcons
            name="upload"
            size={70}
            color="#FDB304"
            style={styles.uploadIcon}
          />

          {/* Select Cover Image Text */}
          <Text style={styles.selectText}>Select cover image</Text>

          {/* Description Text */}
          <Text style={styles.descriptionText}>
            Let's set up the screen your guests{'\n'}will see before they join.
          </Text>

          {/* Select Cover Image Button */}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <Text style={styles.selectButtonText}>Select cover image</Text>
          </TouchableOpacity>
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
    paddingHorizontal: SCREEN_WIDTH * 0.048, // ~19px on 401px screen
    marginTop: SCREEN_HEIGHT * 0.018, // ~15px from top
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 27,
    color: '#FFFFFC',
    marginLeft: SCREEN_WIDTH * 0.08, // Offset for centering
  },
  mainBox: {
    width: SCREEN_WIDTH * 0.855, // ~343px on 401px screen
    height: 403,
    backgroundColor: '#292A24',
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: SCREEN_HEIGHT * 0.11, // ~124px from header
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  uploadIcon: {
    marginBottom: 30,
  },
  selectText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 27,
    color: '#FFFFFC',
    marginBottom: 14,
  },
  descriptionText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#FFFFFC',
    marginBottom: 40,
    maxWidth: 262,
  },
  selectButton: {
    width: SCREEN_WIDTH * 0.723, // ~290px on 401px screen
    height: 49,
    backgroundColor: '#E5A602',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectButtonText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 27,
    color: '#000000',
  },
});