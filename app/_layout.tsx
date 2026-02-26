import "./globals.css";

import { Stack } from "expo-router";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <>
      <StatusBar hidden={true} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="movies/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="(account)/create"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="(account)/login" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
