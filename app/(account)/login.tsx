import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { loginUser } from "@/services/appwrite";
import { useState } from "react";

const Login = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (email: string, password: string) => {
    setIsSubmitting(true);
    loginUser(email.trim(), password)
      .then((user) => {
        Alert.alert("Login bem-sucedido", `Bem-vindo, ${user.name}!`);
        router.push("/(tabs)/profile");
      })
      .catch(() => {
        Alert.alert("Erro de login", "Email ou senha incorretos.");
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full h-full z-0"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1 px-5 pt-20"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 92, paddingBottom: 120 }}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        <Text className="text-light-200 text-2xl font-bold text-center mb-8 py-1">
          Bem-vindo de volta!
        </Text>
        <View className="bg-dark-100/80 rounded-2xl p-5 border border-light-100/10 mx-5">
          <TextInput
            placeholder="Email"
            placeholderTextColor={"#D6C6FF"}
            value={email}
            onChangeText={setEmail}
            className="bg-primary/70 rounded-xl p-4 mb-4 text-white"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={"#D6C6FF"}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="bg-primary/70 rounded-xl p-4 mb-4 text-white"
          />
          <View className="flex-row items-center justify-between mt-4">
            <Link href="/(account)/create" className="mb-4">
              <Text className="text-sm text-light-200 text-center mr-auto">
                Não tem uma conta? Crie uma!
              </Text>
            </Link>
            <Pressable
              onPress={() => handleLogin(email, password)}
              className="bg-[#7F5AF0] rounded-xl p-3 items-center ml-auto w-1/2 my-auto"
            >
              <Text className="text-white text-center font-bold">
                Fazer login
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Login;
