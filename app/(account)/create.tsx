import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useState } from "react";

import { createUserAccount } from "@/services/appwrite";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useRouter } from "expo-router";

const Create = () => {
  const router = useRouter();

  // Campo de Username
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Campo de Senha e confirmação de senha
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isPasswordValid = password.length >= 8;
  const showPasswordError = password.length > 0 && !isPasswordValid;
  const doPasswordsMatch = password === confirmPassword;
  const showConfirmPasswordError =
    confirmPassword.length > 0 && !doPasswordsMatch;
  const passwordBorderColor =
    password.length === 0
      ? "transparent"
      : isPasswordValid && doPasswordsMatch
        ? "green"
        : "red";

  // Campo de Data de Nascimento
  const [birthDate, setBirthDate] = useState<Date | null>(new Date(2000, 0, 1));
  const [showPicker, setShowPicker] = useState(false);

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);

    if (event.type === "dismissed") return;
    if (selectedDate) setBirthDate(selectedDate);
  };
  const formattedDate = birthDate
    ? birthDate.toLocaleDateString("pt-BR")
    : "Data de nascimento";

  // Campo de E-mail e validação
  const [email, setEmail] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const showEmailError = email.length > 0 && !isEmailValid;
  const emailBorderColor =
    email.length === 0 ? "transparent" : isEmailValid ? "green" : "red";
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleEmailChange = (text: string) => {
    setEmail(text);
    setIsEmailValid(isValidEmail(text));
  };
  const canSubmit =
    username.trim().length > 0 &&
    isPasswordValid &&
    doPasswordsMatch &&
    confirmPassword.length > 0 &&
    email.length > 0 &&
    isEmailValid &&
    birthDate !== null;

  const handleCreateAccount = async () => {
    if (!canSubmit || isSubmitting) return;

    try {
      setIsSubmitting(true);

      await createUserAccount({
        email: email.trim(),
        password,
        username: username.trim(),
        birthDate: birthDate?.toISOString() || "",
      });

      Alert.alert("Sucesso", "Conta criada com sucesso!");
    } catch (error: any) {
      const message =
        typeof error?.message === "string"
          ? error.message
          : "Não foi possível criar a conta.";

      Alert.alert("Erro ao criar conta", message);
    } finally {
      router.push("/(tabs)/profile");
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full h-full z-0"
        resizeMode="cover"
      />
      <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />
      <Text className="text-light-200 text-2xl font-bold text-center mb-8 py-1">
        Crie sua conta e comece a usar!
      </Text>
      <ScrollView
        className="flex-1 px-5 pt-10"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 120 }}
      >
        <View className="bg-dark-100/80 rounded-2xl p-5 border border-light-100/10 mx-5">
          <Text className="text-light-100 text-xl font-bold text-center mr-auto mb-4">
            Crie um nome de usuário e senha
          </Text>
          <TextInput
            placeholder="Username"
            placeholderTextColor={"#D6C6FF"}
            className="bg-primary/70 rounded-xl p-4 mb-4 text-white"
            value={username}
            onChangeText={setUsername}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={"#D6C6FF"}
            secureTextEntry
            className="bg-primary/70 rounded-xl p-4 mb-4 text-white"
            value={password}
            onChangeText={setPassword}
          />
          {showPasswordError && (
            <Text style={{ color: "red", marginBottom: 10, marginTop: -10 }}>
              A senha deve ter mais de 5 caracteres.
            </Text>
          )}

          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor={"#D6C6FF"}
            secureTextEntry
            className="bg-primary/70 rounded-xl p-4 mb-4 text-white"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={[{ borderColor: passwordBorderColor, borderWidth: 1 }]}
          />
          {showConfirmPasswordError && (
            <Text style={{ color: "red", marginBottom: 10, marginTop: -10 }}>
              As senhas não coincidem.
            </Text>
          )}
          <TextInput
            placeholder="E-mail"
            placeholderTextColor={"#D6C6FF"}
            className="bg-primary/70 rounded-xl p-4 mb-4 text-white"
            value={email}
            onChangeText={handleEmailChange}
            style={[{ borderColor: emailBorderColor, borderWidth: 1 }]}
          />
          {showEmailError && (
            <Text style={{ color: "red", marginBottom: 10, marginTop: -10 }}>
              Digite um e-mail válido.
            </Text>
          )}

          <Pressable
            onPress={() => setShowPicker(true)}
            className="bg-primary/70 rounded-xl p-4 mb-4"
          >
            <Text className={birthDate ? "text-white" : "text-light-100"}>
              {formattedDate}
            </Text>
          </Pressable>

          {showPicker && (
            <DateTimePicker
              value={birthDate ?? new Date(2000, 0, 1)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()} // impede data futura
              minimumDate={new Date(1900, 0, 1)}
              onChange={onChangeDate}
            />
          )}

          <View>
            <Pressable
              onPress={handleCreateAccount}
              disabled={!canSubmit || isSubmitting}
              className="rounded-xl p-3 items-center ml-auto w-1/2 my-auto"
              style={{
                backgroundColor:
                  canSubmit && !isSubmitting ? "#7F5AF0" : "#7F5AF080",
                opacity: canSubmit && !isSubmitting ? 1 : 0.7,
              }}
            >
              <Text className="text-white text-center font-bold">
                {isSubmitting ? "Criando..." : "Criar conta"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Create;
