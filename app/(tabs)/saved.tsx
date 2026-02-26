import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";

import MovieCard from "@/components/MovieCard";
import React from "react";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { getFavoriteMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";

const Saved = () => {
  const {
    data: favoriteMoviesData,
    loading: favoritesLoading,
    error: favoritesError,
  } = useFetch(getFavoriteMovies);
  const favoriteMovies = favoriteMoviesData ?? [];

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full h-full z-0"
        resizeMode="cover"
      />

      <FlatList<Movie>
        data={favoriteMovies}
        renderItem={({ item }) => (
          <View className="flex-1 mb-4">
            <MovieCard item={item} />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        className="px-5"
        columnWrapperStyle={{
          justifyContent: "center",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{
          paddingTop: 84,
          paddingBottom: 110,
          flexGrow: favoriteMovies.length === 0 ? 1 : 0,
        }}
        ListHeaderComponent={
          <>
            <Text className="text-white text-2xl font-bold text-center mb-3">
              Favoritos
            </Text>
            {favoritesLoading && (
              <ActivityIndicator size="large" color="#fff" className="my-3" />
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
                tintColor="#A8B5DB"
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
