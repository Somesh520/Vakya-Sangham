// src/types/types.ts  <- IS FILE KO UPDATE KARO

// ✅ STEP 1: Lesson type ko naye backend ke hisab se update karein
export interface Lesson {
  _id: string;
  title: string;
  duration: number;
  lessonType: 'video' | 'pdf'; // YEH SABSE ZAROORI HAI
  videoUrl?: string;           // Optional, kyunki yeh sirf video lesson mein hoga
  pdfUrl?: string;             // Optional, kyunki yeh sirf PDF lesson mein hoga
  pdfOriginalName?: string;    // Optional
}

// ✅ STEP 2: Module type ko update karein
export interface Module {
  _id: string;
  title: string;
  lessons: Lesson[];
}

// ✅ STEP 3: Course type ko update karein
export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string; 
  isPublished: boolean;
  category: string;
  price: number;
  thumbnailURL: string;
  language: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  modules: Module[];
  reviews: any[]; 
}