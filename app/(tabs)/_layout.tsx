import { Tabs } from 'expo-router';
import { LayoutDashboard, FolderOpen } from 'lucide-react-native';
import { StyleSheet, Platform } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function TabLayout() {
  // On web we have a sidebar, so we can hide the tab bar
  if (Platform.OS === 'web') {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          sceneStyle: { backgroundColor: COLORS.bg },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
        <Tabs.Screen name="projects" options={{ title: 'Projects' }} />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: styles.tabBarLabel,
        sceneStyle: { backgroundColor: COLORS.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <LayoutDashboard color={color} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => (
            <FolderOpen color={color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  } as any,
  tabBarLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
  },
});
