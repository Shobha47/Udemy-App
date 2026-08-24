// =============================================================================
// PRISMA ALIGNED ENUMS
// =============================================================================

export type Role = 'STUDENT' | 'INSTRUCTOR' | 'SUPERADMIN';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'AllLevels';

export type CourseBadge = 'Hot' | 'Bestseller' | 'New' | 'TopRated';

export type LessonType = 'video' | 'article' | 'quiz';

// =============================================================================
// SUB-RELATION INTERFACES
// =============================================================================

export interface UserMinimal {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  bio: string | null;
  headline: string | null;
  role: string ;
}

export interface MetadataItem {
  id: string;
  text: string;
  order: number;
  courseId: string;
}

export type Enrollment = {
  id: string;
  progress?: number;
  course?: {
    id?: string;
    title?: string;
    subtitle?: string;
    image?: string;
    slug?: string;
  };
};

export interface Lesson {
  id: string;
  title: string;
  duration: string | null;
  isPreview: boolean;
  type: LessonType;
  videoUrl: string | null;
  content: string | null;
  order: number;
  sectionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  title: string;
  totalDuration: string | null;
  order: number;
  courseId: string;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryMinimal {
  id: string;
  name: string;
  slug: string;
}

// =============================================================================
// CORE COURSE INTERFACE (Matches your base fields + includes your schema names)
// =============================================================================

export interface Course {
  // Your base required fields
  id: string;
  title: string;
  subtitle: string | null;      // Optional field in database schema
  description: string;
  image: string | null;         // Maps to Prisma's layout 'image String?'
  price: number;                // Float maps cleanly directly to number
  rating: number;               // Float maps cleanly directly to number

  // Remaining schema properties for components/discovery screens
  slug: string;
  previewVideo: string | null;
  originalPrice: number | null;
  language: string;
  level: CourseLevel;
  badge: CourseBadge | null;
  lastUpdated: string | null;

  // Denormalized Statistics Tracker
  reviewCount: number;
  studentCount: number;
  totalHours: number;
  totalLectures: number;
  totalArticles: number;

  // Access Strategy Rules
  hasCertificate: boolean;
  hasLifetimeAccess: boolean;
  hasMobileAccess: boolean;

  // Status Lifecycle Stages
  isDraft: boolean;
  isPublished: boolean;
  isApproved: boolean;

  // Optional Nested Relation Enforcements
  instructor?: UserMinimal;
  category?: CategoryMinimal;
  subcategory?: CategoryMinimal | null;
  whatYouWillLearn?: MetadataItem[];
  requirements?: MetadataItem[];
  sections?: Section[];

  createdAt: string;
  updatedAt: string;
}