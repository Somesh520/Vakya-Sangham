// This file defines the structure for your data across the app.

export interface Lesson {
  _id: string;
  title: string;
  videoURL: string;
  duration: number;
}

export interface Module {
  _id: string;
  title: string;
  lessons: Lesson[];
}

// Added a basic Review interface
export interface Review {
    _id: string;
    rating: number;
    comment: string;
    user: {
        _id: string;
        fullname: string;
    };
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    fullname: string;
  };
  modules: Module[];
  price: number;
  thumbnailURL?: string;
  // --- Added missing fields to match your backend schema ---
  isPublished: boolean;
  category: string;
  language: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  reviews: Review[];
  createdAt?: string; // from timestamps
  updatedAt?: string; // from timestamps
}
