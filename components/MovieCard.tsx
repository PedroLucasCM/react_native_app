import { Image, Text, TouchableOpacity, View } from "react-native";

import { Link } from "expo-router";
import React from "react";
import { icons } from "@/constants/icons";

const MovieCard = ({ item }: { item: Movie }) => {
  return (
    <Link href={`/movie/${item.id}` as any} asChild>
      <TouchableOpacity className="w-full bg-secondary rounded-lg p-3">
        <Image
          source={{
            uri: item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : "https://via.placeholder.com/600x400/1a1a1a/ffffff.png",
          }}
          className="w-full h-56 rounded-lg"
          resizeMode="cover"
        />
        <Text className="text-sm text-white font-bold mt-2" numberOfLines={1}>
          {item.title}
        </Text>

        <View className="flex-row items-center justify-start gap-x-1 mt-1">
          <Image
            source={icons.star}
            className="size-4"
            resizeMode="contain"
            tintColor="#facc15"
          />
          <Text className="text-xs text-white font-bold uppercase">
            {(item.vote_average / 2).toFixed(1)}/5
          </Text>
        </View>
        <View className="flex-row items-center justify-between gap-x-1 mt-1">
          <Text className="text-xs text-light-300 font-medium mt-1">
            {item.release_date?.split("-")[0]}
          </Text>
          <Text className="text-xs text-light-300 font-medium uppercase">
            Movie
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default MovieCard;
