import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  getFavoriteMovie,
  removeMovieFromFavorites,
} from "@/services/appwrite";
import { useLocalSearchParams, useRouter } from "expo-router";

import FavoriteModal from "@/components/FavoriteModal";
import { colors } from "@/constants/colors";
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
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const movieId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);

  const {
    data: favoriteMovie,
    loading: favoritesLoading,
    refetch: refetchFavorite,
  } = useFetch(() => getFavoriteMovie(movieId as string), Boolean(movieId));

  const { data: movie, loading: movieLoading } = useFetch(
    () => fetchMovieDetails(movieId as string),
    Boolean(movieId),
  );

  const [isFavorite, setIsFavorite] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const isFavoriteByUser = isFavorite ? "#f5dd4b" : colors.light[100];

  useEffect(() => {
    setIsFavorite(Boolean(favoriteMovie));
  }, [favoriteMovie]);

  const handleFavorite = async () => {
    if (!movieId) return;

    if (isFavorite) {
      try {
        await removeMovieFromFavorites(movieId as string);
        setIsFavorite((previous) => !previous);
        Alert.alert("Filme removido dos favoritos.");
        await refetchFavorite();
      } catch (error) {
        console.error("Erro ao remover favorito:", error);
        Alert.alert("Nao foi possivel desfavoritar o filme.");
      }
      return;
    }

    setModalVisible(true);
  };

  return (
    <View className="flex-1 bg-primary">
      {(movieLoading || favoritesLoading) && (
        <ActivityIndicator
          size="large"
          color={colors.light[100]}
          className="mt-6"
        />
      )}

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

        <View className="flex-row items-center justify-between mt-5 w-full">
          <Text className="text-light-100 text-xl font-bold flex-1 pr-3">
            {movie?.title}
          </Text>
          <Pressable className="ml-2" onPress={handleFavorite}>
            <Image
              source={icons.save}
              className="size-5"
              style={{
                opacity: isFavorite ? 1 : 0.85,
                tintColor: isFavoriteByUser,
              }}
            />
          </Pressable>
        </View>

        {modalVisible && movie && !isFavorite && (
          <FavoriteModal
            movieId={movie.id}
            onClose={() => {
              setModalVisible(false);
            }}
            onFavorite={async (favorite: boolean) => {
              setIsFavorite(favorite);
              setModalVisible(false);
              if (favorite) {
                Alert.alert("Favoritado!");
              }
              await refetchFavorite();
            }}
          />
        )}

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
          tintColor={colors.light[100]}
        />
        <Text className="text-light-100 text-base font-semibold">Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MovieDetails;
