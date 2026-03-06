import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  View,
} from "react-native";
import React, { useCallback } from "react";

import MovieCard from "@/components/MovieCard";
import { colors } from "@/constants/colors";
import { getFavoriteMovies } from "@/services/appwrite";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import useFetch from "@/services/useFetch";
import { useFocusEffect } from "@react-navigation/native";

const Saved = () => {
  const {
    data: favoriteMoviesData,
    loading: favoritesLoading,
    error: favoritesError,
    refetch,
  } = useFetch(getFavoriteMovies, false);
  const favoriteMovies = favoriteMoviesData ?? [];

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full h-full z-0" />
      <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />
      <FlatList<Movie>
        data={favoriteMovies}
        renderItem={({ item }) => (
          <View className="flex-1 mb-4">
            <MovieCard item={item} />
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refetch} />
        }
        keyExtractor={(item, index) => `${item.id.toString()}-${index}`}
        numColumns={2}
        className="px-5"
        columnWrapperStyle={{
          justifyContent: "space-between",
          gap: 12,
        }}
        scrollEnabled={false}
        ListHeaderComponent={
          <>
            <Text className="text-light-100 text-2xl font-bold text-center mb-3">
              Favoritos
            </Text>
            {favoritesLoading && (
              <ActivityIndicator
                size="large"
                color={colors.light[100]}
                className="my-3"
              />
            )}
            {favoritesError && (
              <Text className="text-red-500 text-center px-5 my-3">
                Erro ao carregar favoritos.
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !favoritesLoading ? (
            <View className="flex-1 items-center justify-center px-8">
              <Image
                source={icons.save}
                className="size-16 mb-4"
                resizeMode="contain"
                tintColor={colors.light[200]}
              />
              <Text className="text-light-200 text-center text-base leading-6">
                Voce ainda nao favoritou nenhum filme.
              </Text>
              <Text className="text-light-300 text-center text-sm mt-2 leading-5">
                Favorite um filme para ele aparecer aqui.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Saved;
