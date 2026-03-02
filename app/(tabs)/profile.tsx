import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getCurrentUser, logoutCurrentUser } from "@/services/appwrite";

import { Models } from "react-native-appwrite";
import { colors } from "@/constants/colors";
import { images } from "@/constants/images";
import { useRouter } from "expo-router";

const Profile = () => {
  const router = useRouter();

  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUser = async () => {
    setLoading(true);
    setError(null);

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      setError("Nao foi possivel carregar o perfil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);

    const success = await logoutCurrentUser();

    setLoggingOut(false);

    if (!success) {
      Alert.alert("Erro", "Nao foi possivel sair da conta.");
      return;
    }

    setUser(null);
    Alert.alert("Sessao encerrada", "Voce saiu da sua conta.");
  };

  const userName = user?.name?.trim() || "Usuario";
  const userInitial = userName.charAt(0).toUpperCase() || "U";

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 92, paddingBottom: 120 }}
      >
        <Text className="text-light-100 text-2xl font-bold text-center mb-6">
          Perfil
        </Text>

        <View className="bg-dark-100/80 rounded-2xl p-5 border border-light-100/10">
          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.light[100]}
              className="py-10"
            />
          ) : error ? (
            <View className="items-center py-6">
              <Text className="text-red-400 text-center mb-4">{error}</Text>
              <Pressable
                onPress={loadUser}
                className="bg-accent px-4 py-3 rounded-xl"
              >
                <Text className="text-light-100 font-semibold">
                  Tentar novamente
                </Text>
              </Pressable>
            </View>
          ) : user ? (
            <>
              <View className="items-center mb-6">
                <View className="w-20 h-20 rounded-full bg-accent items-center justify-center mb-3">
                  <Text className="text-light-100 text-3xl font-bold">
                    {userInitial}
                  </Text>
                </View>
                <Text className="text-light-100 text-xl font-bold text-center">
                  {userName}
                </Text>
                <Text className="text-light-200 text-sm mt-1 text-center">
                  {user.email}
                </Text>
              </View>

              <View className="gap-3">
                <View className="bg-primary/70 rounded-xl p-4">
                  <Text className="text-light-200 text-xs mb-1">ID</Text>
                  <Text className="text-light-100" numberOfLines={1}>
                    {user.$id}
                  </Text>
                </View>

                <View className="bg-primary/70 rounded-xl p-4">
                  <Text className="text-light-200 text-xs mb-1">Status</Text>
                  <Text className="text-light-100">
                    {user.emailVerification
                      ? "Email verificado"
                      : "Email pendente"}
                  </Text>
                </View>

                <View className="bg-primary/70 rounded-xl p-4">
                  <Text className="text-light-200 text-xs mb-1">Criado em</Text>
                  <Text className="text-light-100">
                    {new Date(user.$createdAt).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={handleLogout}
                disabled={loggingOut}
                className={`mt-6 rounded-xl py-4 ${
                  loggingOut ? "bg-red-800" : "bg-red-600"
                }`}
              >
                <Text className="text-light-100 text-center font-semibold">
                  {loggingOut ? "Saindo..." : "Sair da conta"}
                </Text>
              </Pressable>
            </>
          ) : (
            <View className="items-center py-6">
              <Text className="text-light-200 text-center text-base leading-6">
                Nenhum usuario autenticado no momento.
              </Text>
              <Pressable
                onPress={() => router.push("/(account)/login")}
                className="bg-accent px-4 py-3 rounded-xl mt-4"
              >
                <Text className="text-light-100 font-semibold">
                  Fazer Login
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;
