/* eslint-disable react-hooks/rules-of-hooks */

import { ActivityIndicator, FlatList, Image, Text, TextInput, View } from "react-native";
import { useEffect, useRef, useState } from "react";

import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { colors } from "@/constants/colors";
import { fetchMovies } from "@/services/api";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { updateSearchCount } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { useLocalSearchParams } from "expo-router";

const search = () => {
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const lastTrackedQueryRef = useRef<string | null>(null);
  const searchInputRef = useRef<TextInput>(null);

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({ query: debouncedQuery }), false);
  const movieCount = movies?.length ?? 0;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery) {
      void loadMovies();
    } else {
      reset();
      lastTrackedQueryRef.current = null;
    }
  }, [debouncedQuery]);

  useEffect(() => {
    if (moviesLoading || !debouncedQuery || !movies?.[0]) return;
    if (lastTrackedQueryRef.current === debouncedQuery) return;

    lastTrackedQueryRef.current = debouncedQuery;
    void updateSearchCount(debouncedQuery, movies[0]);
  }, [movies, moviesLoading, debouncedQuery]);

  useEffect(() => {
    if (focus !== "1") return;

    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [focus]);

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
        keyExtractor={(item, index) => `${item.id.toString()}-${index}`}
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
                inputRef={searchInputRef}
                autoFocus={focus === "1"}
              />
            </View>
            {moviesLoading && (
              <ActivityIndicator
                size="large"
                color={colors.light[200]}
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
                <Text className="text-light-100 text-xl font-bold">
                  Search results for{" "}
                  <Text className="text-accent">{searchQuery}</Text>
                </Text>
              )}
          </>
        }
        ListEmptyComponent={
          !moviesLoading && !moviesError ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-light-200">
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
