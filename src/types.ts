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
}

export interface Avatar {
    _id: string;
    name: string;
    image_url: string;
    type: 'default' | 'premium' | 'reward';
    unlock_condition: 'none' | 'course_completion' | 'level_up' | 'token';
    is_active: boolean;
    required_level?: number; // New field
    is_unlocked?: boolean; // Frontend helper property
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
