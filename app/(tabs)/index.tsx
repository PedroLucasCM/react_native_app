import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { fetchMovies, fetchTVshows } from "@/services/api";
import { useCallback, useEffect, useState } from "react";

import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const [selected, setSelected] = useState<"movies" | "series">("movies");

  const fetchSelectedMedia = useCallback(
    () =>
      selected === "movies"
        ? fetchMovies({ query: "" })
        : fetchTVshows({ query: "" }),
    [selected],
  );

  const { data, loading, error, refetch } = useFetch<MediaItem[]>(
    fetchSelectedMedia,
    false,
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  const isMoviesSelected = selected === "movies";

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        <View className="flex-1 mt-5">
          <SearchBar
            onPress={() => router.push("/search")}
            placeholder="Search for a movie or show"
          />

          <View className="mt-5 mb-3 flex-row gap-3">
            <Pressable
              className={`flex-1 py-3 rounded-lg ${
                isMoviesSelected ? "bg-white" : "bg-secondary"
              }`}
              onPress={() => setSelected("movies")}
            >
              <Text
                className={`text-center font-bold ${
                  isMoviesSelected ? "text-black" : "text-white"
                }`}
              >
                Filmes
              </Text>
            </Pressable>

            <Pressable
              className={`flex-1 py-3 rounded-lg ${
                isMoviesSelected ? "bg-secondary" : "bg-white"
              }`}
              onPress={() => setSelected("series")}
            >
              <Text
                className={`text-center font-bold ${
                  isMoviesSelected ? "text-white" : "text-black"
                }`}
              >
                Series
              </Text>
            </Pressable>
          </View>

          <Text className="text-white text-center font-bold mt-5 mb-3">
            {isMoviesSelected ? "Latest Movies!" : "Latest Series!"}
          </Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#fff"
              className="mt-10 self-center"
            />
          ) : error ? (
            <Text className="text-center text-white">
              Error: {error.message}
            </Text>
          ) : (
            <FlatList<MediaItem>
              data={data ?? []}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View className="flex-1 mb-4">
                  <MovieCard item={item} mediaType={selected} />
                </View>
              )}
              numColumns={2}
              columnWrapperStyle={{
                justifyContent: "space-between",
                gap: 12,
              }}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}
