// interfaces.ts

// Interface voor de hoofdobjecten (Manga)
export interface Manga {
  id: string;
  title: string;
  genre: string;
  releaseDate: string;   // bv. "2023-07-12" of "2023"
  coverImage: string;
  description?: string;
  authorId?: string;
  rating?: number;
  birthYear?: number;
  extraInfo?: string;
  relatedIds?: string[];     // ids van gerelateerde mangas (indien van toepassing)
  subObjectIds?: string[];   // ids van subobjecten (bv. spin-offs)
}

// Interface voor auteurs uit de extra dataset
export interface Author {
  authorId: string;
  name: string;
  nationality: string;
  active: boolean;
  birthYear: number;
}
