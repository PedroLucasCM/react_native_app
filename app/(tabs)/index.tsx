import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";

import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { fetchMovies } from "@/services/api";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";

export default function Index() {
  const rounter = useRouter();

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies({ query: "" }));

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        {moviesLoading ? (
          <ActivityIndicator
            size="large"
            color="#fff"
            className="mt-10 self-center"
          />
        ) : moviesError ? (
          <Text>Error: {moviesError.message}</Text>
        ) : (
          <View className="flex-1 mt-5">
            <SearchBar
              onPress={() => rounter.push("/search")}
              placeholder="Search for a movie or show"
            />

            <>
              <Text className="text-white text-center font-bold mt-5 mb-3">
                Latest Movies!
              </Text>
              <FlatList<Movie>
                data={movies ?? []}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <View className="flex-1 mb-4">
                    <MovieCard item={item} />
                  </View>
                )}
                numColumns={2}
                columnWrapperStyle={{
                  justifyContent: "space-between",
                  gap: 12,
                }}
                scrollEnabled={false}
              />
            </>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
