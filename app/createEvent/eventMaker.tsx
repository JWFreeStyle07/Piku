import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../firebase/firebaseConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Event {
  id: string;
  eventId: string;
  eventName: string;
  userId: string;
  coverImageURL: string;
  endDate: string;
  createdAt: string;
}

// Simple multi-line text component
const MultiLineText: React.FC<{ text: string }> = ({ text }) => {
  return <Text style={styles.eventName}>{text}</Text>;
};

export default function EventMaker() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const userId = params.userId as string;
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchUserEvents();
    }, [userId])
  );

  const fetchUserEvents = async () => {
    try {
      setIsLoading(true);
      
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

  const calculateDaysLeft = (endDateStr: string): string => {
    const endDate = new Date(endDateStr);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Ended';
    if (diffDays === 0) return 'Today';
    return `${diffDays}d left`;
  };

  const formatEventDate = (endDateStr: string): string => {
    const date = new Date(endDateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${day}.${month}.${year} at ${formattedHours}:${minutes} ${ampm}`;
  };

  const handleRecentEvents = () => {
    router.push({
      pathname: '../../createEvent/recentEvents',
      params: {
        userId: userId,
      },
    });
  };

  const handleEditProfile = () => {
    router.push({
      pathname: '../../profile/editProfile',
      params: {
        userId: userId,
      },
    });
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

  const handleEventPress = (event: Event) => {
    router.push({
      pathname: '../../camera/cameraShot',
      params: {
        eventId: event.eventId,
        eventName: event.eventName,
        userId: userId,
      },
    });
  };

  const renderEventCard = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.coverImageURL }}
        style={styles.eventImage}
        resizeMode="cover"
      />
      <View style={styles.eventInfo}>
        <Text style={styles.hostingLabel}>Hosting</Text>
        <MultiLineText text={item.eventName} />
        <Text style={styles.eventDate}>{formatEventDate(item.endDate)}</Text>
      </View>
      <View style={styles.daysLeftContainer}>
        <MaterialCommunityIcons
          name="calendar-text"
          size={14}
          color="#FFFFFC"
        />
        <Text style={styles.daysLeftText}>
          {calculateDaysLeft(item.endDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
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

          <Text style={styles.title}>My Events</Text>

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

        {/* Events List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFB703" />
          </View>
        ) : (
          <FlatList
            data={events}
            renderItem={renderEventCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
              <View style={styles.mainBox}>
                <MaterialCommunityIcons
                  name="plus-circle-outline"
                  size={50}
                  color="#FFFFFC"
                  style={styles.plusIcon}
                />
                <Text style={styles.createEventTitle}>Create Event</Text>
                <Text style={styles.createEventSubtitle}>
                  Start by setting up your first event
                </Text>
                <TouchableOpacity
                  style={styles.setupButton}
                  onPress={handleSetupEvent}
                  activeOpacity={0.8}
                >
                  <Text style={styles.setupButtonText}>Setup my event</Text>
                </TouchableOpacity>
              </View>
            }
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Join Button */}
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
    paddingHorizontal: SCREEN_WIDTH * 0.065,
    marginTop: SCREEN_HEIGHT * 0.032,
    marginBottom: SCREEN_HEIGHT * 0.024,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: SCREEN_WIDTH * 0.09,
    paddingBottom: 100,
  },
  eventCard: {
    width: SCREEN_WIDTH * 0.816,
    minHeight: 115,
    backgroundColor: '#292A24',
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  eventImage: {
    width: 97,
    height: 81,
    borderRadius: 23,
    alignSelf: 'flex-start',
  },
  eventInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  hostingLabel: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 15,
    color: '#FFFFFC',
    marginBottom: 2,
  },
  eventName: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '800',
    fontSize: 20,
    lineHeight: 28,
    color: '#FFFFFC',
    marginVertical: 2,
  },
  eventDate: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 15,
    color: '#FFFFFC',
    marginTop: 2,
  },
  daysLeftContainer: {
    position: 'absolute',
    top: 11,
    right: 19,
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysLeftText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 15,
    color: '#FFFFFC',
    marginLeft: 4,
  },
  mainBox: {
    width: SCREEN_WIDTH * 0.883,
    height: 256,
    backgroundColor: '#292A24',
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    width: SCREEN_WIDTH * 0.706,
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
    bottom: SCREEN_HEIGHT * 0.033,
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