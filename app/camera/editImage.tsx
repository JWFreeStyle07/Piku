// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import * as Sharing from 'expo-sharing';
// import { deleteObject, ref, uploadBytes } from 'firebase/storage';
// import React, { useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Dimensions,
//   Image,
//   Modal,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { captureRef } from 'react-native-view-shot';
// import { storage } from '../../firebase/firebaseConfig';

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// // Filters configuration
// const FILTERS = [
//   { id: 'none', name: 'Original', style: {} },
//   { 
//     id: 'grayscale', 
//     name: 'B&W', 
//     style: {
//       tintColor: undefined,
//       opacity: 1,
//     },
//     imageStyle: {
//       // This will be applied via a filter-like overlay
//     }
//   },
//   { 
//     id: 'sepia', 
//     name: 'Sepia', 
//     style: {
//       tintColor: 'rgba(112, 66, 20, 0.4)',
//     }
//   },
//   { 
//     id: 'warm', 
//     name: 'Warm', 
//     style: {
//       tintColor: 'rgba(255, 140, 0, 0.3)',
//     }
//   },
//   { 
//     id: 'cool', 
//     name: 'Cool', 
//     style: {
//       tintColor: 'rgba(0, 191, 255, 0.3)',
//     }
//   },
//   { 
//     id: 'vintage', 
//     name: 'Vintage', 
//     style: {
//       tintColor: 'rgba(139, 69, 19, 0.35)',
//     }
//   },
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
//   scale: number;
//   rotation: number;
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
//   const [isSharing, setIsSharing] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [showFiltersModal, setShowFiltersModal] = useState(false);
//   const [showStickersModal, setShowStickersModal] = useState(false);
//   const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

//   const imageViewRef = useRef<View>(null);
//   const stickerStartPos = useRef({ x: 0, y: 0 });
//   const stickerStartScale = useRef(1);
//   const stickerStartRotation = useRef(0);
//   const initialDistance = useRef(0);
//   const initialAngle = useRef(0);
//   const initialTouchX = useRef(0);
//   const initialTouchY = useRef(0);

//   console.log('Edit Image Screen Loaded');

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

//   const handleShare = async () => {
//     try {
//       setIsSharing(true);
      
//       // Deselect sticker before capturing to remove border
//       const wasSelected = selectedStickerId;
//       setSelectedStickerId(null);
      
//       // Wait a bit for the UI to update
//       await new Promise(resolve => setTimeout(resolve, 100));

//       if (!imageViewRef.current) {
//         Alert.alert('Error', 'Image not ready for sharing.');
//         setIsSharing(false);
//         if (wasSelected) setSelectedStickerId(wasSelected);
//         return;
//       }

//       const uri = await captureRef(imageViewRef, {
//         format: 'jpg',
//         quality: 0.9,
//       });

//       const isAvailable = await Sharing.isAvailableAsync();
//       if (isAvailable) {
//         await Sharing.shareAsync(uri, {
//           mimeType: 'image/jpeg',
//           dialogTitle: 'Share your edited photo',
//         });
//       } else {
//         Alert.alert('Error', 'Sharing is not available on this device.');
//       }
      
//       // Restore selection after sharing
//       if (wasSelected) setSelectedStickerId(wasSelected);
//     } catch (error) {
//       console.error('Error sharing photo:', error);
//       Alert.alert('Error', 'Failed to share photo. Please try again.');
//     } finally {
//       setIsSharing(false);
//     }
//   };

//   const handleAddSticker = (sticker: typeof STICKERS[0]) => {
//     const newSticker: StickerInstance = {
//       id: `${sticker.id}_${Date.now()}`,
//       type: sticker.type as 'emoji' | 'image',
//       emoji: sticker.type === 'emoji' ? sticker.emoji : undefined,
//       source: sticker.type === 'image' ? sticker.source : undefined,
//       x: SCREEN_WIDTH * 0.4,
//       y: SCREEN_HEIGHT * 0.3,
//       scale: 1,
//       rotation: 0,
//     };
//     setPlacedStickers([...placedStickers, newSticker]);
//     setSelectedStickerId(newSticker.id);
//     setShowStickersModal(false);
//   };

//   const handleRemoveSticker = () => {
//     if (selectedStickerId) {
//       Alert.alert(
//         'Remove Sticker',
//         'Do you want to remove this sticker?',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           {
//             text: 'Remove',
//             style: 'destructive',
//             onPress: () => {
//               setPlacedStickers(prev => prev.filter(s => s.id !== selectedStickerId));
//               setSelectedStickerId(null);
//             },
//           },
//         ]
//       );
//     }
//   };

//   const getDistance = (touches: any[]) => {
//     const dx = touches[0].pageX - touches[1].pageX;
//     const dy = touches[0].pageY - touches[1].pageY;
//     return Math.sqrt(dx * dx + dy * dy);
//   };

//   const getAngle = (touches: any[]) => {
//     const dx = touches[1].pageX - touches[0].pageX;
//     const dy = touches[1].pageY - touches[0].pageY;
//     return Math.atan2(dy, dx) * 180 / Math.PI;
//   };

//   const handleStickerTouchStart = (e: any, stickerId: string) => {
//     e.stopPropagation();
//     setSelectedStickerId(stickerId);
//     const sticker = placedStickers.find(s => s.id === stickerId);
//     if (!sticker) return;

//     if (e.nativeEvent.touches.length === 1) {
//       // Single touch - pan
//       const touch = e.nativeEvent.touches[0];
//       initialTouchX.current = touch.pageX;
//       initialTouchY.current = touch.pageY;
//       stickerStartPos.current = { x: sticker.x, y: sticker.y };
//     } else if (e.nativeEvent.touches.length === 2) {
//       // Two touches - pinch to scale AND rotate
//       stickerStartScale.current = sticker.scale;
//       stickerStartRotation.current = sticker.rotation;
//       initialDistance.current = getDistance(e.nativeEvent.touches);
//       initialAngle.current = getAngle(e.nativeEvent.touches);
//     }
//   };

//   const handleStickerTouchMove = (e: any, stickerId: string) => {
//     e.stopPropagation();
//     const sticker = placedStickers.find(s => s.id === stickerId);
//     if (!sticker) return;

//     if (e.nativeEvent.touches.length === 1) {
//       // Single touch - pan
//       const touch = e.nativeEvent.touches[0];
//       const deltaX = touch.pageX - initialTouchX.current;
//       const deltaY = touch.pageY - initialTouchY.current;

//       setPlacedStickers(prev =>
//         prev.map(s =>
//           s.id === stickerId
//             ? { 
//                 ...s, 
//                 x: stickerStartPos.current.x + deltaX,
//                 y: stickerStartPos.current.y + deltaY
//               }
//             : s
//         )
//       );
//     } else if (e.nativeEvent.touches.length === 2) {
//       // Two touches - pinch to scale AND rotate
//       const currentDistance = getDistance(e.nativeEvent.touches);
//       const currentAngle = getAngle(e.nativeEvent.touches);

//       const scaleChange = currentDistance / initialDistance.current;
//       const rotationChange = currentAngle - initialAngle.current;

//       setPlacedStickers(prev =>
//         prev.map(s =>
//           s.id === stickerId
//             ? {
//                 ...s,
//                 scale: Math.max(0.5, Math.min(3, stickerStartScale.current * scaleChange)),
//                 rotation: stickerStartRotation.current + rotationChange,
//               }
//             : s
//         )
//       );
//     }
//   };

//   const handleFilterSelect = (filter: typeof FILTERS[0]) => {
//     setSelectedFilter(filter);
//     setShowFiltersModal(false);
//   };

//   const handleSaveEdited = async () => {
//     if (selectedFilter.id === 'none' && placedStickers.length === 0) {
//       Alert.alert('No Changes', 'Please apply a filter or add stickers before saving.');
//       return;
//     }

//     try {
//       setIsSaving(true);
      
//       // Deselect sticker before capturing to remove border
//       const wasSelected = selectedStickerId;
//       setSelectedStickerId(null);
      
//       // Wait a bit for the UI to update
//       await new Promise(resolve => setTimeout(resolve, 100));

//       if (!imageViewRef.current) {
//         Alert.alert('Error', 'Image not ready for saving.');
//         setIsSaving(false);
//         if (wasSelected) setSelectedStickerId(wasSelected);
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
//               onPress={handleShare}
//               activeOpacity={0.7}
//               disabled={isSharing}
//             >
//               {isSharing ? (
//                 <ActivityIndicator size="small" color="#FFFFFC" />
//               ) : (
//                 <MaterialCommunityIcons
//                   name="share-variant"
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
//             style={styles.mainImage}
//             resizeMode="cover"
//             onLoad={() => setImageLoaded(true)}
//             onError={(error) => {
//               console.error('Error loading image:', error);
//               Alert.alert('Error', 'Failed to load image');
//             }}
//           />
//           {/* Filter Overlay */}
//           {selectedFilter.id === 'grayscale' && (
//             <View style={[styles.filterOverlay, { backgroundColor: 'rgba(128, 128, 128, 0.5)' }]} />
//           )}
//           {selectedFilter.style.tintColor && (
//             <View style={[styles.filterOverlay, { backgroundColor: selectedFilter.style.tintColor }]} />
//           )}
//           {/* Placed Stickers */}
//           {placedStickers.map((sticker) => (
//             <View
//               key={sticker.id}
//               style={[
//                 styles.stickerWrapper,
//                 {
//                   left: sticker.x,
//                   top: sticker.y,
//                   transform: [
//                     { scale: sticker.scale },
//                     { rotate: `${sticker.rotation}deg` },
//                   ],
//                 },
//                 selectedStickerId === sticker.id && styles.stickerSelected,
//               ]}
//               onStartShouldSetResponder={() => true}
//               onResponderGrant={(e) => handleStickerTouchStart(e, sticker.id)}
//               onResponderMove={(e) => handleStickerTouchMove(e, sticker.id)}
//             >
//               {sticker.type === 'emoji' ? (
//                 <Text style={styles.placedSticker}>
//                   {sticker.emoji}
//                 </Text>
//               ) : (
//                 <Image
//                   source={sticker.source}
//                   style={styles.placedStickerImage}
//                 />
//               )}
//             </View>
//           ))}
          
//           {/* Delete Sticker Button - Shows when a sticker is selected */}
//           {selectedStickerId && (
//             <TouchableOpacity
//               style={styles.deleteStickerButton}
//               onPress={handleRemoveSticker}
//               activeOpacity={0.8}
//             >
//               <MaterialCommunityIcons
//                 name="delete"
//                 size={24}
//                 color="#FFFFFF"
//               />
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Bottom Controls */}
//         <View style={styles.bottomControls}>
//           {/* Filter Button */}
//           <TouchableOpacity
//             style={styles.controlButton}
//             onPress={() => setShowFiltersModal(true)}
//             activeOpacity={0.7}
//           >
//             <MaterialCommunityIcons
//               name="image-edit-outline"
//               size={24}
//               color="#000000"
//             />
//           </TouchableOpacity>

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

//           {/* Sticker Button */}
//           <TouchableOpacity
//             style={styles.controlButton}
//             onPress={() => setShowStickersModal(true)}
//             activeOpacity={0.7}
//           >
//             <MaterialCommunityIcons
//               name="sticker-emoji"
//               size={24}
//               color="#000000"
//             />
//           </TouchableOpacity>
//         </View>

//         {/* Filters Modal */}
//         <Modal
//           visible={showFiltersModal}
//           transparent={true}
//           animationType="slide"
//           onRequestClose={() => setShowFiltersModal(false)}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>Filters</Text>
//                 <TouchableOpacity
//                   onPress={() => setShowFiltersModal(false)}
//                   activeOpacity={0.7}
//                 >
//                   <MaterialCommunityIcons name="close" size={28} color="#FFFFFC" />
//                 </TouchableOpacity>
//               </View>
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.filtersContent}
//               >
//                 {FILTERS.map((filter) => (
//                   <TouchableOpacity
//                     key={filter.id}
//                     style={[
//                       styles.filterItem,
//                       selectedFilter.id === filter.id && styles.filterItemSelected,
//                     ]}
//                     onPress={() => handleFilterSelect(filter)}
//                     activeOpacity={0.8}
//                   >
//                     <View style={styles.filterPreviewContainer}>
//                       <Image
//                         source={{ uri: photoUrl }}
//                         style={styles.filterPreview}
//                         resizeMode="cover"
//                       />
//                       {filter.id === 'grayscale' && (
//                         <View style={[styles.filterPreviewOverlay, { backgroundColor: 'rgba(128, 128, 128, 0.5)' }]} />
//                       )}
//                       {filter.style.tintColor && (
//                         <View style={[styles.filterPreviewOverlay, { backgroundColor: filter.style.tintColor }]} />
//                       )}
//                     </View>
//                     <Text style={styles.filterName}>{filter.name}</Text>
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>
//             </View>
//           </View>
//         </Modal>

//         {/* Stickers Modal */}
//         <Modal
//           visible={showStickersModal}
//           transparent={true}
//           animationType="slide"
//           onRequestClose={() => setShowStickersModal(false)}
//         >
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContent}>
//               <View style={styles.modalHeader}>
//                 <Text style={styles.modalTitle}>Stickers</Text>
//                 <TouchableOpacity
//                   onPress={() => setShowStickersModal(false)}
//                   activeOpacity={0.7}
//                 >
//                   <MaterialCommunityIcons name="close" size={28} color="#FFFFFC" />
//                 </TouchableOpacity>
//               </View>
//               <ScrollView
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 contentContainerStyle={styles.stickersContent}
//               >
//                 {STICKERS.map((sticker) => (
//                   <TouchableOpacity
//                     key={sticker.id}
//                     style={styles.stickerItem}
//                     onPress={() => handleAddSticker(sticker)}
//                     activeOpacity={0.8}
//                   >
//                     {sticker.type === 'emoji' ? (
//                       <Text style={styles.stickerEmoji}>{sticker.emoji}</Text>
//                     ) : (
//                       <Image source={sticker.source} style={styles.stickerImage} />
//                     )}
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>
//             </View>
//           </View>
//         </Modal>
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
//     width: SCREEN_WIDTH * 0.98,
//     height: SCREEN_HEIGHT * 0.7,
//     marginLeft: SCREEN_WIDTH * 0.01,
//     marginTop: SCREEN_HEIGHT * 0.01,
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
//   filterOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   stickerWrapper: {
//     position: 'absolute',
//     padding: 5,
//   },
//   stickerSelected: {
//     borderWidth: 2,
//     borderColor: '#E5A602',
//     borderStyle: 'dashed',
//     borderRadius: 5,
//   },
//   placedSticker: {
//     fontSize: 48,
//   },
//   placedStickerImage: {
//     width: 48,
//     height: 48,
//   },
//   deleteStickerButton: {
//     position: 'absolute',
//     top: SCREEN_HEIGHT * 0.02,
//     right: SCREEN_WIDTH * 0.05,
//     width: 50,
//     height: 50,
//     backgroundColor: '#F81C1F',
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   bottomControls: {
//     position: 'absolute',
//     bottom: SCREEN_HEIGHT * 0.08,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: SCREEN_WIDTH * 0.05,
//   },
//   controlButton: {
//     width: SCREEN_WIDTH * 0.13,
//     height: SCREEN_WIDTH * 0.13,
//     backgroundColor: '#8B8C83',
//     borderRadius: 45,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   confirmButton: {
//     width: SCREEN_WIDTH * 0.16,
//     height: SCREEN_WIDTH * 0.16,
//     backgroundColor: '#E5A602',
//     borderRadius: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginHorizontal: SCREEN_WIDTH * 0.15,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#1a1a1a',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingBottom: SCREEN_HEIGHT * 0.03,
//     maxHeight: SCREEN_HEIGHT * 0.4,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: SCREEN_WIDTH * 0.05,
//     paddingVertical: SCREEN_HEIGHT * 0.02,
//     borderBottomWidth: 1,
//     borderBottomColor: '#333',
//   },
//   modalTitle: {
//     fontFamily: 'Poppins',
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#FFFFFC',
//   },
//   filtersContent: {
//     paddingHorizontal: SCREEN_WIDTH * 0.05,
//     paddingVertical: SCREEN_HEIGHT * 0.02,
//     gap: 15,
//   },
//   filterItem: {
//     width: SCREEN_WIDTH * 0.18,
//     alignItems: 'center',
//   },
//   filterItemSelected: {
//     borderColor: '#E5A602',
//     borderWidth: 3,
//     borderRadius: 8,
//     padding: 2,
//   },
//   filterPreviewContainer: {
//     width: SCREEN_WIDTH * 0.16,
//     height: SCREEN_WIDTH * 0.16,
//     borderRadius: 8,
//     overflow: 'hidden',
//     marginBottom: 5,
//     position: 'relative',
//   },
//   filterPreview: {
//     width: '100%',
//     height: '100%',
//   },
//   filterPreviewOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   filterName: {
//     fontFamily: 'Poppins',
//     fontSize: 11,
//     color: '#FFFFFC',
//     textAlign: 'center',
//   },
//   stickersContent: {
//     paddingHorizontal: SCREEN_WIDTH * 0.05,
//     paddingVertical: SCREEN_HEIGHT * 0.02,
//     gap: 15,
//     alignItems: 'center',
//   },
//   stickerItem: {
//     width: SCREEN_WIDTH * 0.14,
//     height: SCREEN_WIDTH * 0.14,
//     backgroundColor: '#292A24',
//     borderRadius: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   stickerEmoji: {
//     fontSize: 28,
//   },
//   stickerImage: {
//     width: '70%',
//     height: '70%',
//     borderRadius: 20,
//   },
// });
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { deleteObject, ref, uploadBytes } from 'firebase/storage';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { storage } from '../../firebase/firebaseConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Filters configuration
const FILTERS = [
  { id: 'none', name: 'Original', style: {} },
  { 
    id: 'grayscale', 
    name: 'B&W', 
    style: {
      tintColor: undefined,
      opacity: 1,
    },
    imageStyle: {}
  },
  { 
    id: 'sepia', 
    name: 'Sepia', 
    style: {
      tintColor: 'rgba(112, 66, 20, 0.4)',
    }
  },
  { 
    id: 'warm', 
    name: 'Warm', 
    style: {
      tintColor: 'rgba(255, 140, 0, 0.3)',
    }
  },
  { 
    id: 'cool', 
    name: 'Cool', 
    style: {
      tintColor: 'rgba(0, 191, 255, 0.3)',
    }
  },
  { 
    id: 'vintage', 
    name: 'Vintage', 
    style: {
      tintColor: 'rgba(139, 69, 19, 0.35)',
    }
  },
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

// Text colors
const TEXT_COLORS = [
  { id: 'white', color: '#FFFFFF', name: 'White' },
  { id: 'black', color: '#000000', name: 'Black' },
  { id: 'red', color: '#FF0000', name: 'Red' },
  { id: 'blue', color: '#0000FF', name: 'Blue' },
  { id: 'green', color: '#00FF00', name: 'Green' },
  { id: 'yellow', color: '#FFD700', name: 'Yellow' },
  { id: 'orange', color: '#FF6600', name: 'Orange' },
  { id: 'purple', color: '#9932CC', name: 'Purple' },
  { id: 'pink', color: '#FF69B4', name: 'Pink' },
];

// Text fonts
const TEXT_FONTS = [
  { id: 'system', name: 'System', fontFamily: undefined },
  { id: 'poppins', name: 'Poppins', fontFamily: 'Poppins' },
  { id: 'poppins-bold', name: 'Poppins Bold', fontFamily: 'Poppins-Bold' },
];

interface StickerInstance {
  id: string;
  type: 'emoji' | 'image' | 'text';
  emoji?: string;
  source?: any;
  text?: string;
  textColor?: string;
  textSize?: number;
  textFont?: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
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
  const [isSharing, setIsSharing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showStickersModal, setShowStickersModal] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [showTextEditModal, setShowTextEditModal] = useState(false);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  
  // Text customization states
  const [currentText, setCurrentText] = useState('');
  const [currentTextColor, setCurrentTextColor] = useState('#FFFFFF');
  const [currentTextSize, setCurrentTextSize] = useState(32);
  const [currentTextFont, setCurrentTextFont] = useState<string | undefined>(undefined);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const imageViewRef = useRef<View>(null);
  const stickerStartPos = useRef({ x: 0, y: 0 });
  const stickerStartScale = useRef(1);
  const stickerStartRotation = useRef(0);
  const initialDistance = useRef(0);
  const initialAngle = useRef(0);
  const initialTouchX = useRef(0);
  const initialTouchY = useRef(0);

  console.log('Edit Image Screen Loaded');

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

  const handleShare = async () => {
    try {
      setIsSharing(true);
      
      const wasSelected = selectedStickerId;
      setSelectedStickerId(null);
      
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!imageViewRef.current) {
        Alert.alert('Error', 'Image not ready for sharing.');
        setIsSharing(false);
        if (wasSelected) setSelectedStickerId(wasSelected);
        return;
      }

      const uri = await captureRef(imageViewRef, {
        format: 'jpg',
        quality: 0.9,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/jpeg',
          dialogTitle: 'Share your edited photo',
        });
      } else {
        Alert.alert('Error', 'Sharing is not available on this device.');
      }
      
      if (wasSelected) setSelectedStickerId(wasSelected);
    } catch (error) {
      console.error('Error sharing photo:', error);
      Alert.alert('Error', 'Failed to share photo. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleOpenTextModal = () => {
    setCurrentText('');
    setCurrentTextColor('#FFFFFF');
    setCurrentTextSize(32);
    setCurrentTextFont(undefined);
    setEditingTextId(null);
    setShowTextModal(true);
  };

  const handleAddText = () => {
    if (!currentText.trim()) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }

    const newTextSticker: StickerInstance = {
      id: `text_${Date.now()}`,
      type: 'text',
      text: currentText,
      textColor: currentTextColor,
      textSize: currentTextSize,
      textFont: currentTextFont,
      x: SCREEN_WIDTH * 0.4,
      y: SCREEN_HEIGHT * 0.3,
      scale: 1,
      rotation: 0,
    };
    setPlacedStickers([...placedStickers, newTextSticker]);
    setSelectedStickerId(newTextSticker.id);
    setShowTextModal(false);
    setCurrentText('');
  };

  const handleEditText = () => {
    if (!selectedStickerId) return;
    
    const sticker = placedStickers.find(s => s.id === selectedStickerId);
    if (sticker && sticker.type === 'text') {
      setCurrentText(sticker.text || '');
      setCurrentTextColor(sticker.textColor || '#FFFFFF');
      setCurrentTextSize(sticker.textSize || 32);
      setCurrentTextFont(sticker.textFont);
      setEditingTextId(sticker.id);
      setShowTextEditModal(true);
    }
  };

  const handleUpdateText = () => {
    if (!currentText.trim() || !editingTextId) {
      Alert.alert('Error', 'Please enter some text');
      return;
    }

    setPlacedStickers(prev =>
      prev.map(s =>
        s.id === editingTextId
          ? {
              ...s,
              text: currentText,
              textColor: currentTextColor,
              textSize: currentTextSize,
              textFont: currentTextFont,
            }
          : s
      )
    );
    setShowTextEditModal(false);
    setEditingTextId(null);
  };

  const handleAddSticker = (sticker: typeof STICKERS[0]) => {
    const newSticker: StickerInstance = {
      id: `${sticker.id}_${Date.now()}`,
      type: sticker.type as 'emoji' | 'image',
      emoji: sticker.type === 'emoji' ? sticker.emoji : undefined,
      source: sticker.type === 'image' ? sticker.source : undefined,
      x: SCREEN_WIDTH * 0.4,
      y: SCREEN_HEIGHT * 0.3,
      scale: 1,
      rotation: 0,
    };
    setPlacedStickers([...placedStickers, newSticker]);
    setSelectedStickerId(newSticker.id);
    setShowStickersModal(false);
  };

  const handleRemoveSticker = () => {
    if (selectedStickerId) {
      Alert.alert(
        'Remove Sticker',
        'Do you want to remove this sticker?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              setPlacedStickers(prev => prev.filter(s => s.id !== selectedStickerId));
              setSelectedStickerId(null);
            },
          },
        ]
      );
    }
  };

  const getDistance = (touches: any[]) => {
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getAngle = (touches: any[]) => {
    const dx = touches[1].pageX - touches[0].pageX;
    const dy = touches[1].pageY - touches[0].pageY;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  };

  const handleStickerTouchStart = (e: any, stickerId: string) => {
    e.stopPropagation();
    setSelectedStickerId(stickerId);
    const sticker = placedStickers.find(s => s.id === stickerId);
    if (!sticker) return;

    if (e.nativeEvent.touches.length === 1) {
      const touch = e.nativeEvent.touches[0];
      initialTouchX.current = touch.pageX;
      initialTouchY.current = touch.pageY;
      stickerStartPos.current = { x: sticker.x, y: sticker.y };
    } else if (e.nativeEvent.touches.length === 2) {
      stickerStartScale.current = sticker.scale;
      stickerStartRotation.current = sticker.rotation;
      initialDistance.current = getDistance(e.nativeEvent.touches);
      initialAngle.current = getAngle(e.nativeEvent.touches);
    }
  };

  const handleStickerTouchMove = (e: any, stickerId: string) => {
    e.stopPropagation();
    const sticker = placedStickers.find(s => s.id === stickerId);
    if (!sticker) return;

    if (e.nativeEvent.touches.length === 1) {
      const touch = e.nativeEvent.touches[0];
      const deltaX = touch.pageX - initialTouchX.current;
      const deltaY = touch.pageY - initialTouchY.current;

      setPlacedStickers(prev =>
        prev.map(s =>
          s.id === stickerId
            ? { 
                ...s, 
                x: stickerStartPos.current.x + deltaX,
                y: stickerStartPos.current.y + deltaY
              }
            : s
        )
      );
    } else if (e.nativeEvent.touches.length === 2) {
      const currentDistance = getDistance(e.nativeEvent.touches);
      const currentAngle = getAngle(e.nativeEvent.touches);

      const scaleChange = currentDistance / initialDistance.current;
      const rotationChange = currentAngle - initialAngle.current;

      setPlacedStickers(prev =>
        prev.map(s =>
          s.id === stickerId
            ? {
                ...s,
                scale: Math.max(0.5, Math.min(3, stickerStartScale.current * scaleChange)),
                rotation: stickerStartRotation.current + rotationChange,
              }
            : s
        )
      );
    }
  };

  const handleFilterSelect = (filter: typeof FILTERS[0]) => {
    setSelectedFilter(filter);
    setShowFiltersModal(false);
  };

  const handleSaveEdited = async () => {
    if (selectedFilter.id === 'none' && placedStickers.length === 0) {
      Alert.alert('No Changes', 'Please apply a filter or add stickers before saving.');
      return;
    }

    try {
      setIsSaving(true);
      
      const wasSelected = selectedStickerId;
      setSelectedStickerId(null);
      
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!imageViewRef.current) {
        Alert.alert('Error', 'Image not ready for saving.');
        setIsSaving(false);
        if (wasSelected) setSelectedStickerId(wasSelected);
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

  const renderTextCustomizationModal = (isEdit: boolean) => {
    const visible = isEdit ? showTextEditModal : showTextModal;
    const onClose = () => isEdit ? setShowTextEditModal(false) : setShowTextModal(false);
    const onConfirm = isEdit ? handleUpdateText : handleAddText;

    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.textModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEdit ? 'Edit Text' : 'Add Text'}</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <MaterialCommunityIcons name="close" size={28} color="#FFFFFC" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.textModalScroll}>
              {/* Text Input */}
              <View style={styles.textInputSection}>
                <Text style={styles.sectionLabel}>Text</Text>
                <TextInput
                  style={styles.textInput}
                  value={currentText}
                  onChangeText={setCurrentText}
                  placeholder="Enter text here..."
                  placeholderTextColor="#666"
                  multiline
                  maxLength={100}
                />
              </View>

              {/* Color Selection */}
              <View style={styles.textSection}>
                <Text style={styles.sectionLabel}>Color</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.colorGrid}>
                    {TEXT_COLORS.map((color) => (
                      <TouchableOpacity
                        key={color.id}
                        style={[
                          styles.colorItem,
                          { backgroundColor: color.color },
                          currentTextColor === color.color && styles.colorItemSelected,
                        ]}
                        onPress={() => setCurrentTextColor(color.color)}
                        activeOpacity={0.8}
                      />
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Font Selection */}
              <View style={styles.textSection}>
                <Text style={styles.sectionLabel}>Font</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.fontGrid}>
                    {TEXT_FONTS.map((font) => (
                      <TouchableOpacity
                        key={font.id}
                        style={[
                          styles.fontItem,
                          currentTextFont === font.fontFamily && styles.fontItemSelected,
                        ]}
                        onPress={() => setCurrentTextFont(font.fontFamily)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.fontItemText, { fontFamily: font.fontFamily }]}>
                          {font.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Size Selection */}
              <View style={styles.textSection}>
                <Text style={styles.sectionLabel}>Size: {currentTextSize}px</Text>
                <View style={styles.sizeButtons}>
                  {[24, 32, 40, 48, 56, 64].map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeButton,
                        currentTextSize === size && styles.sizeButtonSelected,
                      ]}
                      onPress={() => setCurrentTextSize(size)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.sizeButtonText}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Preview */}
              <View style={styles.previewSection}>
                <Text style={styles.sectionLabel}>Preview</Text>
                <View style={styles.previewContainer}>
                  <Text
                    style={[
                      styles.previewText,
                      {
                        color: currentTextColor,
                        fontSize: currentTextSize,
                        fontFamily: currentTextFont,
                      },
                    ]}
                  >
                    {currentText || 'Your text here'}
                  </Text>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.addTextButton}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.addTextButtonText}>{isEdit ? 'Update Text' : 'Add Text'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
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
              onPress={handleOpenTextModal}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="format-text"
                size={28}
                color="#FFFFFC"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleShare}
              activeOpacity={0.7}
              disabled={isSharing}
            >
              {isSharing ? (
                <ActivityIndicator size="small" color="#FFFFFC" />
              ) : (
                <MaterialCommunityIcons
                  name="share-variant"
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
            style={styles.mainImage}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
            onError={(error) => {
              console.error('Error loading image:', error);
              Alert.alert('Error', 'Failed to load image');
            }}
          />
          {/* Filter Overlay */}
          {selectedFilter.id === 'grayscale' && (
            <View style={[styles.filterOverlay, { backgroundColor: 'rgba(128, 128, 128, 0.5)' }]} />
          )}
          {selectedFilter.style.tintColor && (
            <View style={[styles.filterOverlay, { backgroundColor: selectedFilter.style.tintColor }]} />
          )}
          {/* Placed Stickers */}
          {placedStickers.map((sticker) => (
            <View
              key={sticker.id}
              style={[
                styles.stickerWrapper,
                {
                  left: sticker.x,
                  top: sticker.y,
                  transform: [
                    { scale: sticker.scale },
                    { rotate: `${sticker.rotation}deg` },
                  ],
                },
                selectedStickerId === sticker.id && styles.stickerSelected,
              ]}
              onStartShouldSetResponder={() => true}
              onResponderGrant={(e) => handleStickerTouchStart(e, sticker.id)}
              onResponderMove={(e) => handleStickerTouchMove(e, sticker.id)}
            >
              {sticker.type === 'emoji' ? (
                <Text style={styles.placedSticker}>
                  {sticker.emoji}
                </Text>
              ) : sticker.type === 'text' ? (
                <Text
                  style={[
                    styles.placedTextSticker,
                    {
                      color: sticker.textColor,
                      fontSize: sticker.textSize,
                      fontFamily: sticker.textFont,
                    },
                  ]}
                >
                  {sticker.text}
                </Text>
              ) : (
                <Image
                  source={sticker.source}
                  style={styles.placedStickerImage}
                />
              )}
            </View>
          ))}
          
          {/* Action Buttons - Shows when a sticker is selected */}
          {selectedStickerId && (
            <View style={styles.stickerActions}>
              {placedStickers.find(s => s.id === selectedStickerId)?.type === 'text' && (
                <TouchableOpacity
                  style={styles.editStickerButton}
                  onPress={handleEditText}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={24}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.deleteStickerButton}
                onPress={handleRemoveSticker}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="delete"
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Filter Button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowFiltersModal(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="image-edit-outline"
              size={24}
              color="#000000"
            />
          </TouchableOpacity>

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

          {/* Sticker Button */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setShowStickersModal(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="sticker-emoji"
              size={24}
              color="#000000"
            />
          </TouchableOpacity>
        </View>

        {/* Filters Modal */}
        <Modal
          visible={showFiltersModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFiltersModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filters</Text>
                <TouchableOpacity
                  onPress={() => setShowFiltersModal(false)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="close" size={28} color="#FFFFFC" />
                </TouchableOpacity>
              </View>
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
                    onPress={() => handleFilterSelect(filter)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.filterPreviewContainer}>
                      <Image
                        source={{ uri: photoUrl }}
                        style={styles.filterPreview}
                        resizeMode="cover"
                      />
                      {filter.id === 'grayscale' && (
                        <View style={[styles.filterPreviewOverlay, { backgroundColor: 'rgba(128, 128, 128, 0.5)' }]} />
                      )}
                      {filter.style.tintColor && (
                        <View style={[styles.filterPreviewOverlay, { backgroundColor: filter.style.tintColor }]} />
                      )}
                    </View>
                    <Text style={styles.filterName}>{filter.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Stickers Modal */}
        <Modal
          visible={showStickersModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowStickersModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Stickers</Text>
                <TouchableOpacity
                  onPress={() => setShowStickersModal(false)}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="close" size={28} color="#FFFFFC" />
                </TouchableOpacity>
              </View>
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
        </Modal>

        {/* Text Modal */}
        {renderTextCustomizationModal(false)}
        
        {/* Text Edit Modal */}
        {renderTextCustomizationModal(true)}
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
    width: SCREEN_WIDTH * 0.98,
    height: SCREEN_HEIGHT * 0.7,
    marginLeft: SCREEN_WIDTH * 0.01,
    marginTop: SCREEN_HEIGHT * 0.01,
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
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stickerWrapper: {
    position: 'absolute',
    padding: 5,
  },
  stickerSelected: {
    borderWidth: 2,
    borderColor: '#E5A602',
    borderStyle: 'dashed',
    borderRadius: 5,
  },
  placedSticker: {
    fontSize: 48,
  },
  placedTextSticker: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  placedStickerImage: {
    width: 48,
    height: 48,
  },
  stickerActions: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.02,
    right: SCREEN_WIDTH * 0.05,
    flexDirection: 'row',
    gap: 10,
  },
  editStickerButton: {
    width: 50,
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteStickerButton: {
    width: 50,
    height: 50,
    backgroundColor: '#F81C1F',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomControls: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.08,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  controlButton: {
    width: SCREEN_WIDTH * 0.13,
    height: SCREEN_WIDTH * 0.13,
    backgroundColor: '#8B8C83',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    width: SCREEN_WIDTH * 0.16,
    height: SCREEN_WIDTH * 0.16,
    backgroundColor: '#E5A602',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SCREEN_WIDTH * 0.15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: SCREEN_HEIGHT * 0.03,
    maxHeight: SCREEN_HEIGHT * 0.4,
  },
  textModalContent: {
    maxHeight: SCREEN_HEIGHT * 0.75,
  },
  textModalScroll: {
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingVertical: SCREEN_HEIGHT * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontFamily: 'Poppins',
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFC',
  },
  textInputSection: {
    marginTop: 20,
  },
  textSection: {
    marginTop: 25,
  },
  sectionLabel: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFC',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#292A24',
    borderRadius: 10,
    padding: 15,
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#FFFFFC',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  colorGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  colorItem: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: '#333',
  },
  colorItemSelected: {
    borderColor: '#E5A602',
    borderWidth: 3,
  },
  fontGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  fontItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#292A24',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333',
  },
  fontItemSelected: {
    borderColor: '#E5A602',
    borderWidth: 2,
  },
  fontItemText: {
    fontSize: 14,
    color: '#FFFFFC',
  },
  sizeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#292A24',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
  },
  sizeButtonSelected: {
    borderColor: '#E5A602',
    backgroundColor: '#3a3b34',
  },
  sizeButtonText: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#FFFFFC',
    fontWeight: '600',
  },
  previewSection: {
    marginTop: 25,
    marginBottom: 20,
  },
  previewContainer: {
    backgroundColor: '#292A24',
    borderRadius: 10,
    padding: 20,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  addTextButton: {
    backgroundColor: '#E5A602',
    marginHorizontal: SCREEN_WIDTH * 0.05,
    marginTop: 15,
    marginBottom: 10,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addTextButtonText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  filtersContent: {
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingVertical: SCREEN_HEIGHT * 0.02,
    gap: 15,
  },
  filterItem: {
    width: SCREEN_WIDTH * 0.18,
    alignItems: 'center',
  },
  filterItemSelected: {
    borderColor: '#E5A602',
    borderWidth: 3,
    borderRadius: 8,
    padding: 2,
  },
  filterPreviewContainer: {
    width: SCREEN_WIDTH * 0.16,
    height: SCREEN_WIDTH * 0.16,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 5,
    position: 'relative',
  },
  filterPreview: {
    width: '100%',
    height: '100%',
  },
  filterPreviewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  filterName: {
    fontFamily: 'Poppins',
    fontSize: 11,
    color: '#FFFFFC',
    textAlign: 'center',
  },
  stickersContent: {
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingVertical: SCREEN_HEIGHT * 0.02,
    gap: 15,
    alignItems: 'center',
  },
  stickerItem: {
    width: SCREEN_WIDTH * 0.14,
    height: SCREEN_WIDTH * 0.14,
    backgroundColor: '#292A24',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stickerEmoji: {
    fontSize: 28,
  },
  stickerImage: {
    width: '70%',
    height: '70%',
    borderRadius: 20,
  },
});