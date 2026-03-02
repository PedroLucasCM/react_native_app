import {
  Alert,
  Modal,
  Pressable,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { addMovieToFavorites, getCurrentUser } from "@/services/appwrite";

import { colors } from "@/constants/colors";

type FavoriteModalProps = {
  movieId: number;
  onClose: () => void;
  onFavorite: (favorite: boolean) => void;
};

const FavoriteModal = ({
  movieId,
  onClose,
  onFavorite,
}: FavoriteModalProps) => {
  const [userRating, setUserRating] = useState<number>(0);

  const [comment, setComment] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const toggleSwitch = () => setIsPublic((previousState) => !previousState);
  const handleFavorite = async () => {
    const user = await getCurrentUser();
    if (!user) {
      Alert.alert("Voce precisar estar logado para favoritar");
    }

    if (movieId) {
      const now = new Date().toISOString();
      const favoriteMovie: FavoriteMovie = {
        movieId,
        userId: user?.$id, // Você pode obter o userId do contexto de autenticação do Appwrite
        comments: comment,
        favoriteDate: now,
        rating: userRating,
        isPublic: isPublic,
        createdAt: now,
        updatedAt: now,
      };
      await addMovieToFavorites(favoriteMovie);
      onFavorite(true);
      onClose();
    }
  };
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={() => onClose()}
    >
      <StatusBar hidden={true} />
      <View className="item-center flex-1 justify-center bg-black/80">
        <View className="bg-dark-100/95 rounded-2xl p-5 border mx-5">
          <Text className="text-light-200 text-2xl font-bold text-left py-1">
            Comentário
          </Text>
          <TextInput
            placeholder="Coloque aqui seu comentário sobre o filme"
            placeholderTextColor={colors.light[100]}
            value={comment}
            onChangeText={setComment}
            className="bg-primary/70 rounded-xl p-4 mb-4 text-light-100"
          ></TextInput>
          <Text className="text-light-200 text-2xl font-bold text-left py-1">
            Avaliação
          </Text>
          <View className="mt-1">
            <View className="flex-row items-center">
              {Array.from({ length: 5 }, (_, index) => {
                const starValue = index + 1;
                const fillPercent = Math.max(
                  0,
                  Math.min(1, userRating - index),
                );

                return (
                  <View
                    key={starValue}
                    className="w-8 h-10 relative justify-center items-center"
                  >
                    <Text className="font-normal text-2xl text-light-200">
                      ★
                    </Text>
                    <View
                      pointerEvents="none"
                      className="absolute left-0 top-0 bottom-0 overflow-hidden items-center justify-center"
                      style={{ width: `${fillPercent * 100}%` }}
                    >
                      <Text className="text-2xl accent-current">★</Text>
                    </View>
                    <Pressable
                      onPress={() => setUserRating(starValue - 0.5)}
                      className="absolute left-0 top-0 bottom-0 w-1/2"
                    />
                    <Pressable
                      onPress={() => setUserRating(starValue)}
                      className="absolute left-0 top-0 bottom-0 w-1/2"
                    />
                  </View>
                );
              })}
            </View>
            <Text className="text-light-100 text-base font-semibold mb-4">
              {userRating.toFixed(1)} / 5
            </Text>
            <Text className="text-light-200 text-2xl font-bold text-left py-1">
              Tornar Publico?
            </Text>
            <Switch
              trackColor={{ false: colors.light[300], true: colors.light[100] }}
              thumbColor={isPublic ? "#f5dd4b" : "#f4f3f4"}
              onValueChange={toggleSwitch}
              value={isPublic}
            />
          </View>
        </View>
        <TouchableOpacity
          className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
          onPress={handleFavorite}
        >
          <Text className="text-light-100 text-base font-semibold">Post</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default FavoriteModal;
function setIsFavorite(arg0: (prev: any) => boolean) {
  throw new Error("Function not implemented.");
}
