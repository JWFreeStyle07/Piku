// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useFocusEffect } from '@react-navigation/native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
// import React, { useCallback, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   Animated,
//   Dimensions,
//   FlatList,
//   Image,
//   Modal,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { db } from '../../firebase/firebaseConfig';

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// interface Event {
//   id: string;
//   eventId: string;
//   eventName: string;
//   userId: string;
//   coverImageURL: string;
//   endDate: string;
//   createdAt: string;
// }

// export default function RecentEvents() {
//   const router = useRouter();
//   const params = useLocalSearchParams();
  
//   const userId = params.userId as string;
  
//   const [events, setEvents] = useState<Event[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
//   const [showOptionsMenu, setShowOptionsMenu] = useState(false);
//   const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
//   const [showSuccess, setShowSuccess] = useState(false);

//   const successScale = useRef(new Animated.Value(0)).current;
//   const successOpacity = useRef(new Animated.Value(0)).current;
//   const checkmarkScale = useRef(new Animated.Value(0)).current;

//   useFocusEffect(
//     useCallback(() => {
//       fetchRecentEvents();
//     }, [userId])
//   );

//   const fetchRecentEvents = async () => {
//     if (!userId) {
//       console.log('No userId found');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       setIsLoading(true);
//       console.log('Fetching events for userId:', userId);
      
//       const eventsRef = collection(db, 'events');
//       const q = query(eventsRef, where('userId', '==', userId));
//       const querySnapshot = await getDocs(q);
      
//       console.log('Total events found:', querySnapshot.size);
      
//       const now = new Date();
//       const endedEvents: Event[] = [];
      
//       querySnapshot.forEach((doc) => {
//         const eventData = doc.data();
//         const endDate = new Date(eventData.endDate);
        
//         console.log('Event:', eventData.eventName, 'End Date:', endDate, 'Now:', now, 'Has Ended:', endDate < now);
        
//         // Only include events that have ended
//         if (endDate < now) {
//           endedEvents.push({
//             ...eventData,
//             id: doc.id,
//           } as Event);
//         }
//       });
      
//       // Sort by end date, most recent first
//       endedEvents.sort((a, b) => 
//         new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
//       );
      
//       setEvents(endedEvents);
//       console.log('Fetched recent events:', endedEvents.length);
//     } catch (error) {
//       console.error('Error fetching recent events:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const calculateDaysAgo = (endDateStr: string): string => {
//     const endDate = new Date(endDateStr);
//     const now = new Date();
//     const diffTime = now.getTime() - endDate.getTime();
//     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) return 'Today';
//     if (diffDays === 1) return '1 day ago';
//     return `${diffDays} days ago`;
//   };

//   const handleBack = () => {
//     router.back();
//   };

//   const handleOptionsPress = (event: Event, pageX: number, pageY: number) => {
//     setSelectedEventId(event.id);
//     setMenuPosition({ x: pageX, y: pageY });
//     setShowOptionsMenu(true);
//   };

//   const handleEditEvent = () => {
//     setShowOptionsMenu(false);
    
//     const selectedEvent = events.find(e => e.id === selectedEventId);
//     if (selectedEvent) {
//       router.push({
//         pathname: '../../camera/imageGallery',
//         params: {
//           eventId: selectedEvent.eventId,
//           eventName: selectedEvent.eventName,
//           userId: userId,
//         },
//       });
//     }
//   };

//   const handleDeleteEvent = () => {
//     setShowOptionsMenu(false);
    
//     Alert.alert(
//       'Delete Event',
//       'Are you sure you want to delete this event? This action cannot be undone.',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: confirmDeleteEvent,
//         },
//       ]
//     );
//   };

//   const confirmDeleteEvent = async () => {
//     if (!selectedEventId) return;

//     try {
//       await deleteDoc(doc(db, 'events', selectedEventId));
      
//       showSuccessAnimation(() => {
//         setShowSuccess(false);
//         fetchRecentEvents();
//       });
//     } catch (error) {
//       console.error('Error deleting event:', error);
//       Alert.alert('Error', 'Failed to delete event. Please try again.');
//     }
//   };

//   const showSuccessAnimation = (callback: () => void) => {
//     setShowSuccess(true);
    
//     Animated.parallel([
//       Animated.spring(successScale, {
//         toValue: 1,
//         tension: 50,
//         friction: 7,
//         useNativeDriver: true,
//       }),
//       Animated.timing(successOpacity, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: true,
//       }),
//     ]).start(() => {
//       Animated.spring(checkmarkScale, {
//         toValue: 1,
//         tension: 50,
//         friction: 7,
//         useNativeDriver: true,
//       }).start(() => {
//         setTimeout(() => {
//           // Reset animations
//           successScale.setValue(0);
//           successOpacity.setValue(0);
//           checkmarkScale.setValue(0);
//           callback();
//         }, 1500);
//       });
//     });
//   };

//   const handleEventPress = (event: Event) => {
//     router.push({
//       pathname: '../../camera/imageGallery',
//       params: {
//         eventId: event.eventId,
//         eventName: event.eventName,
//         userId: userId,
//       },
//     });
//   };

//   const renderEventCard = ({ item }: { item: Event }) => (
//     <TouchableOpacity
//       style={styles.eventCard}
//       onPress={() => handleEventPress(item)}
//       activeOpacity={0.8}
//     >
//       <Image
//         source={{ uri: item.coverImageURL }}
//         style={styles.eventImage}
//         resizeMode="cover"
//       />
//       <View style={styles.eventInfo}>
//         <Text style={styles.hostLabel}>Host</Text>
//         <Text style={styles.eventName} numberOfLines={1}>
//           {item.eventName}
//         </Text>
//         <Text style={styles.daysAgoText}>
//           {calculateDaysAgo(item.endDate)}
//         </Text>
//       </View>
//       <TouchableOpacity
//         style={styles.optionsButton}
//         onPress={(e) => {
//           e.stopPropagation();
//           const { pageX, pageY } = e.nativeEvent;
//           handleOptionsPress(item, pageX, pageY);
//         }}
//         activeOpacity={0.7}
//       >
//         <MaterialCommunityIcons
//           name="dots-horizontal"
//           size={20}
//           color="#FFFFFC"
//         />
//       </TouchableOpacity>
//     </TouchableOpacity>
//   );

//   const renderEmptyState = () => (
//     <View style={styles.emptyContainer}>
//       <Text style={styles.emptyText}>No recent events to show</Text>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.content}>
//         {/* Success Animation Overlay */}
//         {showSuccess && (
//           <View style={styles.successOverlay}>
//             <Animated.View
//               style={[
//                 styles.successCircle,
//                 {
//                   transform: [{ scale: successScale }],
//                   opacity: successOpacity,
//                 },
//               ]}
//             >
//               <Animated.View
//                 style={[
//                   styles.checkmarkContainer,
//                   {
//                     transform: [{ scale: checkmarkScale }],
//                   },
//                 ]}
//               >
//                 <MaterialCommunityIcons
//                   name="check"
//                   size={SCREEN_WIDTH * 0.2}
//                   color="#000000"
//                 />
//               </Animated.View>
//             </Animated.View>
//             <Animated.Text
//               style={[
//                 styles.successText,
//                 {
//                   opacity: successOpacity,
//                 },
//               ]}
//             >
//               Successfully Deleted Event
//             </Animated.Text>
//           </View>
//         )}

//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={handleBack}
//             activeOpacity={0.7}
//           >
//             <MaterialCommunityIcons
//               name="chevron-left"
//               size={28}
//               color="#FFFFFC"
//             />
//           </TouchableOpacity>
//           <Text style={styles.title}>Recents</Text>
//         </View>

//         {/* Events List */}
//         {isLoading ? (
//           <View style={styles.loadingContainer}>
//             <ActivityIndicator size="large" color="#FFB703" />
//           </View>
//         ) : (
//           <FlatList
//             data={events}
//             renderItem={renderEventCard}
//             keyExtractor={(item) => item.id}
//             contentContainerStyle={styles.listContent}
//             ListEmptyComponent={renderEmptyState}
//             showsVerticalScrollIndicator={false}
//           />
//         )}

//         {/* Options Menu Modal */}
//         <Modal
//           visible={showOptionsMenu}
//           transparent
//           animationType="fade"
//           onRequestClose={() => setShowOptionsMenu(false)}
//         >
//           <TouchableWithoutFeedback onPress={() => setShowOptionsMenu(false)}>
//             <View style={styles.modalOverlay}>
//               <TouchableWithoutFeedback>
//                 <View
//                   style={[
//                     styles.optionsMenu,
//                     {
//                       position: 'absolute',
//                       right: SCREEN_WIDTH * 0.065,
//                       top: menuPosition.y - 50,
//                     },
//                   ]}
//                 >
//                   <TouchableOpacity
//                     style={styles.menuItem}
//                     onPress={handleEditEvent}
//                     activeOpacity={0.7}
//                   >
//                     <Text style={styles.menuItemText}>Edit Event</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={styles.menuItem}
//                     onPress={handleDeleteEvent}
//                     activeOpacity={0.7}
//                   >
//                     <Text style={styles.menuItemText}>Delete Event</Text>
//                   </TouchableOpacity>
//                 </View>
//               </TouchableWithoutFeedback>
//             </View>
//           </TouchableWithoutFeedback>
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
//     paddingHorizontal: SCREEN_WIDTH * 0.0372,
//     marginTop: SCREEN_HEIGHT * 0.032,
//     marginBottom: SCREEN_HEIGHT * 0.024,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   title: {
//     fontFamily: 'Poppins',
//     fontStyle: 'normal',
//     fontWeight: '600',
//     fontSize: 20,
//     lineHeight: 30,
//     color: '#FFFFFC',
//     marginLeft: SCREEN_WIDTH * 0.28,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   listContent: {
//     paddingHorizontal: SCREEN_WIDTH * 0.096,
//     paddingBottom: 20,
//     flexGrow: 1,
//   },
//   eventCard: {
//     width: SCREEN_WIDTH * 0.816,
//     minHeight: 115,
//     backgroundColor: '#292A24',
//     borderRadius: 20,
//     alignSelf: 'center',
//     marginBottom: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     paddingVertical: 15,
//   },
//   eventImage: {
//     width: 59,
//     height: 58,
//     borderRadius: 40.5,
//   },
//   eventInfo: {
//     flex: 1,
//     marginLeft: 15,
//     justifyContent: 'center',
//   },
//   hostLabel: {
//     fontFamily: 'Poppins',
//     fontStyle: 'normal',
//     fontWeight: '500',
//     fontSize: 10,
//     lineHeight: 15,
//     color: '#FFFFFC',
//     marginBottom: 2,
//   },
//   eventName: {
//     fontFamily: 'Poppins',
//     fontStyle: 'normal',
//     fontWeight: '800',
//     fontSize: 23,
//     lineHeight: 34,
//     color: '#FFFFFC',
//     marginVertical: 2,
//   },
//   daysAgoText: {
//     fontFamily: 'Poppins',
//     fontStyle: 'normal',
//     fontWeight: '500',
//     fontSize: 10,
//     lineHeight: 15,
//     color: '#FFFFFC',
//     marginTop: 2,
//   },
//   optionsButton: {
//     position: 'absolute',
//     top: 15,
//     right: 15,
//     width: 30,
//     height: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingTop: SCREEN_HEIGHT * 0.3,
//   },
//   emptyText: {
//     fontFamily: 'Poppins',
//     fontStyle: 'normal',
//     fontWeight: '500',
//     fontSize: 16,
//     lineHeight: 24,
//     color: '#8B8C83',
//     textAlign: 'center',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.3)',
//   },
//   optionsMenu: {
//     width: 107,
//     backgroundColor: '#292A24',
//     borderRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//     paddingVertical: 8,
//   },
//   menuItem: {
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//   },
//   menuItemText: {
//     fontFamily: 'Poppins',
//     fontStyle: 'normal',
//     fontWeight: '500',
//     fontSize: 10,
//     lineHeight: 15,
//     color: '#FFFFFC',
//   },
//   successOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0, 0, 0, 0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 1000,
//   },
//   successCircle: {
//     width: SCREEN_WIDTH * 0.4,
//     height: SCREEN_WIDTH * 0.4,
//     borderRadius: SCREEN_WIDTH * 0.2,
//     backgroundColor: '#E5A602',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   checkmarkContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   successText: {
//     marginTop: SCREEN_HEIGHT * 0.03,
//     fontFamily: 'Poppins',
//     fontWeight: '600',
//     fontSize: SCREEN_WIDTH * 0.045,
//     color: '#FFFFFC',
//     textAlign: 'center',
//   },
// });
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
  isHosted?: boolean;
  hostUserName?: string;
}

export default function RecentEvents() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const userId = params.userId as string;
  
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isHostedEvent, setIsHostedEvent] = useState(false);

  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fetchRecentEvents();
    }, [userId])
  );

  const fetchUserName = async (userId: string): Promise<string> => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.userName || 'Unknown User';
      }
      return 'Unknown User';
    } catch (error) {
      console.error('Error fetching username:', error);
      return 'Unknown User';
    }
  };

  const fetchRecentEvents = async () => {
    if (!userId) {
      console.log('No userId found');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching events for userId:', userId);
      
      const now = new Date();
      const allEndedEvents: Event[] = [];

      // Fetch events created by user (My Events)
      const eventsRef = collection(db, 'events');
      const myEventsQuery = query(eventsRef, where('userId', '==', userId));
      const myEventsSnapshot = await getDocs(myEventsQuery);
      
      myEventsSnapshot.forEach((doc) => {
        const eventData = doc.data();
        const endDate = new Date(eventData.endDate);
        
        // Only include events that have ended
        if (endDate < now) {
          allEndedEvents.push({
            ...eventData,
            id: doc.id,
            isHosted: true,
          } as Event);
        }
      });

      // Fetch all events where user is in joinedUsers array (Joined Events)
      const allEventsSnapshot = await getDocs(eventsRef);
      
      for (const docSnap of allEventsSnapshot.docs) {
        const eventData = docSnap.data();
        const joinedUsers = eventData.joinedUsers || [];
        const endDate = new Date(eventData.endDate);
        
        // Check if current user is in joinedUsers, is NOT the creator, and event has ended
        if (joinedUsers.includes(userId) && eventData.userId !== userId && endDate < now) {
          // Fetch the host's username
          const hostUserName = await fetchUserName(eventData.userId);
          
          allEndedEvents.push({
            ...eventData,
            id: docSnap.id,
            isHosted: false,
            hostUserName: hostUserName,
          } as Event);
        }
      }
      
      // Sort by end date, most recent first
      allEndedEvents.sort((a, b) => 
        new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
      );
      
      setEvents(allEndedEvents);
      console.log('Fetched recent events (hosted + joined):', allEndedEvents.length);
    } catch (error) {
      console.error('Error fetching recent events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDaysAgo = (endDateStr: string): string => {
    const endDate = new Date(endDateStr);
    const now = new Date();
    const diffTime = now.getTime() - endDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const handleBack = () => {
    router.back();
  };

  const handleOptionsPress = (event: Event, pageX: number, pageY: number) => {
    setSelectedEventId(event.id);
    setIsHostedEvent(event.isHosted || false);
    setMenuPosition({ x: pageX, y: pageY });
    setShowOptionsMenu(true);
  };

  const handleEditEvent = () => {
    setShowOptionsMenu(false);
    
    const selectedEvent = events.find(e => e.id === selectedEventId);
    if (selectedEvent) {
      router.push({
        pathname: '../../camera/imageGallery',
        params: {
          eventId: selectedEvent.eventId,
          eventName: selectedEvent.eventName,
          userId: userId,
        },
      });
    }
  };

  const handleDeleteEvent = () => {
    setShowOptionsMenu(false);
    
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteEvent,
        },
      ]
    );
  };

  const confirmDeleteEvent = async () => {
    if (!selectedEventId) return;

    try {
      await deleteDoc(doc(db, 'events', selectedEventId));
      
      showSuccessAnimation(() => {
        setShowSuccess(false);
        fetchRecentEvents();
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert('Error', 'Failed to delete event. Please try again.');
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
        setTimeout(() => {
          // Reset animations
          successScale.setValue(0);
          successOpacity.setValue(0);
          checkmarkScale.setValue(0);
          callback();
        }, 1500);
      });
    });
  };

  const handleEventPress = (event: Event) => {
    router.push({
      pathname: '../../camera/imageGallery',
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
        {item.isHosted ? (
          <Text style={styles.hostLabel}>Host</Text>
        ) : (
          <Text style={styles.hostedByLabel}>Hosted By: {item.hostUserName}</Text>
        )}
        <Text style={styles.eventName} numberOfLines={1}>
          {item.eventName}
        </Text>
        <Text style={styles.daysAgoText}>
          {calculateDaysAgo(item.endDate)}
        </Text>
      </View>
      {/* Only show options button for hosted events */}
      {item.isHosted && (
        <TouchableOpacity
          style={styles.optionsButton}
          onPress={(e) => {
            e.stopPropagation();
            const { pageX, pageY } = e.nativeEvent;
            handleOptionsPress(item, pageX, pageY);
          }}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="dots-horizontal"
            size={20}
            color="#FFFFFC"
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No recent events to show</Text>
    </View>
  );

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
              Successfully Deleted Event
            </Animated.Text>
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color="#FFFFFC"
            />
          </TouchableOpacity>
          <Text style={styles.title}>Recents</Text>
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
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Options Menu Modal - Only for hosted events */}
        <Modal
          visible={showOptionsMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowOptionsMenu(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowOptionsMenu(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View
                  style={[
                    styles.optionsMenu,
                    {
                      position: 'absolute',
                      right: SCREEN_WIDTH * 0.065,
                      top: menuPosition.y - 50,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleEditEvent}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.menuItemText}>Edit Event</Text>
                  </TouchableOpacity>
                  {/* Only show delete option for hosted events */}
                  {isHostedEvent && (
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={handleDeleteEvent}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.menuItemText}>Delete Event</Text>
                    </TouchableOpacity>
                  )}
                </View>
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
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.0372,
    marginTop: SCREEN_HEIGHT * 0.032,
    marginBottom: SCREEN_HEIGHT * 0.024,
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
    marginLeft: SCREEN_WIDTH * 0.28,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: SCREEN_WIDTH * 0.096,
    paddingBottom: 20,
    flexGrow: 1,
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
    width: 59,
    height: 58,
    borderRadius: 40.5,
  },
  eventInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  hostLabel: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 15,
    color: '#FFFFFC',
    marginBottom: 2,
  },
  hostedByLabel: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 15,
    color: '#FFB703',
    marginBottom: 2,
  },
  eventName: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '800',
    fontSize: 23,
    lineHeight: 34,
    color: '#FFFFFC',
    marginVertical: 2,
  },
  daysAgoText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 15,
    color: '#FFFFFC',
    marginTop: 2,
  },
  optionsButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SCREEN_HEIGHT * 0.3,
  },
  emptyText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#8B8C83',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  optionsMenu: {
    width: 107,
    backgroundColor: '#292A24',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    paddingVertical: 8,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuItemText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 10,
    lineHeight: 15,
    color: '#FFFFFC',
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
});