import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../firebase/firebaseConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Default event name suggestions
const DEFAULT_NAMES = [
  "Van & Name's Wedding",
  "Marie's Bachelor Party",
  "Happy Anniversary! Lee & Freida",
  "Our Trip to Faroe Islands",
  "Daryl's Birthday Party",
];

export default function NameEvent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const userId = params.userId as string;
  
  const [eventName, setEventName] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchEventNames();
  }, []);

  const fetchEventNames = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all event names from Firebase
      const eventsRef = collection(db, 'events');
      const querySnapshot = await getDocs(eventsRef);
      
      const retrievedNames: string[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.eventName) {
          retrievedNames.push(data.eventName);
        }
      });
      
      // Combine default names and retrieved names, then sort alphabetically
      const allNames = [...DEFAULT_NAMES, ...retrievedNames];
      const uniqueNames = Array.from(new Set(allNames)); // Remove duplicates
      const sortedNames = uniqueNames.sort((a, b) => 
        a.toLowerCase().localeCompare(b.toLowerCase())
      );
      
      setSuggestions(sortedNames);
      console.log('Event name suggestions loaded:', sortedNames.length);
    } catch (error) {
      console.error('Error fetching event names:', error);
      // Use default names if fetching fails
      setSuggestions(DEFAULT_NAMES.sort());
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSuggestionPress = (name: string) => {
    setEventName(name);
  };

  const handleContinue = async () => {
    if (!eventName.trim()) {
      Alert.alert('Error', 'Please enter an event name');
      return;
    }

    setIsSaving(true);

    try {
      // Generate a unique event ID
      const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create event document in Firestore
      const eventRef = doc(collection(db, 'events'), eventId);
      await setDoc(eventRef, {
        eventId: eventId,
        eventName: eventName.trim(),
        userId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log('Event created successfully:', eventId);

      // Navigate to event image screen
      router.push({
        pathname: '../../createEvent/eventImage',
        params: {
          eventId: eventId,
          eventName: eventName.trim(),
          userId: userId,
        },
      });
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setIsSaving(false);
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
          <Text style={styles.title}>Event Name</Text>
        </View>

        {/* Event Name Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={eventName}
            onChangeText={setEventName}
            placeholder="Start typing event name"
            placeholderTextColor="#8B8C83"
          />
        </View>

        {/* Examples Section */}
        <Text style={styles.examplesLabel}>Examples</Text>

        {/* Suggestions List */}
        <ScrollView
          style={styles.suggestionsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsContent}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#FFB703" style={styles.loader} />
          ) : (
            suggestions.map((name, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionBox}
                onPress={() => handleSuggestionPress(name)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionText}>{name}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Continue Button */}
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
    paddingHorizontal: SCREEN_WIDTH * 0.047, // ~19px on 401px screen
    marginTop: SCREEN_HEIGHT * 0.02, // ~17px from top
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
    fontSize: 20,
    lineHeight: 30,
    color: '#FFFFFC',
    marginLeft: SCREEN_WIDTH * 0.12, // Center text considering back button
  },
  inputContainer: {
    width: SCREEN_WIDTH * 0.908, // ~364px on 401px screen
    height: 59,
    backgroundColor: '#292A24',
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: SCREEN_HEIGHT * 0.054, // ~44px from header (139px - 95px)
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  input: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 27,
    color: '#FFFFFC',
    padding: 0,
  },
  examplesLabel: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 26,
    color: '#FFFFFC',
    marginLeft: SCREEN_WIDTH * 0.065, // ~26px from left
    marginTop: 11,
  },
  suggestionsList: {
    flex: 1,
    marginTop: 6,
    paddingHorizontal: SCREEN_WIDTH * 0.065, // ~26px from sides
  },
  suggestionsContent: {
    paddingBottom: 100, // Space for continue button
  },
  loader: {
    marginTop: 20,
  },
  suggestionBox: {
    backgroundColor: '#292A24',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 4,
    alignSelf: 'flex-start',
    minHeight: 32,
    justifyContent: 'center',
  },
  suggestionText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 17,
    lineHeight: 26,
    color: '#FFFFFC',
  },
  continueButton: {
    width: SCREEN_WIDTH * 0.761, // ~305px on 401px screen
    height: 58,
    backgroundColor: '#E5A602',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.036, // ~30px from bottom (830px - 800px)
    alignSelf: 'center',
    left: (SCREEN_WIDTH - (SCREEN_WIDTH * 0.761)) / 2,
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
});