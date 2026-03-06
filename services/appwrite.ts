import {
  Account,
  Client,
  Databases,
  ID,
  Models,
  Permission,
  Query,
  Role,
} from "react-native-appwrite";

import { fetchMovieDetails } from "./api";

// trach the searches made by the user and store them in appwrite database
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const USERS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID_USERS!;
const FAVORITE_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID_FAVORITES!;

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);
const account = new Account(client);

type CreateAccountParams = {
  email: string;
  password: string;
  username: string;
  birthDate: string;
};

type UserFavoriteMovies = {
  $id: string;
  userId: string;
  movieId: number;
  favoriteDate: Date;
  rating: number;
  comments: string;
  isPublic: boolean;
  $createdAt: Date;
  $updateAt: Date;
};

type FavoriteDocument = Models.Document & UserFavoriteMovies;

export const updateSearchCount = async (searchTerm: string, movie: Movie) => {
  try {
    const normalizedSearchTerm = searchTerm.trim();
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("movie_id", movie.id),
      Query.orderDesc("count"),
      Query.limit(100),
    ]);

    console.log("Appwrite search count result:", result);

    if (result.documents.length > 0) {
      const [primaryMovie, ...duplicateMovies] = result.documents;
      const duplicatedCount = duplicateMovies.reduce(
        (total, doc) => total + Number(doc.count ?? 0),
        0,
      );
      const nextCount = Number(primaryMovie.count ?? 0) + duplicatedCount + 1;

      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        primaryMovie.$id,
        {
          count: nextCount,
          searchTerm: normalizedSearchTerm,
          title: movie.title,
          poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        },
      );

      if (duplicateMovies.length > 0) {
        await Promise.all(
          duplicateMovies.map((doc) =>
            database.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id),
          ),
        );
      }
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: normalizedSearchTerm,
        movie_id: movie.id,
        count: 1,
        title: movie.title,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
    }
  } catch (error) {
    console.error("Error updating search count in Appwrite:", error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.orderDesc("count"),
      Query.limit(5),
    ]);
    return result.documents as unknown as TrendingMovie[];
  } catch (error) {
    console.log("Error fetching trending movies from Appwrite:", error);
    return undefined;
  }
};

export const getCurrentUser =
  async (): Promise<Models.User<Models.Preferences> | null> => {
    try {
      return await account.get();
    } catch (error) {
      console.log("Error fetching current user from Appwrite:", error);
      return null;
    }
  };

export const loginUser = async (email: string, password: string) => {
  try {
    await account.createEmailPasswordSession(email, password);
    return await account.get();
  } catch (error) {
    console.log("Error ao logar usuário no appwrite:", error);
    throw error;
  }
};

export const logoutCurrentUser = async () => {
  try {
    await account.deleteSession("current");
    return true;
  } catch (error) {
    console.log("Error logging out current user from Appwrite:", error);
    return false;
  }
};

export const createUserAccount = async ({
  email,
  password,
  username: name,
  birthDate,
}: CreateAccountParams) => {
  try {
    const user = await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    database.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      user.$id,
      {
        user_id: user.$id,
        email: user.email,
        name: user.name,
        birthDate,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ],
    );
    return user;
  } catch (error) {
    console.log("Error creating Appwrite user:", error);
    throw error;
  }
};

export const addMovieToFavorites = async (favorite: FavoriteMovie) => {
  if (!FAVORITE_COLLECTION_ID) {
    console.log("Favorites collection ID is not defined.");
    return;
  }

  try {
    const user = await account.get();
    const createdAt = favorite.createdAt || new Date().toISOString();
    const updatedAt = favorite.updatedAt || createdAt;
    const permissions = [
      ...(favorite.isPublic ? [Permission.read(Role.any())] : []),
    ];

    await database.createDocument(
      DATABASE_ID,
      FAVORITE_COLLECTION_ID,
      ID.unique(),
      {
        userId: user.$id,
        movieId: favorite.movieId,
        comments: favorite.comments,
        favoriteDate: favorite.favoriteDate,
        rating: favorite.rating,
        isPublic: favorite.isPublic,
        $createdAt: createdAt,
        $updatedAt: updatedAt,
      },
      permissions,
    );
  } catch (error) {
    console.log("Error adding movie to favorites:", error);
    throw error;
  }
};
export const getFavoriteMovies = async (): Promise<Movie[]> => {
  if (!FAVORITE_COLLECTION_ID) return [];
  try {
    const user = await account.get();
    const result = await database.listDocuments(
      DATABASE_ID,
      FAVORITE_COLLECTION_ID,
      [
        Query.equal("userId", user.$id),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ],
    );

    const favorites = await Promise.all(
      result.documents.map(async (doc) => {
        const movieId = Number(doc.movieId);
        if (!Number.isFinite(movieId)) return null;

        try {
          const movieDetails = await fetchMovieDetails(movieId.toString());
          return movieDetails as unknown as Movie;
        } catch (error) {
          console.log(`Error fetching movie ${movieId} from TMDB:`, error);
          return null;
        }
      }),
    );

    return favorites.filter((movie): movie is Movie => movie !== null);
  } catch (error) {
    console.log("Error fetching favorite movies from Appwrite:", error);
    return [];
  }
};

export const getFavoriteMovie = async (
  movieId: number | string,
): Promise<FavoriteDocument | null> => {
  if (!FAVORITE_COLLECTION_ID) return null;
  try {
    const user = await account.get();
    const parsedMovieId = Number(movieId);
    if (!Number.isFinite(parsedMovieId)) return null;

    const result = await database.listDocuments(
      DATABASE_ID,
      FAVORITE_COLLECTION_ID,
      [
        Query.equal("userId", user.$id),
        Query.equal("movieId", parsedMovieId),
        Query.limit(1),
      ],
    );

    if (!result.documents.length) return null;

    return result.documents[0] as unknown as FavoriteDocument;
  } catch (error) {
    console.log("Error fetching favorite movie from Appwrite:", error);
    return null;
  }
};

export const removeMovieFromFavorites = async (movieId: number | string) => {
  if (!FAVORITE_COLLECTION_ID) return;
  try {
    const favoriteDocument = await getFavoriteMovie(movieId);
    if (!favoriteDocument) return;

    await database.deleteDocument(
      DATABASE_ID,
      FAVORITE_COLLECTION_ID,
      favoriteDocument.$id,
    );
  } catch (error) {
    console.log("Error removing movie from favorites:", error);
    throw error;
  }
};
