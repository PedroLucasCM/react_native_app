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

// trach the searches made by the user and store them in appwrite database
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const FAVORITES_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_FAVORITES_COLLECTION_ID;
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const USERS_COLLECTION_ID =
  process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID_USERS!;

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

const normalizePosterPath = (value: unknown): string => {
  if (typeof value !== "string" || !value) return "";
  if (!value.startsWith("http")) return value;

  const match = value.match(/\/w\d+(\/.+)$/);
  return match?.[1] ?? value;
};

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

export const getFavoriteMovies = async (): Promise<Movie[]> => {
  if (!FAVORITES_COLLECTION_ID) return [];

  try {
    const user = await account.get();
    const result = await database.listDocuments(
      DATABASE_ID,
      FAVORITES_COLLECTION_ID,
      [
        Query.equal("user_id", user.$id),
        Query.orderDesc("$createdAt"),
        Query.limit(100),
      ],
    );

    return result.documents
      .map((doc): Movie => {
        const title = String(doc.title ?? "");
        const movieId = Number(doc.movie_id ?? doc.id ?? 0);

        return {
          id: movieId,
          title,
          adult: Boolean(doc.adult ?? false),
          backdrop_path: String(doc.backdrop_path ?? ""),
          genre_ids: Array.isArray(doc.genre_ids)
            ? doc.genre_ids.map((id: unknown) => Number(id))
            : [],
          original_language: String(doc.original_language ?? "en"),
          original_title: String(doc.original_title ?? title),
          overview: String(doc.overview ?? ""),
          popularity: Number(doc.popularity ?? 0),
          poster_path: normalizePosterPath(doc.poster_path ?? doc.poster_url),
          release_date: String(doc.release_date ?? ""),
          video: Boolean(doc.video ?? false),
          vote_average: Number(doc.vote_average ?? 0),
          vote_count: Number(doc.vote_count ?? 0),
        };
      })
      .filter((movie) => movie.id > 0 && movie.title.length > 0);
  } catch (error) {
    console.log("Error fetching favorite movies from Appwrite:", error);
    return [];
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
