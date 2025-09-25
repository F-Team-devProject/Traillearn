-- Traillearn Database Schema
-- Créez ces tables dans votre projet Supabase

-- Types énumérés
CREATE TYPE user_role AS ENUM ('admin', 'mentor', 'student');
CREATE TYPE education_level AS ENUM ('high_school', 'bachelor', 'master', 'phd', 'professional');
CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE community_category AS ENUM ('academic', 'professional', 'country', 'interest', 'skill');
CREATE TYPE event_type AS ENUM ('webinar', 'conference', 'workshop', 'networking', 'seminar');

-- Table des utilisateurs (étendue de auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    country_code VARCHAR(3),
    city VARCHAR(100),
    profile_completed BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profils utilisateurs
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    bio TEXT,
    avatar_url VARCHAR(500),
    current_education_level education_level,
    field_of_study VARCHAR(100),
    career_goals TEXT[],
    interests TEXT[],
    languages JSONB,
    skills JSONB,
    experience JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mentors
CREATE TABLE public.mentors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    expertise_areas TEXT[] NOT NULL,
    experience_years INTEGER NOT NULL,
    hourly_rate DECIMAL(10,2),
    availability JSONB,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_sessions INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions de mentorat
CREATE TABLE public.mentoring_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    status session_status DEFAULT 'scheduled',
    meeting_url VARCHAR(500),
    notes TEXT,
    feedback_mentor TEXT,
    feedback_mentee TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communautés
CREATE TABLE public.communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category community_category NOT NULL,
    country_code VARCHAR(3),
    city VARCHAR(100),
    is_private BOOLEAN DEFAULT FALSE,
    member_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Événements
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(200),
    is_online BOOLEAN DEFAULT FALSE,
    meeting_url VARCHAR(500),
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bourses
CREATE TABLE public.scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    provider VARCHAR(200) NOT NULL,
    amount DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    deadline DATE NOT NULL,
    eligibility_criteria JSONB,
    application_url VARCHAR(500),
    country_code VARCHAR(3),
    field_of_study TEXT[],
    education_level education_level[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table users
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour mentors
CREATE POLICY "Mentors can view their own data" ON public.mentors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Mentors can update their own data" ON public.mentors
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Mentors can insert their own data" ON public.mentors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view verified mentors" ON public.mentors
    FOR SELECT USING (is_verified = true);

CREATE POLICY "Admins can view all mentors" ON public.mentors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour mentoring_sessions
CREATE POLICY "Users can view their own sessions" ON public.mentoring_sessions
    FOR SELECT USING (
        auth.uid() = mentor_id OR auth.uid() = mentee_id
    );

CREATE POLICY "Users can update their own sessions" ON public.mentoring_sessions
    FOR UPDATE USING (
        auth.uid() = mentor_id OR auth.uid() = mentee_id
    );

CREATE POLICY "Users can insert sessions" ON public.mentoring_sessions
    FOR INSERT WITH CHECK (
        auth.uid() = mentor_id OR auth.uid() = mentee_id
    );

CREATE POLICY "Admins can view all sessions" ON public.mentoring_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour communities
CREATE POLICY "Everyone can view public communities" ON public.communities
    FOR SELECT USING (is_private = false);

CREATE POLICY "Users can view communities they created" ON public.communities
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create communities" ON public.communities
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update communities they created" ON public.communities
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all communities" ON public.communities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour events
CREATE POLICY "Everyone can view events" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Users can create events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update events they created" ON public.events
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all events" ON public.events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour scholarships
CREATE POLICY "Everyone can view active scholarships" ON public.scholarships
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all scholarships" ON public.scholarships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage scholarships" ON public.scholarships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name, role, email_verified)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'student')::user_role,
        NEW.email_confirmed_at IS NOT NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un utilisateur
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_mentors_verified ON public.mentors(is_verified);
CREATE INDEX idx_mentoring_sessions_mentor ON public.mentoring_sessions(mentor_id);
CREATE INDEX idx_mentoring_sessions_mentee ON public.mentoring_sessions(mentee_id);
CREATE INDEX idx_mentoring_sessions_status ON public.mentoring_sessions(status);
CREATE INDEX idx_communities_category ON public.communities(category);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_scholarships_deadline ON public.scholarships(deadline);
CREATE INDEX idx_scholarships_active ON public.scholarships(is_active);


