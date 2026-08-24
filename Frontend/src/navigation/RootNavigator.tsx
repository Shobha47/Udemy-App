import React, { createContext, useContext, useState, useEffect } from 'react';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getSecureItem, removeSecureItem, setSecureItem } from '../api/client';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// Shared Core Screens
import SplashScreen from '../screens/public/SplashScreen';
import HomeScreen from '../screens/public/HomeScreen';
import CourseDetailScreen from '../screens/public/CourseDetailScreen';
import CourseListScreen from '../screens/public/CourseListScreen';
import CategoryScreen from '../screens/public/CategoryScreen';
import SettingsScreen from '../screens/public/SettingsScreen';

// Auth Screen Modules
import LoginScreen from '../screens/auth/LoginScreen';
import AuthGateScreen from '../screens/auth/AuthGateScreen';
import StudentSignUpScreen from '../screens/auth/StudentSignUpScreen';
import InstructorSignUpScreen from '../screens/auth/InstructorSignUpScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboard';
import InstructorDashboard from '../screens/instructor/InstructorDashboard';
import AboutUsScreen from '../screens/public/AboutUsScreen';
import TermsOfUseScreen from '../screens/public/TermsOfUseScreen';
import PrivacyPolicyScreen from '../screens/public/PrivacyPolicyScreen';
import RefundPolicyScreen from '../screens/public/RefundPolicyScreen';
import CancellationPolicyScreen from '../screens/public/CancellationPolicyScreen';
import PaymentPolicyScreen from '../screens/public/PaymentPolicy';
import CompanyInfoScreen from '../screens/public/CompanyInfoScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import InstructorAllcourseScreen from '../screens/public/InstructorAllCoursesScreen';
import InstructorListScreen from '../screens/public/InstructorListScreen';
import InstructorDetailScreen from '../screens/public/InstructorDetailScreen';
import InstructorCoursesScreen from '../screens/instructor/InstructorCoursesScreen';
import InstructorCreateCourseScreen from '../screens/instructor/InstructorCreateCourseScreen';
import InstructorCourseViewDetailScreen from '../screens/instructor/InstructorCourseViewDetailScreen';
import InstructorEditCourseScreen from '../screens/instructor/InstructorEditCourseScreen';
import InstructorCurriculumScreen from '../screens/instructor/InstructorCurriculumScreen';
import InstructorProfileScreen from '../screens/instructor/InstructorProfileScreen';
import InstructorEditProfileScreen from '../screens/instructor/InstructorEditProfileScreen';
import InstructorAnalyticsScreen from '../screens/instructor/InstructorAnalyticsScreen';
import StudentDashboardScreen from '../screens/student/DashboardScreen';
import StudentMyLearningScreen from '../screens/student/StudentMyLearningScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import StudentEditProfileScreen from '../screens/student/StudentEditProfileScreen';
import AdminCoursesScreen from '../screens/admin/AdminCoursesScreen';
import AdminPendingCoursesScreen from '../screens/admin/AdminPendingCoursesScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';
import AdminEditProfileScreen from '../screens/admin/AdminEditProfileScreen';
import WishlistScreen from '../screens/student/WishlistScreen';
import CartScreen from '../screens/student/CartScreen';
import StudentCourseDetailScreen from '../screens/student/StudentCourseDetailScreen';
import StudentCourseExploreScreen from '../screens/student/StudentCourseExploreScreen';
import AdminCategoryManagementScreen from '../screens/admin/AdminCategoryManagementScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import CourseReviewsScreen from '../screens/public/AllReviewsScreen';
import CheckoutScreen from '../screens/student/CheckoutScreen';
import CertificateScreen from '../screens/student/CertificateScreen';
import InstructorQuizBuilderScreen from '../screens/instructor/InstructorQuizBuilderScreen';
import InstructorAssignmentBuilderScreen from '../screens/instructor/InstructorAssignmentBuilderScreen';
import StudentQuizExecutionScreen from '../screens/student/StudentQuizExecutionPortal';
import StudentAssignmentExecutionScreen from '../screens/student/StudentAssignmentExecutionScreen';
import AdminCourseDetailScreen from '../screens/admin/AdminCourseDetailScreen';
import AdvisorSignUpScreen from '../screens/auth/AdvisorSignUpScreen';
import AdvisorLoginScreen from '../screens/auth/AdvisorLoginScreen';


// Mock Placeholders
const PlaceholderScreen = (name: string) => () => (
  <View style={styles.centerContainer}><Text style={styles.titleText}>{name} View</Text></View>
);

const linking = {
  prefixes: ['smartskillsindia://'],
  config: {
    screens: {
      // Maps deep linked link routes directly onto your stack path identifiers
      ResetPasswordScreen: 'reset-password',
    },
  },
};

// ==========================================
// CENTRAL AUTHORIZATION GLOBAL STATE ENGINE
// ==========================================
type AuthContextType = {
  user: any;
  loading: boolean;
  // login: (user: any) => void;

  login: (
    userData: any,
    accessToken: string,
    refreshToken: string
  ) => Promise<void>;

  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Rehydrate active user sessions during application cold start
    const bootstrappingSessionStorageNode = async () => {
      try {
        const storedUser = await getSecureItem('userInfo');
        const accessToken = await getSecureItem('accessToken');
        // if (storedUser) {
        //   setUser(JSON.parse(storedUser));
        // }

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('SESSION BOOTSTRAPPING ERROR:', err);
      } finally {
        setLoading(false);
      }
    };
    bootstrappingSessionStorageNode();
  }, []);

  // const login = (userData: any) => {
  //   const processedUser = { ...userData, role: userData.role?.toUpperCase() };
  //   setUser(processedUser);
  // };

  const login = async (
    userData: any,
    accessToken: string,
    refreshToken: string
  ) => {
    const processedUser = {
      ...userData,
      role: userData.role?.toUpperCase(),
    };

    await setSecureItem(
      'accessToken',
      accessToken
    );

    await setSecureItem(
      'refreshToken',
      refreshToken
    );

    await setSecureItem(
      'userInfo',
      JSON.stringify(processedUser)
    );

    setUser(processedUser);
  };

  const logout = async () => {
    try {
      await removeSecureItem('accessToken');
      await removeSecureItem('refreshToken');
      await removeSecureItem('userInfo');

      setUser(null);
    } catch (err) {
      console.error('LOGOUT ERROR:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthMock = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthMock must be called inside an AuthProvider wrapper element.');
  return context;
};

function useTabOptions() {
  const insets = useSafeAreaInsets();

  return {
    headerShown: false,

    tabBarActiveTintColor: '#4F46E5',
    tabBarInactiveTintColor: '#6A6F73',

    tabBarStyle: {
      backgroundColor: '#ffffff',
      borderTopColor: '#D1D7DC',

      height: 60 + insets.bottom,

      paddingTop: 6,

      paddingBottom: Math.max(insets.bottom, 8),
    },

    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: '800' as const,
    },
  };
}

// Navigation Components
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// const tabOptionsConfig = {
//   headerShown: false,
//   tabBarActiveTintColor: '#4F46E5', 
//   tabBarInactiveTintColor: '#6A6F73',
//   tabBarStyle: { height: 64, paddingTop: 8, paddingBottom: 8, backgroundColor: '#FFFFFF', borderTopColor: '#D1D7DC' },
//   tabBarLabelStyle: { fontSize: 10, fontWeight: '300' as const },
// };

function PublicTabNavigator() {
  const tabOptions = useTabOptions();

  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Featured',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="CategoriesTab"
        component={CategoryScreen}
        options={{
          tabBarLabel: 'Categories',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons
              name={focused ? 'category' : 'category'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="CoursesTab"
        component={CourseListScreen}
        options={{
          tabBarLabel: 'Courses',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'school' : 'school-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function StudentTabNavigator() {
  const tabOptions = useTabOptions();

  return (
    <Tab.Navigator screenOptions={tabOptions}>
      
      <Tab.Screen 
        name="StudentDash" 
        component={StudentDashboardScreen} 
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }} 
      />

      <Tab.Screen 
        name="StudentMyLearningView" 
        component={StudentMyLearningScreen} 
        options={{ 
          tabBarLabel: 'My Learning', 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'play-circle' : 'play-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }} 
      />

      <Tab.Screen 
        name="StudentWishlist" 
        component={WishlistScreen} 
        options={{ 
          tabBarLabel: 'Wishlist', 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={size}
              color={color}
            />
          ),
        }} 
      />

      <Tab.Screen 
        name="StudentCart" 
        component={CartScreen} 
        options={{ 
          tabBarLabel: 'Cart', 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'cart' : 'cart-outline'}
              size={size}
              color={color}
            />
          ),
        }} 
      />

      <Tab.Screen 
        name="StudentProfile" 
        component={StudentProfileScreen} 
        options={{ 
          tabBarLabel: 'Profile', 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }} 
      />

      <Tab.Screen 
        name="StudentSettings" 
        component={SettingsScreen} 
        options={{ 
          tabBarLabel: 'Settings', 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }} 
      />

    </Tab.Navigator>
  );
}

function InstructorTabNavigator() {
  const tabOptions = useTabOptions();

  return (
    <Tab.Navigator screenOptions={tabOptions}>
      
      <Tab.Screen 
        name="InstructorDash" 
        component={InstructorDashboard} 
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'grid' : 'grid-outline'}
              size={size}
              color={color}
            />
          ),
        }} 
      />

      <Tab.Screen 
        name="InstructorCourses" 
        component={InstructorCoursesScreen} 
        options={{ 
          tabBarLabel: 'My Courses', 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'folder-open' : 'folder-open-outline'}
              size={size}
              color={color}
            />
          ),
        }} 
      />

      <Tab.Screen 
        name="InstructorAnalyticsTab" 
        component={InstructorAnalyticsScreen} 
        options={{ 
          tabBarLabel: 'Analytics', 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'analytics' : 'analytics-outline'}
              size={size}
              color={color}
            />
          ),
        }} 
      />

      <Tab.Screen 
        name="InstructorProfile" 
        component={InstructorProfileScreen} 
        options={{ 
          tabBarLabel: 'Profile', 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }} 
      />

      <Tab.Screen 
        name="InstructorSettings" 
        component={SettingsScreen} 
        options={{ 
          tabBarLabel: 'Settings', 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={color}
            />
          ),
        }} 
      />

    </Tab.Navigator>
  );
}

function AdminTabNavigator() {
  const tabOptions = useTabOptions();

  return (
    <Tab.Navigator screenOptions={tabOptions}>
      <Tab.Screen 
        name="AdminDash" 
        component={AdminDashboardScreen} 
        options={{ 
          tabBarLabel: 'Console', 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'speedometer' : 'speedometer-outline'} 
              size={size} 
              color={color} 
            />
          ) 
        }} 
      />
      
      <Tab.Screen 
        name="AdminUsers" 
        component={AdminUsersScreen} 
        options={{ 
          tabBarLabel: 'Users', 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'people' : 'people-outline'} 
              size={size} 
              color={color} 
            />
          ) 
        }} 
      />
      
      <Tab.Screen 
        name="AdminCourses" 
        component={AdminCoursesScreen} 
        options={{ 
          tabBarLabel: 'Courses', 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'book' : 'book-outline'} 
              size={size} 
              color={color} 
            />
          ) 
        }} 
      />
      
      <Tab.Screen 
        name="AdminApprovalsTab" 
        component={AdminPendingCoursesScreen} 
        options={{ 
          tabBarLabel: 'Approvals', 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} 
              size={size} 
              color={color} 
            />
          ) 
        }} 
      />
      
      <Tab.Screen 
        name="AdminProfile" 
        component={AdminProfileScreen} 
        options={{ 
          tabBarLabel: 'Profile', 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'person-circle' : 'person-circle-outline'} 
              size={size} 
              color={color} 
            />
          ) 
        }} 
      />
      
      <Tab.Screen 
        name="AdminSettings" 
        component={SettingsScreen} 
        options={{ 
          tabBarLabel: 'Settings', 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'settings' : 'settings-outline'} 
              size={size} 
              color={color} 
            />
          ) 
        }} 
      />
    </Tab.Navigator>
  );
}

function InnerNavigator() {
  const { user, loading } = useAuthMock();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const resolveTargetTabStack = () => {
    if (!user) return <Stack.Screen name="AppTabs" component={PublicTabNavigator} />;
    
    switch (user.role) {
      case 'SUPERADMIN':
      case 'ADMIN':
        return <Stack.Screen name="AppTabs" component={AdminTabNavigator} />;
      case 'INSTRUCTOR':
        return <Stack.Screen name="AppTabs" component={InstructorTabNavigator} />;
      case 'STUDENT':
      default:
        return <Stack.Screen name="AppTabs" component={StudentTabNavigator} />;
    }
  };

  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      {resolveTargetTabStack()}
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="InstructorDetail" component={InstructorDetailScreen} />
      <Stack.Screen name="CourseList" component={CourseListScreen} />
      <Stack.Screen name="InstructorList" component={InstructorListScreen} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="CourseReviews" component={CourseReviewsScreen} />
      <Stack.Screen name="CertificateScreen" component={CertificateScreen} />
      <Stack.Screen name="InstructorAllCourses" component={InstructorAllcourseScreen} />
      <Stack.Screen name="StudentQuizExecutionPortal" component={StudentQuizExecutionScreen} />
      <Stack.Screen name="StudentAssignmentScreen" component={StudentAssignmentExecutionScreen} />
      <Stack.Screen name="InstructorQuizBuilder" component={InstructorQuizBuilderScreen} />
      <Stack.Screen name="InstructorAssignmentBuilder" component={InstructorAssignmentBuilderScreen} />
      <Stack.Screen name="CompanyInfo" component={CompanyInfoScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="RefundReturnPolicy" component={RefundPolicyScreen} />
      <Stack.Screen name="CancellationPolicy" component={CancellationPolicyScreen} />
      <Stack.Screen name="PaymentPolicy" component={PaymentPolicyScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
      <Stack.Screen name="AuthGate" component={AuthGateScreen} />
      <Stack.Screen name="CheckOutScreen" component={CheckoutScreen} />
      <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <Stack.Screen name="StudentSignUp" component={StudentSignUpScreen} />
      <Stack.Screen name="StudentCourseDetail" component={StudentCourseDetailScreen} />
      <Stack.Screen name="InstructorSignUp" component={InstructorSignUpScreen} />
      <Stack.Screen name="StudentCourseExplore" component={StudentCourseExploreScreen} />
      <Stack.Screen name="StudentEditProfile" component={StudentEditProfileScreen} />
      <Stack.Screen name="AdminEditProfile" component={AdminEditProfileScreen} />
      <Stack.Screen name="AdminCourseDetail" component={AdminCourseDetailScreen} />
      <Stack.Screen name="AdminCategoryCreate" component={AdminCategoryManagementScreen} />
      <Stack.Screen name="InstructorCreateCourseView" component={InstructorCreateCourseScreen} />
      <Stack.Screen name="InstructorCourseViewDetail" component={InstructorCourseViewDetailScreen} />
      <Stack.Screen name="InstructorCurriculumEdit" component={InstructorCurriculumScreen} />
      <Stack.Screen name="InstructorCourseEditSpecs" component={InstructorEditCourseScreen} />
      <Stack.Screen name="InstructorProfileEdit" component={InstructorEditProfileScreen} />

      <Stack.Screen name="AdvisorSignUp" component={AdvisorSignUpScreen} />

      <Stack.Screen name="AdvisorLogin" component={AdvisorLoginScreen} />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <AuthProvider>
      {/* CONNECTED: Passing your standard validation linking configuration properties block node here */}
      <NavigationContainer linking={linking}>
        <InnerNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  titleText: { fontSize: 16, fontWeight: '800', color: '#1C1D1F' }
});