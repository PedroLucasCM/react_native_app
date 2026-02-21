import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { use } from "react";
import { router, useLocalSearchParams } from "expo-router";

import { fetchMovieDetails } from "@/services/api";
import { icons } from "@/constants/icons";
import useFetch from "@/services/useFetch";

interface MovieInfoProps {
  label: string;
  value: string | number | undefined | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-2">
    <Text className="text-light-200 font-normal text-sm mt-2">{label}</Text>
    <Text className="text-light-100 text-sm mt-2 font-bold">
      {value || "N/A"}
    </Text>
  </View>
);

const MovieDetails = () => {
  const { id } = useLocalSearchParams();
  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string),
  );
  return (
    <View className="flex-1 bg-primary">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
            }}
            className="w-full h-[550px]"
            resizeMode="stretch"
          />
        </View>
        <View className="flex-col items-start justify-center mt-5 ">
          <Text className="text-white text-xl font-bold">{movie?.title}</Text>
        </View>
        <View className="flex-row items-center mt-2 gap-x-1">
          <Image source={icons.star} className="size-2" />
          <Text className="text-light-200 text-sm mt-2 font-bold">
            {((movie?.vote_average ?? 0) / 2).toPrecision(2)} / 5
          </Text>
          <Text className="text-light-100 text-sm mt-2">
            ({movie?.vote_count} votes)
          </Text>
        </View>
        <View className="flex-row items-center mt-2 gap-x-1">
          <Text className="text-light-200 text-sm mt-2">
            {movie?.release_date?.split("-")[0]}
          </Text>
          <Text className="text-light-200 text-sm mt-2">
            {movie?.genres.map((genre) => genre.name).join(" - ") || "N/A"}
          </Text>
        </View>
        <View className="flex-row items-center mt-2 gap-x-1">
          <Text className="text-light-200 text-sm mt-2">
            {movie?.runtime} min
          </Text>
        </View>

        <MovieInfo label="Overview" value={movie?.overview} />
        <MovieInfo
          label="Production Companies"
          value={movie?.production_companies.map((c) => c.name).join(" - ")}
        />
        <MovieInfo
          label="Original Language"
          value={movie?.original_language.toUpperCase()}
        />
      </ScrollView>
      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white text-base font-semibold">Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MovieDetails;
