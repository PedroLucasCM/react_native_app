/* eslint-disable react-hooks/rules-of-hooks */

import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { useEffect, useState } from "react";

import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { fetchMovies } from "@/services/api";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import useFetch from "@/services/useFetch";

const search = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({ query: searchQuery }), false);
  const movieCount = movies?.length ?? 0;

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();
      } else {
        reset();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0"
        resizeMode="cover"
      />
      <FlatList<Movie>
        data={movies ?? []}
        renderItem={({ item }) => (
          <View className="flex-1 mb-4">
            <MovieCard item={item} />
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
        className="px-5"
        numColumns={2}
        columnWrapperStyle={{
          justifyContent: "center",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>
            <View className="my-5">
              <SearchBar
                placeholder="Search for movies..."
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />
            </View>
            {moviesLoading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}
            {moviesError && (
              <Text className="text-red-500 px-5 my-3">
                Error fetching movies: {moviesError.message}
              </Text>
            )}
            {!moviesLoading &&
              !moviesError &&
              searchQuery.trim() &&
              movieCount > 0 && (
                <Text className="text-white text-xl font-bold">
                  Search results for{" "}
                  <Text className="text-accent">{searchQuery}</Text>
                </Text>
              )}
          </>
        }
        ListEmptyComponent={
          !moviesLoading && !moviesError ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {searchQuery.trim() ? "No movies found" : "Search for a movie"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default search;
