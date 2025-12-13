// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import React, { useState } from 'react';
// import {
//     Dimensions,
//     Image,
//     StyleSheet,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     View,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// export default function IntroductionScreen() {
//   const router = useRouter();
//   const params = useLocalSearchParams();
  
//   // Get account info from navigation params
//   const accountPhoto = params.photo as string;
//   const userName = params.name as string;
//   const defaultNickname = params.nickname as string;
  
//   const [nickname, setNickname] = useState(defaultNickname);
//   const [isEditingNickname, setIsEditingNickname] = useState(false);

//   const handleContinue = () => {
//     // Navigate to event maker with user info
//     router.push({
//       pathname: '../../app/createEvent/eventMaker',
//       params: {
//         photo: accountPhoto,
//         name: userName,
//         nickname: nickname,
//       },
//     });
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.content}>
//         {/* Profile Photo */}
//         <View style={styles.photoContainer}>
//           <Image
//             source={typeof accountPhoto === 'string' ? { uri: accountPhoto } : accountPhoto}
//             style={styles.photo}
//           />
//         </View>

//         {/* Username Rectangle */}
//         <View style={styles.infoRectangle}>
//           <MaterialCommunityIcons
//             name="account-circle"
//             size={24}
//             color="#8B8C83"
//             style={styles.icon}
//           />
//           <Text style={styles.infoText}>{userName}</Text>
//         </View>

//         {/* Nickname Rectangle (Editable) */}
//         <TouchableOpacity
//           style={styles.nicknameRectangle}
//           onPress={() => setIsEditingNickname(true)}
//           activeOpacity={0.7}
//         >
//           <MaterialCommunityIcons
//             name="at"
//             size={24}
//             color="#8B8C83"
//             style={styles.icon}
//           />
//           {isEditingNickname ? (
//             <TextInput
//               style={styles.nicknameInput}
//               value={nickname}
//               onChangeText={setNickname}
//               onBlur={() => setIsEditingNickname(false)}
//               autoFocus
//               placeholderTextColor="#8B8C83"
//             />
//           ) : (
//             <Text style={styles.infoText}>{nickname}</Text>
//           )}
//         </TouchableOpacity>

//         {/* Continue Button */}
//         <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
//           <Text style={styles.continueButtonText}>Continue</Text>
//         </TouchableOpacity>
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
//     alignItems: 'center',
//   },
//   photoContainer: {
//     width: SCREEN_WIDTH * 0.369, // ~148px on 401px screen
//     height: SCREEN_WIDTH * 0.379, // ~152px on 401px screen
//     marginTop: SCREEN_HEIGHT * 0.13, // ~108px on 830px screen
//     borderWidth: 3,
//     borderColor: '#FFB703',
//     borderRadius: 368,
//     overflow: 'hidden',
//   },
//   photo: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 368,
//   },
//   infoRectangle: {
//     width: SCREEN_WIDTH * 0.798, // ~320px on 401px screen
//     height: 69,
//     marginTop: SCREEN_HEIGHT * 0.024, // ~20px spacing
//     backgroundColor: '#292A24',
//     borderRadius: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   nicknameRectangle: {
//     width: SCREEN_WIDTH * 0.798, // ~320px on 401px screen
//     height: 69,
//     marginTop: 9, // Small gap between rectangles
//     backgroundColor: '#292A24',
//     borderRadius: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   icon: {
//     marginRight: 15,
//   },
//   infoText: {
//     fontFamily: 'Poppins',
//     fontStyle: 'normal',
//     fontWeight: '500',
//     fontSize: 16,
//     lineHeight: 24,
//     color: '#E4D7D1',
//   },
//   nicknameInput: {
//     flex: 1,
//     fontFamily: 'Poppins',
//     fontStyle: 'normal',
//     fontWeight: '500',
//     fontSize: 16,
//     lineHeight: 24,
//     color: '#E4D7D1',
//     padding: 0,
//   },
//   continueButton: {
//     width: SCREEN_WIDTH * 0.93, // ~373px on 401px screen
//     height: 73,
//     position: 'absolute',
//     bottom: SCREEN_HEIGHT * 0.093, // ~77px from bottom
//     backgroundColor: '#E5A602',
//     borderRadius: 50,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   continueButtonText: {
//     fontFamily: 'Poppins',
//     fontStyle: 'normal',
//     fontWeight: '500',
//     fontSize: 20,
//     lineHeight: 30,
//     color: '#000000',
//   },
// });
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function IntroductionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get account info from navigation params
  const photoPath = params.photoPath as string;
  const userName = params.name as string;
  const defaultNickname = params.nickname as string;
  
  const [nickname, setNickname] = useState(defaultNickname);
  const [isEditingNickname, setIsEditingNickname] = useState(false);

  // Map photo paths to actual require() calls
  const getPhotoSource = (path: string) => {
    const photos: { [key: string]: any } = {
      'beanDestroyer': require('../../assets/images/login/beanDestroyer.png'),
      'gremlinHam': require('../../assets/images/login/gremlinHam.png'),
      'skibidiCatlord': require('../../assets/images/login/skibidiCatlord.png'),
      'ohioChase': require('../../assets/images/login/ohioChase.png'),
    };
    return photos[path];
  };

  const handleContinue = () => {
    // Navigate to event maker with user info
    router.push({
      pathname: '../../app/createEvent/eventMaker',
      params: {
        photoPath: photoPath,
        name: userName,
        nickname: nickname,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Photo */}
        <View style={styles.photoContainer}>
          <Image
            source={getPhotoSource(photoPath)}
            style={styles.photo}
            resizeMode="cover"
          />
        </View>

        {/* Username Rectangle */}
        <View style={styles.infoRectangle}>
          <MaterialCommunityIcons
            name="account-circle"
            size={24}
            color="#8B8C83"
            style={styles.icon}
          />
          <Text style={styles.infoText}>{userName}</Text>
        </View>

        {/* Nickname Rectangle (Editable) */}
        <TouchableOpacity
          style={styles.nicknameRectangle}
          onPress={() => setIsEditingNickname(true)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="at"
            size={24}
            color="#8B8C83"
            style={styles.icon}
          />
          {isEditingNickname ? (
            <TextInput
              style={styles.nicknameInput}
              value={nickname}
              onChangeText={setNickname}
              onBlur={() => setIsEditingNickname(false)}
              autoFocus
              placeholderTextColor="#8B8C83"
            />
          ) : (
            <Text style={styles.infoText}>{nickname}</Text>
          )}
        </TouchableOpacity>

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
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
    alignItems: 'center',
  },
  photoContainer: {
    width: SCREEN_WIDTH * 0.369, // ~148px on 401px screen
    height: SCREEN_WIDTH * 0.379, // ~152px on 401px screen
    marginTop: SCREEN_HEIGHT * 0.13, // ~108px on 830px screen
    borderWidth: 3,
    borderColor: '#FFB703',
    borderRadius: 368,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 368,
  },
  infoRectangle: {
    width: SCREEN_WIDTH * 0.798, // ~320px on 401px screen
    height: 69,
    marginTop: SCREEN_HEIGHT * 0.024, // ~20px spacing
    backgroundColor: '#292A24',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  nicknameRectangle: {
    width: SCREEN_WIDTH * 0.798, // ~320px on 401px screen
    height: 69,
    marginTop: 9, // Small gap between rectangles
    backgroundColor: '#292A24',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  icon: {
    marginRight: 15,
  },
  infoText: {
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#E4D7D1',
  },
  nicknameInput: {
    flex: 1,
    fontFamily: 'Poppins',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    color: '#E4D7D1',
    padding: 0,
  },
  continueButton: {
    width: SCREEN_WIDTH * 0.93, // ~373px on 401px screen
    height: 73,
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.093, // ~77px from bottom
    backgroundColor: '#E5A602',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
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