import { Tabs } from 'expo-router';
import { Grid2x2, Folder } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarLabelStyle: styles.tabBarLabel,
        sceneStyle: { backgroundColor: COLORS.bg }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <Grid2x2 color={color} size={24} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <Folder color={color} size={24} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    boxShadow: '0px -2px 10px rgba(0,0,0,0.4)',
    elevation: 10,
  } as any,
  tabBarLabel: {
    fontFamily: 'Syne_600SemiBold',
    fontSize: 11,
  },
  activeIconContainer: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
    paddingBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
