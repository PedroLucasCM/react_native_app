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
import TrendingCard from "@/components/TrendingCard";
import { colors } from "@/constants/colors";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import useFetch from "@/services/useFetch";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
  } = useFetch(getTrendingMovies);
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
        refreshControl={undefined}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        {moviesLoading || trendingLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.light[100]}
            className="mt-10 self-center"
          />
        ) : moviesError || trendingError ? (
          <Text>Error: {moviesError?.message || trendingError?.message}</Text>
        ) : (
          <View className="flex-1 mt-5">
            <SearchBar
              onPress={() => router.push({ pathname: "/search", params: { focus: "1" } })}
              placeholder="Search for a movie or show"
            />
            {trendingMovies && trendingMovies.length > 0 && (
              <View className="mt-5 mb-3">
                <Text className="text-light-100 text-center font-bold mt-5 mb-3">
                  Trending Movies!
                </Text>
                <FlatList<TrendingMovie>
                  className="mb-4 mt-3"
                  data={trendingMovies}
                  keyExtractor={(item, index) =>
                    `${item.movie_id.toString()}-${index}`
                  }
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} />
                  )}
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View className="w-4" />}
                />
              </View>
            )}
            <>
              <Text className="text-light-100 text-center font-bold mt-5 mb-3">
                Latest Movies!
              </Text>
              <FlatList<Movie>
                data={movies}
                keyExtractor={(item, index) => `${item.id.toString()}-${index}`}
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
