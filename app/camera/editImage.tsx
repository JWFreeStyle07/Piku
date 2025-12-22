// // // import { MaterialCommunityIcons } from '@expo/vector-icons';
// // // import * as MediaLibrary from 'expo-media-library';
// // // import { useLocalSearchParams, useRouter } from 'expo-router';
// // // import { deleteObject, ref, uploadBytes } from 'firebase/storage';
// // // import React, { useRef, useState } from 'react';
// // // import {
// // //     ActivityIndicator,
// // //     Alert,
// // //     Dimensions,
// // //     Image,
// // //     ScrollView,
// // //     StyleSheet,
// // //     Text,
// // //     TouchableOpacity,
// // //     View,
// // // } from 'react-native';
// // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // import { captureRef } from 'react-native-view-shot';
// // // import { storage } from '../../firebase/firebaseConfig';

// // // const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // // // Filters configuration
// // // const FILTERS = [
// // //   { id: 'none', name: 'Original', filter: {} },
// // //   { id: 'grayscale', name: 'B&W', filter: { tintColor: 'rgba(128, 128, 128, 0.5)' } },
// // //   { id: 'sepia', name: 'Sepia', filter: { tintColor: 'rgba(112, 66, 20, 0.4)' } },
// // //   { id: 'warm', name: 'Warm', filter: { tintColor: 'rgba(255, 140, 0, 0.3)' } },
// // //   { id: 'cool', name: 'Cool', filter: { tintColor: 'rgba(0, 191, 255, 0.3)' } },
// // //   { id: 'vintage', name: 'Vintage', filter: { tintColor: 'rgba(139, 69, 19, 0.35)' } },
// // // ];

// // // // Stickers configuration
// // // const STICKERS = [
// // //   { id: '1', emoji: '❤️' },
// // //   { id: '2', emoji: '😊' },
// // //   { id: '3', emoji: '🎉' },
// // //   { id: '4', emoji: '⭐' },
// // //   { id: '5', emoji: '🔥' },
// // //   { id: '6', emoji: '💯' },
// // //   { id: '7', emoji: '👍' },
// // //   { id: '8', emoji: '🎈' },
// // //   { id: '9', emoji: '🌟' },
// // //   { id: '10', emoji: '💫' },
// // // ];

// // // interface StickerInstance {
// // //   id: string;
// // //   emoji: string;
// // //   x: number;
// // //   y: number;
// // // }

// // // export default function EditImage() {
// // //   const router = useRouter();
// // //   const params = useLocalSearchParams();
  
// // //   const photoUrl = params.photoUrl as string;
// // //   const photoName = params.photoName as string;
// // //   const eventId = params.eventId as string;
// // //   const eventName = params.eventName as string;
// // //   const userId = params.userId as string;

// // //   const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
// // //   const [placedStickers, setPlacedStickers] = useState<StickerInstance[]>([]);
// // //   const [isDeleting, setIsDeleting] = useState(false);
// // //   const [isDownloading, setIsDownloading] = useState(false);
// // //   const [isSaving, setIsSaving] = useState(false);

// // //   const imageViewRef = useRef<View>(null);

// // //   const handleBack = () => {
// // //     router.back();
// // //   };

// // //   const handleDelete = async () => {
// // //     Alert.alert(
// // //       'Delete Photo',
// // //       'Are you sure you want to delete this photo?',
// // //       [
// // //         { text: 'Cancel', style: 'cancel' },
// // //         {
// // //           text: 'Delete',
// // //           style: 'destructive',
// // //           onPress: async () => {
// // //             try {
// // //               setIsDeleting(true);
// // //               const storageRef = ref(storage, `eventPhotos/${eventId}/${photoName}`);
// // //               await deleteObject(storageRef);
// // //               console.log('Photo deleted successfully');
// // //               router.back();
// // //             } catch (error) {
// // //               console.error('Error deleting photo:', error);
// // //               Alert.alert('Error', 'Failed to delete photo. Please try again.');
// // //             } finally {
// // //               setIsDeleting(false);
// // //             }
// // //           },
// // //         },
// // //       ]
// // //     );
// // //   };

// // //   const handleDownload = async () => {
// // //     try {
// // //       setIsDownloading(true);

// // //       const { status } = await MediaLibrary.requestPermissionsAsync();
// // //       if (status !== 'granted') {
// // //         Alert.alert('Permission Required', 'Please allow access to save photos.');
// // //         setIsDownloading(false);
// // //         return;
// // //       }

// // //       if (!imageViewRef.current) {
// // //         Alert.alert('Error', 'Image not ready for download.');
// // //         setIsDownloading(false);
// // //         return;
// // //       }

// // //       const uri = await captureRef(imageViewRef, {
// // //         format: 'jpg',
// // //         quality: 0.9,
// // //       });

// // //       await MediaLibrary.saveToLibraryAsync(uri);
// // //       Alert.alert('Success', 'Photo saved to gallery!');
// // //     } catch (error) {
// // //       console.error('Error downloading photo:', error);
// // //       Alert.alert('Error', 'Failed to download photo. Please try again.');
// // //     } finally {
// // //       setIsDownloading(false);
// // //     }
// // //   };

// // //   const handleAddSticker = (sticker: typeof STICKERS[0]) => {
// // //     const newSticker: StickerInstance = {
// // //       id: `${sticker.id}_${Date.now()}`,
// // //       emoji: sticker.emoji,
// // //       x: Math.random() * 200 + 100,
// // //       y: Math.random() * 300 + 200,
// // //     };
// // //     setPlacedStickers([...placedStickers, newSticker]);
// // //   };

// // //   const handleSaveEdited = async () => {
// // //     if (selectedFilter.id === 'none' && placedStickers.length === 0) {
// // //       Alert.alert('No Changes', 'Please apply a filter or add stickers before saving.');
// // //       return;
// // //     }

// // //     try {
// // //       setIsSaving(true);

// // //       if (!imageViewRef.current) {
// // //         Alert.alert('Error', 'Image not ready for saving.');
// // //         setIsSaving(false);
// // //         return;
// // //       }

// // //       const uri = await captureRef(imageViewRef, {
// // //         format: 'jpg',
// // //         quality: 0.8,
// // //       });

// // //       const response = await fetch(uri);
// // //       const blob = await response.blob();

// // //       const fileName = `${eventId}_${userId}_edited_${Date.now()}.jpg`;
// // //       const storageRef = ref(storage, `eventPhotos/${eventId}/${fileName}`);

// // //       await uploadBytes(storageRef, blob);
// // //       console.log('Edited photo saved successfully');

// // //       Alert.alert('Success', 'Edited photo saved!', [
// // //         {
// // //           text: 'OK',
// // //           onPress: () => router.back(),
// // //         },
// // //       ]);
// // //     } catch (error) {
// // //       console.error('Error saving edited photo:', error);
// // //       Alert.alert('Error', 'Failed to save edited photo. Please try again.');
// // //     } finally {
// // //       setIsSaving(false);
// // //     }
// // //   };

// // //   return (
// // //     <SafeAreaView style={styles.container}>
// // //       <View style={styles.content}>
// // //         {/* Header */}
// // //         <View style={styles.header}>
// // //           <TouchableOpacity
// // //             style={styles.headerButton}
// // //             onPress={handleBack}
// // //             activeOpacity={0.7}
// // //           >
// // //             <MaterialCommunityIcons name="close" size={28} color="#FFFFFC" />
// // //           </TouchableOpacity>

// // //           <View style={styles.headerRight}>
// // //             <TouchableOpacity
// // //               style={styles.headerButton}
// // //               onPress={handleDownload}
// // //               activeOpacity={0.7}
// // //               disabled={isDownloading}
// // //             >
// // //               {isDownloading ? (
// // //                 <ActivityIndicator size="small" color="#FFFFFC" />
// // //               ) : (
// // //                 <MaterialCommunityIcons
// // //                   name="download-outline"
// // //                   size={28}
// // //                   color="#FFFFFC"
// // //                 />
// // //               )}
// // //             </TouchableOpacity>

// // //             <TouchableOpacity
// // //               style={[styles.headerButton, styles.deleteButton]}
// // //               onPress={handleDelete}
// // //               activeOpacity={0.7}
// // //               disabled={isDeleting}
// // //             >
// // //               {isDeleting ? (
// // //                 <ActivityIndicator size="small" color="#F81C1F" />
// // //               ) : (
// // //                 <MaterialCommunityIcons
// // //                   name="delete-outline"
// // //                   size={28}
// // //                   color="#F81C1F"
// // //                 />
// // //               )}
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>

// // //         {/* Image Preview */}
// // //         <View style={styles.imageContainer} ref={imageViewRef} collapsable={false}>
// // //           <Image
// // //             source={{ uri: photoUrl }}
// // //             style={[styles.mainImage, selectedFilter.filter]}
// // //             resizeMode="cover"
// // //           />
// // //           {placedStickers.map((sticker) => (
// // //             <Text
// // //               key={sticker.id}
// // //               style={[
// // //                 styles.placedSticker,
// // //                 {
// // //                   left: sticker.x,
// // //                   top: sticker.y,
// // //                 },
// // //               ]}
// // //             >
// // //               {sticker.emoji}
// // //             </Text>
// // //           ))}
// // //         </View>

// // //         {/* Filters Section */}
// // //         <View style={styles.filtersSection}>
// // //           <ScrollView
// // //             horizontal
// // //             showsHorizontalScrollIndicator={false}
// // //             contentContainerStyle={styles.filtersContent}
// // //           >
// // //             {FILTERS.map((filter) => (
// // //               <TouchableOpacity
// // //                 key={filter.id}
// // //                 style={[
// // //                   styles.filterItem,
// // //                   selectedFilter.id === filter.id && styles.filterItemSelected,
// // //                 ]}
// // //                 onPress={() => setSelectedFilter(filter)}
// // //                 activeOpacity={0.8}
// // //               >
// // //                 <Image
// // //                   source={{ uri: photoUrl }}
// // //                   style={[styles.filterPreview, filter.filter]}
// // //                   resizeMode="cover"
// // //                 />
// // //                 <Text style={styles.filterName}>{filter.name}</Text>
// // //               </TouchableOpacity>
// // //             ))}
// // //           </ScrollView>
// // //         </View>

// // //         {/* Bottom Controls */}
// // //         <View style={styles.bottomControls}>
// // //           {/* Confirm Button */}
// // //           <TouchableOpacity
// // //             style={styles.confirmButton}
// // //             onPress={handleSaveEdited}
// // //             activeOpacity={0.8}
// // //             disabled={isSaving}
// // //           >
// // //             {isSaving ? (
// // //               <ActivityIndicator size="small" color="#000000" />
// // //             ) : (
// // //               <MaterialCommunityIcons name="check" size={28} color="#000000" />
// // //             )}
// // //           </TouchableOpacity>

// // //           {/* Stickers Section */}
// // //           <View style={styles.stickersSection}>
// // //             <ScrollView
// // //               horizontal
// // //               showsHorizontalScrollIndicator={false}
// // //               contentContainerStyle={styles.stickersContent}
// // //             >
// // //               {STICKERS.map((sticker) => (
// // //                 <TouchableOpacity
// // //                   key={sticker.id}
// // //                   style={styles.stickerItem}
// // //                   onPress={() => handleAddSticker(sticker)}
// // //                   activeOpacity={0.8}
// // //                 >
// // //                   <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
// // //                 </TouchableOpacity>
// // //               ))}
// // //             </ScrollView>
// // //           </View>
// // //         </View>
// // //       </View>
// // //     </SafeAreaView>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     backgroundColor: '#000000',
// // //   },
// // //   content: {
// // //     flex: 1,
// // //   },
// // //   header: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'space-between',
// // //     paddingHorizontal: SCREEN_WIDTH * 0.048,
// // //     marginTop: SCREEN_HEIGHT * 0.01,
// // //     height: 60,
// // //   },
// // //   headerButton: {
// // //     width: 40,
// // //     height: 40,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //   },
// // //   headerRight: {
// // //     flexDirection: 'row',
// // //     gap: 10,
// // //   },
// // //   deleteButton: {
// // //     marginLeft: 5,
// // //   },
// // //   imageContainer: {
// // //     width: SCREEN_WIDTH - 8,
// // //     height: 688,
// // //     marginLeft: 4,
// // //     marginTop: 10,
// // //     position: 'relative',
// // //     backgroundColor: '#1a1a1a',
// // //     borderRadius: 10,
// // //     overflow: 'hidden',
// // //   },
// // //   mainImage: {
// // //     width: '100%',
// // //     height: '100%',
// // //   },
// // //   placedSticker: {
// // //     position: 'absolute',
// // //     fontSize: 48,
// // //   },
// // //   filtersSection: {
// // //     marginTop: 15,
// // //     height: 90,
// // //   },
// // //   filtersContent: {
// // //     paddingHorizontal: 10,
// // //     gap: 10,
// // //   },
// // //   filterItem: {
// // //     width: 60,
// // //     alignItems: 'center',
// // //   },
// // //   filterItemSelected: {
// // //     borderColor: '#FFFFFC',
// // //     borderWidth: 3,
// // //     borderRadius: 8,
// // //   },
// // //   filterPreview: {
// // //     width: 55,
// // //     height: 55,
// // //     borderRadius: 5,
// // //     marginBottom: 5,
// // //   },
// // //   filterName: {
// // //     fontFamily: 'Poppins',
// // //     fontSize: 10,
// // //     color: '#FFFFFC',
// // //     textAlign: 'center',
// // //   },
// // //   bottomControls: {
// // //     position: 'absolute',
// // //     bottom: SCREEN_HEIGHT * 0.02,
// // //     left: 0,
// // //     right: 0,
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'space-between',
// // //     paddingHorizontal: 20,
// // //   },
// // //   confirmButton: {
// // //     width: 60,
// // //     height: 60,
// // //     backgroundColor: '#E5A602',
// // //     borderRadius: 30,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //   },
// // //   stickersSection: {
// // //     flex: 1,
// // //     marginLeft: 20,
// // //     height: 60,
// // //   },
// // //   stickersContent: {
// // //     gap: 10,
// // //     alignItems: 'center',
// // //   },
// // //   stickerItem: {
// // //     width: 50,
// // //     height: 50,
// // //     backgroundColor: '#292A24',
// // //     borderRadius: 25,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //   },
// // //   stickerEmoji: {
// // //     fontSize: 28,
// // //   },
// // // });
// // import { MaterialCommunityIcons } from '@expo/vector-icons';
// // import { useLocalSearchParams, useRouter } from 'expo-router';
// // import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
// // import React, { useState, useRef } from 'react';
// // import {
// //   ActivityIndicator,
// //   Alert,
// //   Dimensions,
// //   Image,
// //   ScrollView,
// //   StyleSheet,
// //   Text,
// //   TouchableOpacity,
// //   View,
// // } from 'react-native';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import * as FileSystem from 'expo-file-system';
// // import * as MediaLibrary from 'expo-media-library';
// // import { captureRef } from 'react-native-view-shot';
// // import { storage } from '../../firebase/firebaseConfig';

// // const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // // Filters configuration
// // const FILTERS = [
// //   { id: 'none', name: 'Original', filter: {} },
// //   { id: 'grayscale', name: 'B&W', filter: { tintColor: 'rgba(128, 128, 128, 0.5)' } },
// //   { id: 'sepia', name: 'Sepia', filter: { tintColor: 'rgba(112, 66, 20, 0.4)' } },
// //   { id: 'warm', name: 'Warm', filter: { tintColor: 'rgba(255, 140, 0, 0.3)' } },
// //   { id: 'cool', name: 'Cool', filter: { tintColor: 'rgba(0, 191, 255, 0.3)' } },
// //   { id: 'vintage', name: 'Vintage', filter: { tintColor: 'rgba(139, 69, 19, 0.35)' } },
// // ];

// // // Stickers configuration
// // const STICKERS = [
// //   { id: '0', type: 'image', source: require('../../assets/images/login/loginIcon.png') },
// //   { id: '1', type: 'emoji', emoji: '❤️' },
// //   { id: '2', type: 'emoji', emoji: '😊' },
// //   { id: '3', type: 'emoji', emoji: '🎉' },
// //   { id: '4', type: 'emoji', emoji: '⭐' },
// //   { id: '5', type: 'emoji', emoji: '🔥' },
// //   { id: '6', type: 'emoji', emoji: '💯' },
// //   { id: '7', type: 'emoji', emoji: '👍' },
// //   { id: '8', type: 'emoji', emoji: '🎈' },
// //   { id: '9', type: 'emoji', emoji: '🌟' },
// //   { id: '10', type: 'emoji', emoji: '💫' },
// // ];

// // interface StickerInstance {
// //   id: string;
// //   type: 'emoji' | 'image';
// //   emoji?: string;
// //   source?: any;
// //   x: number;
// //   y: number;
// // }

// // export default function EditImage() {
// //   const router = useRouter();
// //   const params = useLocalSearchParams();
  
// //   const photoUrl = params.photoUrl as string;
// //   const photoName = params.photoName as string;
// //   const eventId = params.eventId as string;
// //   const eventName = params.eventName as string;
// //   const userId = params.userId as string;

// //   const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
// //   const [placedStickers, setPlacedStickers] = useState<StickerInstance[]>([]);
// //   const [isDeleting, setIsDeleting] = useState(false);
// //   const [isDownloading, setIsDownloading] = useState(false);
// //   const [isSaving, setIsSaving] = useState(false);
// //   const [imageLoaded, setImageLoaded] = useState(false);

// //   const imageViewRef = useRef<View>(null);

// //   console.log('Photo URL received:', photoUrl);

// //   const handleBack = () => {
// //     router.back();
// //   };

// //   const handleDelete = async () => {
// //     Alert.alert(
// //       'Delete Photo',
// //       'Are you sure you want to delete this photo?',
// //       [
// //         { text: 'Cancel', style: 'cancel' },
// //         {
// //           text: 'Delete',
// //           style: 'destructive',
// //           onPress: async () => {
// //             try {
// //               setIsDeleting(true);
// //               const storageRef = ref(storage, `eventPhotos/${eventId}/${photoName}`);
// //               await deleteObject(storageRef);
// //               console.log('Photo deleted successfully');
// //               router.back();
// //             } catch (error) {
// //               console.error('Error deleting photo:', error);
// //               Alert.alert('Error', 'Failed to delete photo. Please try again.');
// //             } finally {
// //               setIsDeleting(false);
// //             }
// //           },
// //         },
// //       ]
// //     );
// //   };

// //   const handleDownload = async () => {
// //     try {
// //       setIsDownloading(true);

// //       const { status } = await MediaLibrary.requestPermissionsAsync();
// //       if (status !== 'granted') {
// //         Alert.alert('Permission Required', 'Please allow access to save photos.');
// //         setIsDownloading(false);
// //         return;
// //       }

// //       if (!imageViewRef.current) {
// //         Alert.alert('Error', 'Image not ready for download.');
// //         setIsDownloading(false);
// //         return;
// //       }

// //       const uri = await captureRef(imageViewRef, {
// //         format: 'jpg',
// //         quality: 0.9,
// //       });

// //       await MediaLibrary.saveToLibraryAsync(uri);
// //       Alert.alert('Success', 'Photo saved to gallery!');
// //     } catch (error) {
// //       console.error('Error downloading photo:', error);
// //       Alert.alert('Error', 'Failed to download photo. Please try again.');
// //     } finally {
// //       setIsDownloading(false);
// //     }
// //   };

// //   const handleAddSticker = (sticker: typeof STICKERS[0]) => {
// //     const newSticker: StickerInstance = {
// //       id: `${sticker.id}_${Date.now()}`,
// //       type: sticker.type,
// //       emoji: sticker.type === 'emoji' ? sticker.emoji : undefined,
// //       source: sticker.type === 'image' ? sticker.source : undefined,
// //       x: Math.random() * 200 + 100,
// //       y: Math.random() * 300 + 200,
// //     };
// //     setPlacedStickers([...placedStickers, newSticker]);
// //   };

// //   const handleSaveEdited = async () => {
// //     if (selectedFilter.id === 'none' && placedStickers.length === 0) {
// //       Alert.alert('No Changes', 'Please apply a filter or add stickers before saving.');
// //       return;
// //     }

// //     try {
// //       setIsSaving(true);

// //       if (!imageViewRef.current) {
// //         Alert.alert('Error', 'Image not ready for saving.');
// //         setIsSaving(false);
// //         return;
// //       }

// //       const uri = await captureRef(imageViewRef, {
// //         format: 'jpg',
// //         quality: 0.8,
// //       });

// //       const response = await fetch(uri);
// //       const blob = await response.blob();

// //       const fileName = `${eventId}_${userId}_edited_${Date.now()}.jpg`;
// //       const storageRef = ref(storage, `eventPhotos/${eventId}/${fileName}`);

// //       await uploadBytes(storageRef, blob);
// //       console.log('Edited photo saved successfully');

// //       Alert.alert('Success', 'Edited photo saved!', [
// //         {
// //           text: 'OK',
// //           onPress: () => router.back(),
// //         },
// //       ]);
// //     } catch (error) {
// //       console.error('Error saving edited photo:', error);
// //       Alert.alert('Error', 'Failed to save edited photo. Please try again.');
// //     } finally {
// //       setIsSaving(false);
// //     }
// //   };

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <View style={styles.content}>
// //         {/* Header */}
// //         <View style={styles.header}>
// //           <TouchableOpacity
// //             style={styles.headerButton}
// //             onPress={handleBack}
// //             activeOpacity={0.7}
// //           >
// //             <MaterialCommunityIcons name="close" size={28} color="#FFFFFC" />
// //           </TouchableOpacity>

// //           <View style={styles.headerRight}>
// //             <TouchableOpacity
// //               style={styles.headerButton}
// //               onPress={handleDownload}
// //               activeOpacity={0.7}
// //               disabled={isDownloading}
// //             >
// //               {isDownloading ? (
// //                 <ActivityIndicator size="small" color="#FFFFFC" />
// //               ) : (
// //                 <MaterialCommunityIcons
// //                   name="download-outline"
// //                   size={28}
// //                   color="#FFFFFC"
// //                 />
// //               )}
// //             </TouchableOpacity>

// //             <TouchableOpacity
// //               style={[styles.headerButton, styles.deleteButton]}
// //               onPress={handleDelete}
// //               activeOpacity={0.7}
// //               disabled={isDeleting}
// //             >
// //               {isDeleting ? (
// //                 <ActivityIndicator size="small" color="#F81C1F" />
// //               ) : (
// //                 <MaterialCommunityIcons
// //                   name="delete-outline"
// //                   size={28}
// //                   color="#F81C1F"
// //                 />
// //               )}
// //             </TouchableOpacity>
// //           </View>
// //         </View>

// //         {/* Image Preview */}
// //         <View style={styles.imageContainer} ref={imageViewRef} collapsable={false}>
// //           {!imageLoaded && (
// //             <View style={styles.imageLoadingContainer}>
// //               <ActivityIndicator size="large" color="#FFB703" />
// //             </View>
// //           )}
// //           <Image
// //             source={{ uri: photoUrl }}
// //             style={[styles.mainImage, selectedFilter.filter]}
// //             resizeMode="cover"
// //             onLoad={() => setImageLoaded(true)}
// //             onError={(error) => {
// //               console.error('Error loading image:', error);
// //               Alert.alert('Error', 'Failed to load image');
// //             }}
// //           />
// //           {placedStickers.map((sticker) => (
// //             sticker.type === 'emoji' ? (
// //               <Text
// //                 key={sticker.id}
// //                 style={[
// //                   styles.placedSticker,
// //                   {
// //                     left: sticker.x,
// //                     top: sticker.y,
// //                   },
// //                 ]}
// //               >
// //                 {sticker.emoji}
// //               </Text>
// //             ) : (
// //               <Image
// //                 key={sticker.id}
// //                 source={sticker.source}
// //                 style={[
// //                   styles.placedStickerImage,
// //                   {
// //                     left: sticker.x,
// //                     top: sticker.y,
// //                   },
// //                 ]}
// //               />
// //             )
// //           ))}
// //         </View>

// //         {/* Filters Section */}
// //         <View style={styles.filtersSection}>
// //           <ScrollView
// //             horizontal
// //             showsHorizontalScrollIndicator={false}
// //             contentContainerStyle={styles.filtersContent}
// //           >
// //             {FILTERS.map((filter) => (
// //               <TouchableOpacity
// //                 key={filter.id}
// //                 style={[
// //                   styles.filterItem,
// //                   selectedFilter.id === filter.id && styles.filterItemSelected,
// //                 ]}
// //                 onPress={() => setSelectedFilter(filter)}
// //                 activeOpacity={0.8}
// //               >
// //                 <Image
// //                   source={{ uri: photoUrl }}
// //                   style={[styles.filterPreview, filter.filter]}
// //                   resizeMode="cover"
// //                 />
// //                 <Text style={styles.filterName}>{filter.name}</Text>
// //               </TouchableOpacity>
// //             ))}
// //           </ScrollView>
// //         </View>

// //         {/* Bottom Controls */}
// //         <View style={styles.bottomControls}>
// //           {/* Confirm Button */}
// //           <TouchableOpacity
// //             style={styles.confirmButton}
// //             onPress={handleSaveEdited}
// //             activeOpacity={0.8}
// //             disabled={isSaving}
// //           >
// //             {isSaving ? (
// //               <ActivityIndicator size="small" color="#000000" />
// //             ) : (
// //               <MaterialCommunityIcons name="check" size={28} color="#000000" />
// //             )}
// //           </TouchableOpacity>

// //           {/* Stickers Section */}
// //           <View style={styles.stickersSection}>
// //             <ScrollView
// //               horizontal
// //               showsHorizontalScrollIndicator={false}
// //               contentContainerStyle={styles.stickersContent}
// //             >
// //               {STICKERS.map((sticker) => (
// //                 <TouchableOpacity
// //                   key={sticker.id}
// //                   style={styles.stickerItem}
// //                   onPress={() => handleAddSticker(sticker)}
// //                   activeOpacity={0.8}
// //                 >
// //                   {sticker.type === 'emoji' ? (
// //                     <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
// //                   ) : (
// //                     <Image source={sticker.source} style={styles.stickerImage} />
// //                   )}
// //                 </TouchableOpacity>
// //               ))}
// //             </ScrollView>
// //           </View>
// //         </View>
// //       </View>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#000000',
// //   },
// //   content: {
// //     flex: 1,
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     paddingHorizontal: SCREEN_WIDTH * 0.048,
// //     marginTop: SCREEN_HEIGHT * 0.01,
// //     height: 60,
// //   },
// //   headerButton: {
// //     width: 40,
// //     height: 40,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   headerRight: {
// //     flexDirection: 'row',
// //     gap: 10,
// //   },
// //   deleteButton: {
// //     marginLeft: 5,
// //   },
// //   imageContainer: {
// //     width: SCREEN_WIDTH - 8,
// //     height: 688,
// //     marginLeft: 4,
// //     marginTop: 10,
// //     position: 'relative',
// //     backgroundColor: '#1a1a1a',
// //     borderRadius: 10,
// //     overflow: 'hidden',
// //   },
// //   imageLoadingContainer: {
// //     position: 'absolute',
// //     top: 0,
// //     left: 0,
// //     right: 0,
// //     bottom: 0,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     zIndex: 1,
// //   },
// //   mainImage: {
// //     width: '100%',
// //     height: '100%',
// //   },
// //   placedSticker: {
// //     position: 'absolute',
// //     fontSize: 48,
// //   },
// //   placedStickerImage: {
// //     position: 'absolute',
// //     width: 48,
// //     height: 48,
// //   },
// //   filtersSection: {
// //     marginTop: 15,
// //     height: 90,
// //   },
// //   filtersContent: {
// //     paddingHorizontal: 10,
// //     gap: 10,
// //   },
// //   filterItem: {
// //     width: 60,
// //     alignItems: 'center',
// //   },
// //   filterItemSelected: {
// //     borderColor: '#FFFFFC',
// //     borderWidth: 3,
// //     borderRadius: 8,
// //   },
// //   filterPreview: {
// //     width: 55,
// //     height: 55,
// //     borderRadius: 5,
// //     marginBottom: 5,
// //   },
// //   filterName: {
// //     fontFamily: 'Poppins',
// //     fontSize: 10,
// //     color: '#FFFFFC',
// //     textAlign: 'center',
// //   },
// //   bottomControls: {
// //     position: 'absolute',
// //     bottom: SCREEN_HEIGHT * 0.05,
// //     left: 0,
// //     right: 0,
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     paddingHorizontal: 20,
// //   },
// //   confirmButton: {
// //     width: 60,
// //     height: 60,
// //     backgroundColor: '#E5A602',
// //     borderRadius: 30,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   stickersSection: {
// //     flex: 1,
// //     marginLeft: 20,
// //     height: 60,
// //   },
// //   stickersContent: {
// //     gap: 10,
// //     alignItems: 'center',
// //   },
// //   stickerItem: {
// //     width: 50,
// //     height: 50,
// //     backgroundColor: '#292A24',
// //     borderRadius: 25,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   stickerEmoji: {
// //     fontSize: 28,
// //   },
// //   stickerImage: {
// //     width: 40,
// //     height: 40,
// //     borderRadius: 20,
// //   },
// // });
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import * as MediaLibrary from 'expo-media-library';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { deleteObject, ref, uploadBytes } from 'firebase/storage';
// import React, { useRef, useState } from 'react';
// import {
//     ActivityIndicator,
//     Alert,
//     Dimensions,
//     Image,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { captureRef } from 'react-native-view-shot';
// import { storage } from '../../firebase/firebaseConfig';

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // Filters configuration
// const FILTERS = [
//   { id: 'none', name: 'Original', filter: {} },
//   { id: 'grayscale', name: 'B&W', filter: { tintColor: 'rgba(128, 128, 128, 0.5)' } },
//   { id: 'sepia', name: 'Sepia', filter: { tintColor: 'rgba(112, 66, 20, 0.4)' } },
//   { id: 'warm', name: 'Warm', filter: { tintColor: 'rgba(255, 140, 0, 0.3)' } },
//   { id: 'cool', name: 'Cool', filter: { tintColor: 'rgba(0, 191, 255, 0.3)' } },
//   { id: 'vintage', name: 'Vintage', filter: { tintColor: 'rgba(139, 69, 19, 0.35)' } },
// ];

// // Stickers configuration
// const STICKERS = [
//   { id: '0', type: 'image', source: require('../../assets/images/login/loginIcon.png') },
//   { id: '1', type: 'emoji', emoji: '❤️' },
//   { id: '2', type: 'emoji', emoji: '😊' },
//   { id: '3', type: 'emoji', emoji: '🎉' },
//   { id: '4', type: 'emoji', emoji: '⭐' },
//   { id: '5', type: 'emoji', emoji: '🔥' },
//   { id: '6', type: 'emoji', emoji: '💯' },
//   { id: '7', type: 'emoji', emoji: '👍' },
//   { id: '8', type: 'emoji', emoji: '🎈' },
//   { id: '9', type: 'emoji', emoji: '🌟' },
//   { id: '10', type: 'emoji', emoji: '💫' },
// ];

// interface StickerInstance {
//   id: string;
//   type: 'emoji' | 'image';
//   emoji?: string;
//   source?: any;
//   x: number;
//   y: number;
// }

// export default function EditImage() {
//   const router = useRouter();
//   const params = useLocalSearchParams();
  
//   const photoUrl = params.photoUrl as string;
//   const photoName = params.photoName as string;
//   const eventId = params.eventId as string;
//   const eventName = params.eventName as string;
//   const userId = params.userId as string;

//   const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
//   const [placedStickers, setPlacedStickers] = useState<StickerInstance[]>([]);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [imageLoaded, setImageLoaded] = useState(false);

//   const imageViewRef = useRef<View>(null);

//   console.log('Photo URL received:', photoUrl);

//   const handleBack = () => {
//     router.back();
//   };

//   const handleDelete = async () => {
//     Alert.alert(
//       'Delete Photo',
//       'Are you sure you want to delete this photo?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               setIsDeleting(true);
//               const storageRef = ref(storage, `eventPhotos/${eventId}/${photoName}`);
//               await deleteObject(storageRef);
//               console.log('Photo deleted successfully');
//               router.back();
//             } catch (error) {
//               console.error('Error deleting photo:', error);
//               Alert.alert('Error', 'Failed to delete photo. Please try again.');
//             } finally {
//               setIsDeleting(false);
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleDownload = async () => {
//     try {
//       setIsDownloading(true);

//       const { status } = await MediaLibrary.requestPermissionsAsync(false);
//       if (status !== 'granted') {
//         Alert.alert('Permission Required', 'Please allow access to save photos.');
//         setIsDownloading(false);
//         return;
//       }

//       if (!imageViewRef.current) {
//         Alert.alert('Error', 'Image not ready for download.');
//         setIsDownloading(false);
//         return;
//       }

//       const uri = await captureRef(imageViewRef, {
//         format: 'jpg',
//         quality: 0.9,
//       });

//       await MediaLibrary.saveToLibraryAsync(uri);
//       Alert.alert('Success', 'Photo saved to gallery!');
//     } catch (error) {
//       console.error('Error downloading photo:', error);
//       Alert.alert('Error', 'Failed to download photo. Please try again.');
//     } finally {
//       setIsDownloading(false);
//     }
//   };

//   const handleAddSticker = (sticker: typeof STICKERS[0]) => {
//     const newSticker: StickerInstance = {
//       id: `${sticker.id}_${Date.now()}`,
//       type: sticker.type as 'emoji' | 'image',
//       emoji: sticker.type === 'emoji' ? sticker.emoji : undefined,
//       source: sticker.type === 'image' ? sticker.source : undefined,
//       x: Math.random() * 200 + 100,
//       y: Math.random() * 300 + 200,
//     };
//     setPlacedStickers([...placedStickers, newSticker]);
//   };

//   const handleSaveEdited = async () => {
//     if (selectedFilter.id === 'none' && placedStickers.length === 0) {
//       Alert.alert('No Changes', 'Please apply a filter or add stickers before saving.');
//       return;
//     }

//     try {
//       setIsSaving(true);

//       if (!imageViewRef.current) {
//         Alert.alert('Error', 'Image not ready for saving.');
//         setIsSaving(false);
//         return;
//       }

//       const uri = await captureRef(imageViewRef, {
//         format: 'jpg',
//         quality: 0.8,
//       });

//       const response = await fetch(uri);
//       const blob = await response.blob();

//       const fileName = `${eventId}_${userId}_edited_${Date.now()}.jpg`;
//       const storageRef = ref(storage, `eventPhotos/${eventId}/${fileName}`);

//       await uploadBytes(storageRef, blob);
//       console.log('Edited photo saved successfully');

//       Alert.alert('Success', 'Edited photo saved!', [
//         {
//           text: 'OK',
//           onPress: () => router.back(),
//         },
//       ]);
//     } catch (error) {
//       console.error('Error saving edited photo:', error);
//       Alert.alert('Error', 'Failed to save edited photo. Please try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.content}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity
//             style={styles.headerButton}
//             onPress={handleBack}
//             activeOpacity={0.7}
//           >
//             <MaterialCommunityIcons name="close" size={28} color="#FFFFFC" />
//           </TouchableOpacity>

//           <View style={styles.headerRight}>
//             <TouchableOpacity
//               style={styles.headerButton}
//               onPress={handleDownload}
//               activeOpacity={0.7}
//               disabled={isDownloading}
//             >
//               {isDownloading ? (
//                 <ActivityIndicator size="small" color="#FFFFFC" />
//               ) : (
//                 <MaterialCommunityIcons
//                   name="download-outline"
//                   size={28}
//                   color="#FFFFFC"
//                 />
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.headerButton, styles.deleteButton]}
//               onPress={handleDelete}
//               activeOpacity={0.7}
//               disabled={isDeleting}
//             >
//               {isDeleting ? (
//                 <ActivityIndicator size="small" color="#F81C1F" />
//               ) : (
//                 <MaterialCommunityIcons
//                   name="delete-outline"
//                   size={28}
//                   color="#F81C1F"
//                 />
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Image Preview */}
//         <View style={styles.imageContainer} ref={imageViewRef} collapsable={false}>
//           {!imageLoaded && (
//             <View style={styles.imageLoadingContainer}>
//               <ActivityIndicator size="large" color="#FFB703" />
//             </View>
//           )}
//           <Image
//             source={{ uri: photoUrl }}
//             style={[styles.mainImage, selectedFilter.filter]}
//             resizeMode="cover"
//             onLoad={() => setImageLoaded(true)}
//             onError={(error) => {
//               console.error('Error loading image:', error);
//               Alert.alert('Error', 'Failed to load image');
//             }}
//           />
//           {placedStickers.map((sticker) => (
//             sticker.type === 'emoji' ? (
//               <Text
//                 key={sticker.id}
//                 style={[
//                   styles.placedSticker,
//                   {
//                     left: sticker.x,
//                     top: sticker.y,
//                   },
//                 ]}
//               >
//                 {sticker.emoji}
//               </Text>
//             ) : (
//               <Image
//                 key={sticker.id}
//                 source={sticker.source}
//                 style={[
//                   styles.placedStickerImage,
//                   {
//                     left: sticker.x,
//                     top: sticker.y,
//                   },
//                 ]}
//               />
//             )
//           ))}
//         </View>

//         {/* Filters Section */}
//         <View style={styles.filtersSection}>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.filtersContent}
//           >
//             {FILTERS.map((filter) => (
//               <TouchableOpacity
//                 key={filter.id}
//                 style={[
//                   styles.filterItem,
//                   selectedFilter.id === filter.id && styles.filterItemSelected,
//                 ]}
//                 onPress={() => setSelectedFilter(filter)}
//                 activeOpacity={0.8}
//               >
//                 <Image
//                   source={{ uri: photoUrl }}
//                   style={[styles.filterPreview, filter.filter]}
//                   resizeMode="cover"
//                 />
//                 <Text style={styles.filterName}>{filter.name}</Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>
//         </View>

//         {/* Bottom Controls */}
//         <View style={styles.bottomControls}>
//           {/* Confirm Button */}
//           <TouchableOpacity
//             style={styles.confirmButton}
//             onPress={handleSaveEdited}
//             activeOpacity={0.8}
//             disabled={isSaving}
//           >
//             {isSaving ? (
//               <ActivityIndicator size="small" color="#000000" />
//             ) : (
//               <MaterialCommunityIcons name="check" size={28} color="#000000" />
//             )}
//           </TouchableOpacity>

//           {/* Stickers Section */}
//           <View style={styles.stickersSection}>
//             <ScrollView
//               horizontal
//               showsHorizontalScrollIndicator={false}
//               contentContainerStyle={styles.stickersContent}
//             >
//               {STICKERS.map((sticker) => (
//                 <TouchableOpacity
//                   key={sticker.id}
//                   style={styles.stickerItem}
//                   onPress={() => handleAddSticker(sticker)}
//                   activeOpacity={0.8}
//                 >
//                   {sticker.type === 'emoji' ? (
//                     <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
//                   ) : (
//                     <Image source={sticker.source} style={styles.stickerImage} />
//                   )}
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         </View>
//       </View>
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
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: SCREEN_WIDTH * 0.048,
//     marginTop: SCREEN_HEIGHT * 0.01,
//     height: 60,
//   },
//   headerButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerRight: {
//     flexDirection: 'row',
//     gap: 10,
//   },
//   deleteButton: {
//     marginLeft: 5,
//   },
//   imageContainer: {
//     width: SCREEN_WIDTH - 8,
//     height: 688,
//     marginLeft: 4,
//     marginTop: 10,
//     position: 'relative',
//     backgroundColor: '#1a1a1a',
//     borderRadius: 10,
//     overflow: 'hidden',
//   },
//   imageLoadingContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1,
//   },
//   mainImage: {
//     width: '100%',
//     height: '100%',
//   },
//   placedSticker: {
//     position: 'absolute',
//     fontSize: 48,
//   },
//   placedStickerImage: {
//     position: 'absolute',
//     width: 48,
//     height: 48,
//   },
//   filtersSection: {
//     marginTop: 15,
//     height: 90,
//   },
//   filtersContent: {
//     paddingHorizontal: 10,
//     gap: 10,
//   },
//   filterItem: {
//     width: 60,
//     alignItems: 'center',
//   },
//   filterItemSelected: {
//     borderColor: '#FFFFFC',
//     borderWidth: 3,
//     borderRadius: 8,
//   },
//   filterPreview: {
//     width: 55,
//     height: 55,
//     borderRadius: 5,
//     marginBottom: 5,
//   },
//   filterName: {
//     fontFamily: 'Poppins',
//     fontSize: 10,
//     color: '#FFFFFC',
//     textAlign: 'center',
//   },
//   bottomControls: {
//     position: 'absolute',
//     bottom: SCREEN_HEIGHT * 0.05,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//   },
//   confirmButton: {
//     width: 60,
//     height: 60,
//     backgroundColor: '#E5A602',
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   stickersSection: {
//     flex: 1,
//     marginLeft: 20,
//     height: 60,
//   },
//   stickersContent: {
//     gap: 10,
//     alignItems: 'center',
//   },
//   stickerItem: {
//     width: 50,
//     height: 50,
//     backgroundColor: '#292A24',
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   stickerEmoji: {
//     fontSize: 28,
//   },
//   stickerImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
// });
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { deleteObject, ref, uploadBytes } from 'firebase/storage';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { storage } from '../../firebase/firebaseConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Filters configuration
const FILTERS = [
  { id: 'none', name: 'Original', filter: {} },
  { id: 'grayscale', name: 'B&W', filter: { tintColor: 'rgba(128, 128, 128, 0.5)' } },
  { id: 'sepia', name: 'Sepia', filter: { tintColor: 'rgba(112, 66, 20, 0.4)' } },
  { id: 'warm', name: 'Warm', filter: { tintColor: 'rgba(255, 140, 0, 0.3)' } },
  { id: 'cool', name: 'Cool', filter: { tintColor: 'rgba(0, 191, 255, 0.3)' } },
  { id: 'vintage', name: 'Vintage', filter: { tintColor: 'rgba(139, 69, 19, 0.35)' } },
];

// Stickers configuration
const STICKERS = [
  { id: '0', type: 'image', source: require('../../assets/images/login/loginIcon.png') },
  { id: '1', type: 'emoji', emoji: '❤️' },
  { id: '2', type: 'emoji', emoji: '😊' },
  { id: '3', type: 'emoji', emoji: '🎉' },
  { id: '4', type: 'emoji', emoji: '⭐' },
  { id: '5', type: 'emoji', emoji: '🔥' },
  { id: '6', type: 'emoji', emoji: '💯' },
  { id: '7', type: 'emoji', emoji: '👍' },
  { id: '8', type: 'emoji', emoji: '🎈' },
  { id: '9', type: 'emoji', emoji: '🌟' },
  { id: '10', type: 'emoji', emoji: '💫' },
];

interface StickerInstance {
  id: string;
  type: 'emoji' | 'image';
  emoji?: string;
  source?: any;
  x: number;
  y: number;
}

export default function EditImage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const photoUrl = params.photoUrl as string;
  const photoName = params.photoName as string;
  const eventId = params.eventId as string;
  const eventName = params.eventName as string;
  const userId = params.userId as string;

  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [placedStickers, setPlacedStickers] = useState<StickerInstance[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageViewRef = useRef<View>(null);

  console.log('Photo URL received:', photoUrl);

  const handleBack = () => {
    router.back();
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              const storageRef = ref(storage, `eventPhotos/${eventId}/${photoName}`);
              await deleteObject(storageRef);
              console.log('Photo deleted successfully');
              router.back();
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Error', 'Failed to delete photo. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const { status } = await MediaLibrary.requestPermissionsAsync(false);
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save photos.');
        setIsDownloading(false);
        return;
      }

      if (!imageViewRef.current) {
        Alert.alert('Error', 'Image not ready for download.');
        setIsDownloading(false);
        return;
      }

      const uri = await captureRef(imageViewRef, {
        format: 'jpg',
        quality: 0.9,
      });

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Success', 'Photo saved to gallery!');
    } catch (error) {
      console.error('Error downloading photo:', error);
      Alert.alert('Error', 'Failed to download photo. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAddSticker = (sticker: typeof STICKERS[0]) => {
    const newSticker: StickerInstance = {
      id: `${sticker.id}_${Date.now()}`,
      type: sticker.type as 'emoji' | 'image',
      emoji: sticker.type === 'emoji' ? sticker.emoji : undefined,
      source: sticker.type === 'image' ? sticker.source : undefined,
      x: Math.random() * 200 + 100,
      y: Math.random() * 300 + 200,
    };
    setPlacedStickers([...placedStickers, newSticker]);
  };

  const handleSaveEdited = async () => {
    if (selectedFilter.id === 'none' && placedStickers.length === 0) {
      Alert.alert('No Changes', 'Please apply a filter or add stickers before saving.');
      return;
    }

    try {
      setIsSaving(true);

      if (!imageViewRef.current) {
        Alert.alert('Error', 'Image not ready for saving.');
        setIsSaving(false);
        return;
      }

      const uri = await captureRef(imageViewRef, {
        format: 'jpg',
        quality: 0.8,
      });

      const response = await fetch(uri);
      const blob = await response.blob();

      const fileName = `${eventId}_${userId}_edited_${Date.now()}.jpg`;
      const storageRef = ref(storage, `eventPhotos/${eventId}/${fileName}`);

      await uploadBytes(storageRef, blob);
      console.log('Edited photo saved successfully');

      Alert.alert('Success', 'Edited photo saved!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error saving edited photo:', error);
      Alert.alert('Error', 'Failed to save edited photo. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close" size={28} color="#FFFFFC" />
          </TouchableOpacity>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleDownload}
              activeOpacity={0.7}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <ActivityIndicator size="small" color="#FFFFFC" />
              ) : (
                <MaterialCommunityIcons
                  name="download-outline"
                  size={28}
                  color="#FFFFFC"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerButton, styles.deleteButton]}
              onPress={handleDelete}
              activeOpacity={0.7}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#F81C1F" />
              ) : (
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={28}
                  color="#F81C1F"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Preview */}
        <View style={styles.imageContainer} ref={imageViewRef} collapsable={false}>
          {!imageLoaded && (
            <View style={styles.imageLoadingContainer}>
              <ActivityIndicator size="large" color="#FFB703" />
            </View>
          )}
          <Image
            source={{ uri: photoUrl }}
            style={[styles.mainImage, selectedFilter.filter]}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
            onError={(error) => {
              console.error('Error loading image:', error);
              Alert.alert('Error', 'Failed to load image');
            }}
          />
          {placedStickers.map((sticker) => (
            sticker.type === 'emoji' ? (
              <Text
                key={sticker.id}
                style={[
                  styles.placedSticker,
                  {
                    left: sticker.x,
                    top: sticker.y,
                  },
                ]}
              >
                {sticker.emoji}
              </Text>
            ) : (
              <Image
                key={sticker.id}
                source={sticker.source}
                style={[
                  styles.placedStickerImage,
                  {
                    left: sticker.x,
                    top: sticker.y,
                  },
                ]}
              />
            )
          ))}
        </View>

        {/* Filters Section */}
        <View style={styles.filtersSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterItem,
                  selectedFilter.id === filter.id && styles.filterItemSelected,
                ]}
                onPress={() => setSelectedFilter(filter)}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: photoUrl }}
                  style={[styles.filterPreview, filter.filter]}
                  resizeMode="cover"
                />
                <Text style={styles.filterName}>{filter.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Confirm Button */}
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleSaveEdited}
            activeOpacity={0.8}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <MaterialCommunityIcons name="check" size={28} color="#000000" />
            )}
          </TouchableOpacity>

          {/* Stickers Section */}
          <View style={styles.stickersSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.stickersContent}
            >
              {STICKERS.map((sticker) => (
                <TouchableOpacity
                  key={sticker.id}
                  style={styles.stickerItem}
                  onPress={() => handleAddSticker(sticker)}
                  activeOpacity={0.8}
                >
                  {sticker.type === 'emoji' ? (
                    <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
                  ) : (
                    <Image source={sticker.source} style={styles.stickerImage} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
    marginTop: SCREEN_HEIGHT * 0.01,
    height: 60,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  deleteButton: {
    marginLeft: 5,
  },
  imageContainer: {
    width: SCREEN_WIDTH - 8,
    height: 688,
    marginLeft: 4,
    marginTop: 10,
    position: 'relative',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  placedSticker: {
    position: 'absolute',
    fontSize: 48,
  },
  placedStickerImage: {
    position: 'absolute',
    width: 48,
    height: 48,
  },
  filtersSection: {
    marginTop: 15,
    height: 90,
  },
  filtersContent: {
    paddingHorizontal: 10,
    gap: 10,
  },
  filterItem: {
    width: 60,
    alignItems: 'center',
  },
  filterItemSelected: {
    borderColor: '#FFFFFC',
    borderWidth: 3,
    borderRadius: 8,
  },
  filterPreview: {
    width: 55,
    height: 55,
    borderRadius: 5,
    marginBottom: 5,
  },
  filterName: {
    fontFamily: 'Poppins',
    fontSize: 10,
    color: '#FFFFFC',
    textAlign: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.05,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  confirmButton: {
    width: 60,
    height: 60,
    backgroundColor: '#E5A602',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickersSection: {
    flex: 1,
    marginLeft: 20,
    height: 60,
  },
  stickersContent: {
    gap: 10,
    alignItems: 'center',
  },
  stickerItem: {
    width: 50,
    height: 50,
    backgroundColor: '#292A24',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerEmoji: {
    fontSize: 28,
  },
  stickerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});