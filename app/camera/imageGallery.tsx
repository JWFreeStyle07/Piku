import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { storage } from '../../firebase/firebaseConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Photo {
  id: string;
  url: string;
  name: string;
}

export default function ImageGallery() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const eventId = params.eventId as string;
  const eventName = params.eventName as string;
  const userId = params.userId as string;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchEventPhotos();
    }, [eventId])
  );

  const fetchEventPhotos = async () => {
    try {
      setIsLoading(true);

      const photosRef = ref(storage, `eventPhotos/${eventId}`);
      const photosList = await listAll(photosRef);

      const photosData: Photo[] = [];
      
      for (const itemRef of photosList.items) {
        const url = await getDownloadURL(itemRef);
        photosData.push({
          id: itemRef.name,
          url: url,
          name: itemRef.name,
        });
      }

      photosData.sort((a, b) => b.name.localeCompare(a.name));

      setPhotos(photosData);
      console.log('Fetched photos:', photosData.length);
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadPhotoFromGallery = async () => {
    try {
      if (!ImagePicker.launchImageLibraryAsync) {
        Alert.alert('Feature Unavailable', 'Image picker is not available.');
        return;
      }

      if (ImagePicker.requestMediaLibraryPermissionsAsync) {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (permissionResult.granted === false) {
          Alert.alert('Permission Required', 'Please allow access to your photo library.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploading(true);
        const uri = result.assets[0].uri;

        const response = await fetch(uri);
        const blob = await response.blob();

        const fileName = `${eventId}_${userId}_${Date.now()}.jpg`;
        const storageRef = ref(storage, `eventPhotos/${eventId}/${fileName}`);

        await uploadBytes(storageRef, blob);
        console.log('Photo uploaded successfully');

        await fetchEventPhotos();
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handlePhotoPress = (photo: Photo) => {
    console.log('Navigating with photo:', photo.url);
    router.push({
      pathname: '../../camera/editImage',
      params: {
        photoUrl: encodeURIComponent(photo.url),
        photoName: photo.name,
        eventId: eventId,
        eventName: eventName,
        userId: userId,
      },
    });
  };

  const renderItem = ({ item, index }: { item: Photo | 'upload'; index: number }) => {
    if (item === 'upload') {
      return (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={uploadPhotoFromGallery}
          activeOpacity={0.8}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#FDB304" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="upload-outline"
                size={36}
                color="#FDB304"
                style={styles.uploadIcon}
              />
              <Text style={styles.uploadText}>Upload Photos</Text>
            </>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.photoContainer}
        onPress={() => handlePhotoPress(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.url }}
          style={styles.photo}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
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

          <Text style={styles.title}>{eventName}</Text>

          <View style={styles.placeholder} />
        </View>

        <Text style={styles.subtitle}>Gallery</Text>

        {/* Photos Grid */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFB703" />
          </View>
        ) : photos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="image-off-outline"
              size={64}
              color="#8B8C83"
            />
            <Text style={styles.emptyText}>No photos yet</Text>
            <Text style={styles.emptySubtext}>
              Capture or upload your first moment!
            </Text>
          </View>
        ) : (
          <FlatList
            data={['upload' as const, ...photos]}
            renderItem={renderItem}
            keyExtractor={(item, index) => (item === 'upload' ? 'upload' : item.id)}
            numColumns={3}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.048,
    marginTop: SCREEN_HEIGHT * 0.018,
    height: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '800',
    fontSize: 21,
    lineHeight: 32,
    color: '#FFFFFC',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  placeholder: {
    width: 40,
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 24,
    color: '#8B8C83',
    marginLeft: SCREEN_WIDTH * 0.065,
    marginTop: 10,
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    width: SCREEN_WIDTH,
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 30,
    color: '#FFFFFC',
    marginTop: 20,
  },
  emptySubtext: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 21,
    color: '#8B8C83',
    marginTop: 8,
  },
  gridContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  uploadButton: {
    width: 119,
    height: 110,
    backgroundColor: '#292A24',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2.5,
  },
  uploadIcon: {
    marginBottom: 5,
  },
  uploadText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 18,
    color: '#FFFFFC',
  },
  photoContainer: {
    width: 119,
    height: 110,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#292A24',
    margin: 2.5,
  },
  firstPhoto: {
    marginLeft: 10,
  },
  secondPhoto: {
    marginLeft: 6,
  },
  thirdPhoto: {
    marginLeft: 6,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});