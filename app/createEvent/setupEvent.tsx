import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Image,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../firebase/firebaseConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function SetupEvent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const eventId = params.eventId as string;
  const userId = params.userId as string;
  const initialCoverImageUri = params.coverImageUri as string;
  
  const [eventName, setEventName] = useState(params.eventName as string);
  const [isEditingName, setIsEditingName] = useState(false);
  const [coverImageUri, setCoverImageUri] = useState(initialCoverImageUri);
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [revealPhotos, setRevealPhotos] = useState<'During' | 'After'>('During');
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [guestCanViewGallery, setGuestCanViewGallery] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Animation values for success
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  const modalTranslateY = useSharedValue(SCREEN_HEIGHT);

  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: modalTranslateY.value }],
    };
  });

  const handleBack = () => {
    router.back();
  };

  const openRevealModal = () => {
    setShowRevealModal(true);
    modalTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  };

  const closeRevealModal = () => {
    modalTranslateY.value = withSpring(SCREEN_HEIGHT, { damping: 15, stiffness: 100 });
    setTimeout(() => setShowRevealModal(false), 300);
  };

  const handleConfirmReveal = () => {
    modalTranslateY.value = withSpring(SCREEN_HEIGHT, { damping: 15, stiffness: 100 });
    setTimeout(() => setShowRevealModal(false), 300);
  };

  const handleImagePress = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to change the cover image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 5],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCoverImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    return date.toLocaleDateString('en-PH', options).replace(',', ' at');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      setTimeout(() => setShowTimePicker(true), 300);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(endDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setEndDate(newDate);
    }
  };

  const showSuccessAnimation = (callback: () => void) => {
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
        setTimeout(callback, 1500);
      });
    });
  };

  const handleContinue = async () => {
    if (!eventName.trim()) {
      Alert.alert('Error', 'Please enter an event name');
      return;
    }

    setIsSaving(true);

    try {
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        eventName: eventName.trim(),
        coverImageUri: coverImageUri,
        endDate: endDate.toISOString(),
        revealPhotos: revealPhotos,
        guestCanViewGallery: guestCanViewGallery,
        updatedAt: new Date().toISOString(),
      });

      console.log('Event setup completed:', eventId);

      setIsSaving(false);

      // Show success animation
      showSuccessAnimation(() => {
        setShowSuccess(false);
        router.push({
          pathname: '../../createEvent/eventQR',
          params: {
            eventId: eventId,
            eventName: eventName.trim(),
            userId: userId,
          },
        });
      });
    } catch (error) {
      console.error('Error saving event setup:', error);
      setIsSaving(false);
      Alert.alert('Error', 'Failed to save event setup. Please try again.');
    }
  };

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
              Event Successfully Created
            </Animated.Text>
          </View>
        )}

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

        {/* Cover Image - Now Clickable */}
        <TouchableOpacity onPress={handleImagePress} activeOpacity={0.8} style={styles.coverImageContainer}>
          <Image
            source={{ uri: coverImageUri }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <View style={styles.imageEditOverlay}>
            <MaterialCommunityIcons
              name="camera"
              size={24}
              color="#FFB703"
            />
            <Text style={styles.imageEditText}>Tap to change</Text>
          </View>
        </TouchableOpacity>

        {/* Event Name with Edit Icon */}
        <View style={styles.eventNameContainer}>
          {isEditingName ? (
            <TextInput
              style={styles.eventNameInput}
              value={eventName}
              onChangeText={setEventName}
              onBlur={() => setIsEditingName(false)}
              autoFocus
            />
          ) : (
            <Text style={styles.eventNameText}>{eventName}</Text>
          )}
          <TouchableOpacity
            onPress={() => setIsEditingName(true)}
            style={styles.editIcon}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color="#FFFFFC"
            />
          </TouchableOpacity>
        </View>

        {/* Card 1: Event End Date/Time */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="calendar-text"
            size={26}
            color="#FFB703"
            style={styles.cardIcon}
          />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardLabel}>Ending (GMT+08:00)</Text>
            <Text style={styles.cardValue}>{formatDate(endDate)}</Text>
          </View>
        </TouchableOpacity>

        {/* Card 2: Reveal Photos */}
        <TouchableOpacity
          style={styles.card}
          onPress={openRevealModal}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="image-outline"
            size={26}
            color="#FFB703"
            style={styles.cardIcon}
          />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardLabel}>Reveal Photos</Text>
            <Text style={styles.cardValue}>{revealPhotos}</Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color="#8B8C83"
            style={styles.chevronRight}
          />
        </TouchableOpacity>

        {/* Card 3: Gallery Toggle */}
        <View style={styles.card}>
          <MaterialCommunityIcons
            name="image-multiple-outline"
            size={26}
            color="#FFB703"
            style={styles.cardIcon}
          />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardLabel}>Gallery</Text>
            <Text style={styles.cardValue}>Guest can view Gallery</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.toggle,
              guestCanViewGallery && styles.toggleActive,
            ]}
            onPress={() => setGuestCanViewGallery(!guestCanViewGallery)}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.toggleSwitch,
                guestCanViewGallery && styles.toggleSwitchActive,
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Continue Button - Moved up slightly */}
        <TouchableOpacity
          style={[styles.continueButton, isSaving && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>

        {/* Date Picker with Yellow Accent */}
        {showDatePicker && Platform.OS === 'ios' && (
          <Modal visible transparent animationType="fade">
            <View style={styles.pickerModalOverlay}>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.pickerButton}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={(event) => {
                    setShowDatePicker(false);
                    setTimeout(() => setShowTimePicker(true), 300);
                  }}>
                    <Text style={styles.pickerButton}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, date) => {
                    if (date) setEndDate(date);
                  }}
                  minimumDate={new Date()}
                  textColor="#FFB703"
                  style={styles.picker}
                />
              </View>
            </View>
          </Modal>
        )}
        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Time Picker with Yellow Accent */}
        {showTimePicker && Platform.OS === 'ios' && (
          <Modal visible transparent animationType="fade">
            <View style={styles.pickerModalOverlay}>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.pickerButton}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.pickerButton}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={endDate}
                  mode="time"
                  display="spinner"
                  onChange={(event, time) => {
                    if (time) {
                      const newDate = new Date(endDate);
                      newDate.setHours(time.getHours());
                      newDate.setMinutes(time.getMinutes());
                      setEndDate(newDate);
                    }
                  }}
                  textColor="#FFB703"
                  style={styles.picker}
                />
              </View>
            </View>
          </Modal>
        )}
        {showTimePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={endDate}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}

        {/* Reveal Photos Modal - Extended Height */}
        <Modal
          visible={showRevealModal}
          transparent
          animationType="none"
          onRequestClose={closeRevealModal}
        >
          <TouchableWithoutFeedback onPress={closeRevealModal}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <Animated.View style={[styles.modalContent, animatedModalStyle]}>
                  <Text style={styles.modalTitle}>Reveal Photos</Text>
                  <Text style={styles.modalDescription}>
                    When would you like your guests to see{'\n'}the pictures taken during the event?
                  </Text>

                  {/* During Option */}
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      revealPhotos === 'During' && styles.optionButtonActive,
                    ]}
                    onPress={() => setRevealPhotos('During')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionText}>During</Text>
                    <MaterialCommunityIcons
                      name={revealPhotos === 'During' ? 'check-circle' : 'checkbox-blank-circle-outline'}
                      size={27}
                      color={revealPhotos === 'During' ? '#FFB703' : '#E5A602'}
                    />
                  </TouchableOpacity>

                  {/* After Option */}
                  <TouchableOpacity
                    style={[
                      styles.optionButton,
                      revealPhotos === 'After' && styles.optionButtonActive,
                    ]}
                    onPress={() => setRevealPhotos('After')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionText}>After</Text>
                    <MaterialCommunityIcons
                      name={revealPhotos === 'After' ? 'check-circle' : 'checkbox-blank-circle-outline'}
                      size={27}
                      color={revealPhotos === 'After' ? '#FFB703' : '#E5A602'}
                    />
                  </TouchableOpacity>

                  {/* Confirm Button */}
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={handleConfirmReveal}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: SCREEN_HEIGHT * -0.02,
  },
  content: {
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SCREEN_WIDTH * 0.048,
    marginTop: SCREEN_HEIGHT * 0.018,
  },
  coverImage: {
    width: SCREEN_WIDTH * 0.586,
    height: 392,
    borderRadius: 23,
  },
  coverImageContainer: {
    width: SCREEN_WIDTH * 0.586,
    alignSelf: 'center',
    marginTop: SCREEN_HEIGHT * 0.013,
    borderRadius: 23,
    overflow: 'hidden',
  },
  imageEditOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageEditText: {
    fontFamily: 'Poppins',
    fontSize: 12,
    color: '#FFFFFC',
    marginTop: 2,
  },
  eventNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SCREEN_WIDTH * 0.037,
    marginTop: 19,
  },
  eventNameText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 26,
    color: '#FFFFFC',
  },
  eventNameInput: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 26,
    color: '#FFFFFC',
    borderBottomWidth: 1,
    borderBottomColor: '#FFB703',
    minWidth: 150,
    padding: 0,
  },
  editIcon: {
    marginLeft: 10,
    padding: 5,
  },
  card: {
    width: SCREEN_WIDTH * 0.905,
    height: 61,
    backgroundColor: '#292A24',
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 17,
  },
  cardIcon: {
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardLabel: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 18,
    color: '#8B8C83',
  },
  cardValue: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 20,
    color: '#FFFFFC',
  },
  chevronRight: {
    marginLeft: 10,
  },
  toggle: {
    width: 59,
    height: 33,
    backgroundColor: '#8B8C83',
    borderRadius: 50,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleActive: {
    backgroundColor: '#E5A602',
  },
  toggleSwitch: {
    width: 27,
    height: 25,
    backgroundColor: '#FFFFFC',
    borderRadius: 50,
    alignSelf: 'flex-start',
  },
  toggleSwitchActive: {
    alignSelf: 'flex-end',
  },
  continueButton: {
    width: SCREEN_WIDTH * 0.761,
    height: 58,
    backgroundColor: '#E5A602',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 30,
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#292A24',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 34,
    alignItems: 'center',
    paddingBottom: 0,
    minHeight: SCREEN_HEIGHT * 0.55,
  },
  modalTitle: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 30,
    color: '#FFFFFC',
    marginBottom: 16,
  },
  modalDescription: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: '#FFFFFC',
    marginBottom: 24,
    maxWidth: 255,
  },
  optionButton: {
    width: SCREEN_WIDTH * 0.905,
    height: 61,
    backgroundColor: '#292A24',
    borderWidth: 3,
    borderColor: '#E5A602',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 37,
    marginBottom: 16,
  },
  optionButtonActive: {
    borderColor: '#E5A602',
  },
  optionText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 30,
    color: '#FFFFFC',
  },
  confirmButton: {
    width: SCREEN_WIDTH * 0.853,
    height: 58,
    backgroundColor: '#E5A602',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  confirmButtonText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 20,
    lineHeight: 30,
    color: '#000000',
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
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#38383A',
  },
  pickerButton: {
    fontFamily: 'Poppins',
    fontSize: 17,
    color: '#FFB703',
    fontWeight: '600',
  },
  picker: {
    backgroundColor: '#1C1C1E',
  },
});