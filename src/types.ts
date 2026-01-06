export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'student' | 'tutor' | 'admin';
    avatar_url?: string;
    current_avatar_url?: string;
    
    // PRD v1.1
    first_name?: string;
    last_name?: string;
    major?: string;
    semester?: string;
    bio?: string;
    xp_points: number;
    level: number;
}

export interface Avatar {
    _id: string;
    name: string;
    image_url: string;
    type: 'default' | 'premium' | 'reward';
    unlock_condition: 'none' | 'course_completion' | 'level_up';
    is_active: boolean;
    is_unlocked?: boolean;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}
