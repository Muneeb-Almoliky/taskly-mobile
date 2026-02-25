import Header from '@/components/Header';
import { useThemeContext } from '@/context/ThemeContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getEmail, logout } from '@/services/authService';
import { getProfilePicture, uploadProfilePicture } from '@/services/userService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function Profile() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState(''); 
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { theme, setTheme } = useThemeContext();

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const headerScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadUserData();
    animateHeader();
  }, []);

  const animateHeader = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(headerScale, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadUserData = async () => {
    try {
      const email = await getEmail();
      setUserEmail(email);

      // Derive name from email
      if (email) {
        const nameFromEmail = email.split("@")[0];
        const formattedName = nameFromEmail
          .split(".")
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ");
        setUserName(formattedName);
      }

      if (email) {
        const profileData = await getProfilePicture(email);
        setProfileImage(profileData.profile_picture || null);
        setUserEmail(profileData.email || email);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (uri: string) => {
    if (!userEmail) return;

    try {
      const response = await uploadProfilePicture(userEmail, uri);
      setProfileImage(response.profile_picture || uri);
      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload profile picture");
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to change your profile picture.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        const originalName = asset.fileName || asset.uri.split("/").pop() || `profile_${Date.now()}.jpg`;
        await uploadProfilePicture(userEmail, asset.uri, originalName);
      }

    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera permissions to take a photo.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const originalName = asset.fileName || asset.uri.split("/").pop() || `camera_${Date.now()}.jpg`;
        await uploadProfilePicture(userEmail, asset.uri, originalName);
        setProfileImage(asset.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };


  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        onPress: async () => {
          try {
            await logout();
            router.replace('/login');
          } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Error', 'Failed to logout');
          }
        }
      },
    ]);
  };

  const handleEditName = () => {
    Alert.alert(
      "Not Supported Yet",
      "Editing your name will be available in a future update once the backend supports it."
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Header title="Taskly" subtitle="Loading your profile..." />
        <View style={styles.loadingContainer}>
          <Ionicons name="person-outline" size={40} color={tintColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Loading profile</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Universal Header */}
      <Header
        title="Profile"
        subtitle="Your Profile"
        showBackButton={false}
      />

      {/* Main Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture Section */}
        <Animated.View 
          style={[
            styles.profileSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.profilePictureContainer}>
            <TouchableOpacity onPress={pickImage}>
              <View style={[styles.profileImageWrapper, { borderColor: tintColor }]}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Ionicons name="person" size={40} color={tintColor} />
                  </View>
                )}
                <View style={[styles.editIcon, { backgroundColor: tintColor }]}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleEditName} style={styles.nameContainer}>
              <Text style={[styles.userName, { color: textColor }]}>{userName}</Text>
              <Ionicons name="pencil" size={16} color={tintColor} style={styles.editNameIcon} />
            </TouchableOpacity>
            
            <Text style={[styles.userEmail, { color: textColor }]}>{userEmail}</Text>
          </View>

          <View style={styles.photoOptions}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Update Profile Picture</Text>
            <View style={styles.optionButtons}>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: cardColor, borderColor }]}
                onPress={pickImage}
              >
                <Ionicons name="image" size={20} color={tintColor} />
                <Text style={[styles.optionButtonText, { color: textColor }]}>Choose from Library</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.optionButton, { backgroundColor: cardColor, borderColor }]}
                onPress={takePhoto}
              >
                <Ionicons name="camera" size={20} color={tintColor} />
                <Text style={[styles.optionButtonText, { color: textColor }]}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Account Settings */}
        <Animated.View 
          style={[
            styles.settingsSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: textColor }]}>Account Settings</Text>
          
          <View style={[styles.settingItem, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={24} color={tintColor} />
              <View>
                <Text style={[styles.settingText, { color: textColor }]}>Notifications</Text>
                <Text style={[styles.settingDescription, { color: textColor }]}>
                  Receive task reminders and updates
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#767577", true: tintColor }}
              thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
            />
          </View>
          <View style={[styles.settingItem, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={24} color={tintColor} />
              <View>
                <Text style={[styles.settingText, { color: textColor }]}>Dark Mode</Text>
                <Text style={[styles.settingDescription, { color: textColor }]}>
                  Switch between light and dark theme
                </Text>
              </View>
            </View>

            <Switch
              value={theme === 'dark'}
              onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
              trackColor={{ false: "#767577", true: tintColor }}
              thumbColor={theme === 'dark' ? "#fff" : "#f4f3f4"}
            />
          </View>
          
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: cardColor, borderColor }]}
            onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available soon!')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="lock-closed" size={24} color={tintColor} />
              <View>
                <Text style={[styles.settingText, { color: textColor }]}>Privacy & Security</Text>
                <Text style={[styles.settingDescription, { color: textColor }]}>
                  Manage your data and security settings
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={textColor} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { backgroundColor: cardColor, borderColor }]}
            onPress={() => Alert.alert('Coming Soon', 'Help & support will be available soon!')}
          >
            <View style={styles.settingInfo}>
              <Ionicons name="help-circle" size={24} color={tintColor} />
              <View>
                <Text style={[styles.settingText, { color: textColor }]}>Help & Support</Text>
                <Text style={[styles.settingDescription, { color: textColor }]}>
                  Get help and contact support
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={textColor} />
          </TouchableOpacity>
        </Animated.View>

        {/* App Information */}
        <Animated.View 
          style={[
            styles.infoSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: textColor }]}>App Information</Text>
          <View style={[styles.infoCard, { backgroundColor: cardColor, borderColor }]}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: textColor }]}>App Version</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: textColor }]}>Last Updated</Text>
              <Text style={[styles.infoValue, { color: textColor }]}>September 2025</Text>
            </View>
          </View>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View 
          style={[
            styles.logoutSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <TouchableOpacity 
            style={[styles.logoutButton, { borderColor: '#ef4444', borderWidth: 1 }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={18} color="#ef4444" />
            <Text style={[styles.logoutButtonText, { color: '#ef4444' }]}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 100,
  },
  loadingText: {
    fontSize: 15,
    opacity: 0.5,
  },
  profileSection: {
    marginBottom: 30,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  profileImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  profileImage: {
    width: 95,
    height: 95,
    borderRadius: 48,
  },
  profileImagePlaceholder: {
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  editNameIcon: {
    opacity: 0.7,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.7,
  },
  photoOptions: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 6,
  },
  optionButtonText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  settingsSection: {
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 12,
    marginTop: 2,
  },
  infoSection: {
    marginBottom: 30,
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoutSection: {
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
  },
  logoutButtonText: {
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
});