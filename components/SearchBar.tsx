import { Image, TextInput, TextInputProps, View } from "react-native";

import React from "react";
import { colors } from "@/constants/colors";
import { icons } from "@/constants/icons";

interface Props {
  placeholder: string;
  onPress?: TextInputProps["onPressIn"];
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  inputRef?: React.RefObject<TextInput | null>;
  autoFocus?: boolean;
}

function SearchBar({
  placeholder,
  onPress,
  value,
  onChangeText,
  onSubmitEditing,
  inputRef,
  autoFocus = false,
}: Props) {
  return (
    <View className="flex-row items-center bg-dark-200 rounded-full px-5 py-4">
      <Image
        source={icons.search}
        className="size-5"
        resizeMode="contain"
        tintColor={colors.light[200]}
      />
      <TextInput
        ref={inputRef}
        autoFocus={autoFocus}
        onPressIn={onPress}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        placeholderTextColor={colors.light[100]}
        className="flex-1 ml-2 text-light-100"
      />
    </View>
  );
}

export default SearchBar;
