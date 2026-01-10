export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'student' | 'tutor' | 'admin';
    xp_points: number;
    level: number;
    avatar_url?: string; // Legacy
    current_avatar_url?: string;
    avatar_unlock_tokens?: number; // New field
    first_name?: string;
    last_name?: string;
    major?: string;
    semester?: string;
    bio?: string;
    expertise?: string;
    tutor_profile_image?: string;
    privacy_settings?: {
        show_nexons: boolean;
        show_courses: boolean;
    };
}

export interface Avatar {
    token_cost: number;
    _id: string;
    name: string;
    image_url: string;
    type: 'default' | 'premium' | 'reward';
    unlock_condition: 'none' | 'course_completion' | 'level_up' | 'token';
    category: 'male' | 'female' | 'general' | 'admin';
    is_active: boolean;
    required_level?: number; // New field
    is_unlocked?: boolean; // Frontend helper property
    required_course_title?: string; // New field for course_completion rewards
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

export interface Course {
    total_chapters: number;
    _id: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    packages: {
        basic: CoursePackage;
        advanced: CoursePackage;
        premium: CoursePackage;
    };
    tutor_id?: any; // Populated
    type: 'university' | 'general';
    major?: string;
    category?: string;
    level: string;
    status: 'ongoing' | 'complete' | 'disabled';
    total_duration?: string;
    completion_xp_bonus?: number;
    reward_avatar_id?: string | Avatar; // Can be ID or populated object
    createdAt?: string;
    updatedAt?: string;
    is_enrolled?: boolean; // Frontend helper
    chapters?: Chapter[]; // Populated in detail view
}

export interface CoursePackage {
    price: number;
    features: string[];
}

export interface Material {
    _id?: string;
    title: string;
    type: 'video' | 'pdf' | 'link' | 'slide';
    url: string;
    description?: string; // Optional description
    min_package_tier: 'basic' | 'advanced' | 'premium';
}

export interface Chapter {
    _id: string;
    course_id: string;
    title: string;
    description: string;
    position: number;
    is_free: boolean;
    xp_reward: number;
    materials: Material[];
}

export interface Enrollment {
    _id: string;
    user_id: string;
    course_id: string;
    status: 'pending' | 'active' | 'completed' | 'rejected' | 'dropped';
    package: 'basic' | 'advanced' | 'premium';
    progress: number;
    completed_material_ids?: string[];
    completed_chapter_ids?: string[];
    claimed_chapter_ids?: string[]; // New
    is_course_reward_claimed?: boolean; // New
    amount_paid: number;
    receipt_url?: string;
    rejection_reason?: string;
    createdAt: string;
    updatedAt: string;
    isEnrolled?: boolean; // Frontend helper
}

export interface PromoCode {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    validFrom: string; // ISO Dates
    validUntil: string;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
    applicableCourses?: string[]; // IDs
    applicablePackages?: string[];
}
