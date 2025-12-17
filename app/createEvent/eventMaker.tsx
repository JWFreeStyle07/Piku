import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../firebase/firebaseConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Event {
  id: string;
  eventName: string;
  userId: string;
  createdAt: string;
  // Add other event fields as needed
}

export default function EventMaker() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const userId = params.userId as string;
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserEvents();
  }, []);

  const fetchUserEvents = async () => {
    try {
      setIsLoading(true);
      
      // Query events collection for events created by this user
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const userEvents: Event[] = [];
      querySnapshot.forEach((doc) => {
        userEvents.push({
          id: doc.id,
          ...doc.data(),
        } as Event);
      });
      
      setEvents(userEvents);
      console.log('Fetched events:', userEvents.length);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentEvents = () => {
    router.push('../../createEvent/recentEvents');
  };

  const handleEditProfile = () => {
    router.push('../../profile/editProfile');
  };

  const handleSetupEvent = () => {
    router.push({
      pathname: '../../createEvent/nameEvent',
      params: {
        userId: userId,
      },
    });
  };

  const handleJoin = () => {
    router.push('../../camera/qrScanner');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          {/* Recent Events Icon Button */}
          <TouchableOpacity
            style={styles.recentEventsButton}
            onPress={handleRecentEvents}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="image-area"
              size={24}
              color="#FFFFFC"
            />
          </TouchableOpacity>

          {/* My Events Title */}
          <Text style={styles.title}>My Events</Text>

          {/* Profile Icon Button */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={24}
              color="#FFFFFC"
            />
          </TouchableOpacity>
        </View>

        {/* Main Content Box */}
        <View style={styles.mainBox}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#FFB703" style={styles.loader} />
          ) : events.length > 0 ? (
            // TODO: Display events list here
            <Text style={styles.eventsPlaceholder}>
              You have {events.length} event(s)
            </Text>
          ) : (
            // Empty state - Create Event
            <>
              {/* Plus Circle Icon */}
              <MaterialCommunityIcons
                name="plus-circle-outline"
                size={50}
                color="#ffffffff"
                style={styles.plusIcon}
              />

              {/* Create Event Title */}
              <Text style={styles.createEventTitle}>Create Event</Text>

              {/* Create Event Subtitle */}
              <Text style={styles.createEventSubtitle}>
                Start by setting up your first event
              </Text>

              {/* Setup Event Button */}
              <TouchableOpacity
                style={styles.setupButton}
                onPress={handleSetupEvent}
                activeOpacity={0.8}
              >
                <Text style={styles.setupButtonText}>Setup my event</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Join Button (Bottom Center) */}
        <TouchableOpacity
          style={styles.joinButton}
          onPress={handleJoin}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="qrcode-scan"
            size={24}
            color="#000000"
            style={styles.joinIcon}
          />
          <Text style={styles.joinText}>Join</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_WIDTH * 0.065, // ~26px on 401px screen
    marginTop: SCREEN_HEIGHT * 0.032, // ~68px from top considering safe area
  },
  recentEventsButton: {
    width: 40,
    height: 38,
    backgroundColor: '#292A24',
    borderRadius: 128,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '800',
    fontSize: 23,
    lineHeight: 34,
    color: '#FFFFFC',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  profileButton: {
    width: 38,
    height: 38,
    backgroundColor: '#292A24',
    borderRadius: 128,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainBox: {
    width: SCREEN_WIDTH * 0.883, // ~354px on 401px screen
    height: 256,
    backgroundColor: '#292A24',
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: SCREEN_HEIGHT * 0.051, // ~101px from header (169px - 68px)
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loader: {
    marginTop: 20,
  },
  eventsPlaceholder: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    color: '#FFFFFC',
    textAlign: 'center',
  },
  plusIcon: {
    marginBottom: 20,
  },
  createEventTitle: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 20,
    color: '#FFFFFC',
    marginBottom: 10,
  },
  createEventSubtitle: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 16,
    color: '#FFFFFC',
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: 190,
  },
  setupButton: {
    width: SCREEN_WIDTH * 0.706, // ~283px on 401px screen
    height: 46,
    backgroundColor: '#E5A602',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setupButtonText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 20,
    color: '#000000',
  },
  joinButton: {
    width: 130,
    height: 46,
    backgroundColor: '#E5A602',
    borderRadius: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.033, // ~27px from bottom (830px - 803px)
    alignSelf: 'center',
    left: (SCREEN_WIDTH - 130) / 2,
  },
  joinIcon: {
    marginRight: 8,
  },
  joinText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 27,
    color: '#000000',
  },
});