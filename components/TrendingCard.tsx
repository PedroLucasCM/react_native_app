import { Image, Text, TouchableOpacity, View } from "react-native";

import { Link } from "expo-router";
import MaskedView from "@react-native-masked-view/masked-view";
import React from "react";
import { images } from "@/constants/images";

const TrendingCard = ({
  movie: { movie_id, title, poster_url },
  index,
}: TrendingCardProps) => {
  return (
    <Link href={`/movies/${movie_id}`} asChild>
      <TouchableOpacity className="w-32 relative pl-5">
        <Image
          source={{ uri: poster_url }}
          className="w-32 h-48 rounded-lg"
          resizeMode="cover"
        />
        <View className="absolute bottom-9 -left-3.5 rounded-full px-2 py-1">
          <MaskedView
            maskElement={
              <Text className="text-6xl text-light-100 font-bold">
                {index + 1}
              </Text>
            }
          >
            <Image
              source={images.rankingGradient}
              className="size-14"
              resizeMode="cover"
            />
          </MaskedView>
        </View>
        <Text
          className="text-light-200 font-bold mt-2 text-sm"
          numberOfLines={2}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Link>
  );
};

export default TrendingCard;
