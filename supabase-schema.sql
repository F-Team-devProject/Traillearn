-- Schéma de base de données pour Traillearn
-- Ce fichier contient toutes les tables et politiques RLS nécessaires

-- Extension pour les UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  country_code VARCHAR(3),
  profile_picture TEXT,
  bio TEXT,
  role VARCHAR(20) DEFAULT 'visitor' CHECK (role IN ('admin', 'visitor')),
  
  -- Système multi-rôles
  is_student BOOLEAN DEFAULT FALSE,
  is_mentor BOOLEAN DEFAULT FALSE,
  student_status VARCHAR(20) DEFAULT 'inactive' CHECK (student_status IN ('inactive', 'active', 'suspended')),
  mentor_status VARCHAR(20) DEFAULT 'inactive' CHECK (mentor_status IN ('inactive', 'pending', 'approved', 'rejected', 'suspended')),
  mentor_validation_date TIMESTAMP,
  mentor_validation_notes TEXT,
  
  -- Système de points et niveaux
  points INTEGER DEFAULT 0,
  level VARCHAR(20) DEFAULT 'bronze' CHECK (level IN ('bronze', 'silver', 'gold', 'platinum')),
  
  -- Système de parrainage
  referral_code VARCHAR(20) UNIQUE,
  referred_by VARCHAR(20),
  
  -- Abonnement
  subscription_type VARCHAR(20) DEFAULT 'free' CHECK (subscription_type IN ('free', 'plus', 'pro', 'premium')),
  subscription_expires_at TIMESTAMP,
  
  -- Métadonnées
  profile_completed BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des bourses d'études
CREATE TABLE IF NOT EXISTS scholarships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  country VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL,
  fields_of_study TEXT[],
  language_requirements TEXT[],
  application_opening_date DATE,
  application_deadline DATE NOT NULL,
  university VARCHAR(255),
  program_type VARCHAR(100),
  duration_months INTEGER,
  eligibility_criteria TEXT,
  application_process TEXT,
  documents_required TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des favoris de bourses
CREATE TABLE IF NOT EXISTS scholarship_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  scholarship_id UUID REFERENCES scholarships(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, scholarship_id)
);

-- Table des alertes de bourses
CREATE TABLE IF NOT EXISTS scholarship_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  filters JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des mentors
CREATE TABLE IF NOT EXISTS mentors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  domains TEXT[] NOT NULL,
  languages TEXT[] NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  capacity_month INTEGER DEFAULT 10,
  hourly_rate DECIMAL(8,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  experience_years INTEGER,
  education TEXT,
  certifications TEXT[],
  bio TEXT,
  availability_slots JSONB,
  is_verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_sessions INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des sessions de mentorat
CREATE TABLE IF NOT EXISTS mentoring_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
  student_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('academic', 'career', 'integration', 'job_preparation')),
  scheduled_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'in_progress')),
  objectives TEXT[],
  outcomes TEXT[],
  notes TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des événements
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('webinar', 'bootcamp', 'conference', 'workshop')),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  country VARCHAR(100),
  is_online BOOLEAN DEFAULT FALSE,
  max_participants INTEGER,
  registration_deadline TIMESTAMP,
  price DECIMAL(8,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  organizer_id UUID REFERENCES user_profiles(id),
  tags TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des inscriptions aux événements
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled', 'no_show')),
  registration_date TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  UNIQUE(event_id, user_id)
);

-- Table des forums
CREATE TABLE IF NOT EXISTS forums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  country VARCHAR(100),
  school VARCHAR(255),
  domain VARCHAR(100),
  is_private BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  owner_id UUID REFERENCES user_profiles(id),
  moderator_id UUID REFERENCES user_profiles(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  admin_notes TEXT,
  validated_by UUID REFERENCES user_profiles(id),
  validated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des posts de forums
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  forum_id UUID REFERENCES forums(id) ON DELETE CASCADE,
  author_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255),
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  parent_post_id UUID REFERENCES forum_posts(id),
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'pending', 'deleted', 'hidden')),
  moderation_reason TEXT,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des alertes d'emploi
CREATE TABLE IF NOT EXISTS job_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  country VARCHAR(100) NOT NULL,
  domain VARCHAR(100) NOT NULL,
  experience_level VARCHAR(50),
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'assigned', 'completed', 'cancelled')),
  assigned_mentor_id UUID REFERENCES mentors(id),
  commission_amount DECIMAL(8,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des recommandations IA
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('career_path', 'course', 'mentor', 'scholarship', 'environment')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  data JSONB NOT NULL,
  confidence_score DECIMAL(3,2),
  is_viewed BOOLEAN DEFAULT FALSE,
  is_applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('subscription', 'one_time', 'mentor_commission', 'job_placement')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('paypal', 'stripe', 'bank_transfer')),
  gateway_transaction_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des feedbacks
CREATE TABLE IF NOT EXISTS feedback_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE,
  student_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES mentoring_sessions(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  type VARCHAR(50) DEFAULT 'mentor' CHECK (type IN ('mentor', 'platform')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'sms', 'push')),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('scholarship', 'event', 'deadline', 'mentor', 'payment', 'system', 'forum', 'job')),
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  read_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table des checklists administratives
CREATE TABLE IF NOT EXISTS administrative_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_time VARCHAR(50),
  required_documents TEXT[],
  cost_estimate DECIMAL(8,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  tips TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des aides à l'intégration
CREATE TABLE IF NOT EXISTS integration_assistance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  destination_country VARCHAR(100) NOT NULL,
  destination_city VARCHAR(100) NOT NULL,
  arrival_date DATE NOT NULL,
  assistance_type VARCHAR(50) NOT NULL CHECK (assistance_type IN ('airport_pickup', 'accommodation', 'local_contacts', 'orientation', 'all')),
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed', 'cancelled')),
  assigned_mentor_id UUID REFERENCES mentors(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scholarships_updated_at BEFORE UPDATE ON scholarships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scholarship_alerts_updated_at BEFORE UPDATE ON scholarship_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON mentors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentoring_sessions_updated_at BEFORE UPDATE ON mentoring_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forums_updated_at BEFORE UPDATE ON forums FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_alerts_updated_at BEFORE UPDATE ON job_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integration_assistance_updated_at BEFORE UPDATE ON integration_assistance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS (Row Level Security)

-- Activer RLS sur toutes les tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarship_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE scholarship_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_assistance ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour scholarships
CREATE POLICY "Anyone can view active scholarships" ON scholarships
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage scholarships" ON scholarships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour scholarship_favorites
CREATE POLICY "Users can manage own favorites" ON scholarship_favorites
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour scholarship_alerts
CREATE POLICY "Users can manage own alerts" ON scholarship_alerts
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour mentors
CREATE POLICY "Anyone can view approved mentors" ON mentors
    FOR SELECT USING (is_verified = true);

CREATE POLICY "Users can view own mentor profile" ON mentors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND user_profiles.id = mentors.user_id
        )
    );

CREATE POLICY "Users can manage own mentor profile" ON mentors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND user_profiles.id = mentors.user_id
        )
    );

-- Politiques pour mentoring_sessions
CREATE POLICY "Users can view own sessions" ON mentoring_sessions
    FOR SELECT USING (
        mentor_id IN (SELECT id FROM mentors WHERE user_id = auth.uid()) OR
        student_id = auth.uid()
    );

CREATE POLICY "Users can manage own sessions" ON mentoring_sessions
    FOR ALL USING (
        mentor_id IN (SELECT id FROM mentors WHERE user_id = auth.uid()) OR
        student_id = auth.uid()
    );

-- Politiques pour events
CREATE POLICY "Anyone can view active events" ON events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage own events" ON events
    FOR ALL USING (organizer_id = auth.uid());

CREATE POLICY "Admins can manage all events" ON events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour event_registrations
CREATE POLICY "Users can manage own registrations" ON event_registrations
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour forums
CREATE POLICY "Anyone can view approved forums" ON forums
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view own forums" ON forums
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create forums" ON forums
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own forums" ON forums
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Admins can manage all forums" ON forums
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour forum_posts
CREATE POLICY "Anyone can view published posts" ON forum_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Users can manage own posts" ON forum_posts
    FOR ALL USING (author_id = auth.uid());

-- Politiques pour job_alerts
CREATE POLICY "Users can manage own job alerts" ON job_alerts
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Mentors can view job alerts" ON job_alerts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM mentors 
            WHERE user_id = auth.uid()
        )
    );

-- Politiques pour ai_recommendations
CREATE POLICY "Users can view own recommendations" ON ai_recommendations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own recommendations" ON ai_recommendations
    FOR UPDATE USING (user_id = auth.uid());

-- Politiques pour payment_transactions
CREATE POLICY "Users can view own transactions" ON payment_transactions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all transactions" ON payment_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour feedback_ratings
CREATE POLICY "Users can view ratings" ON feedback_ratings
    FOR SELECT USING (
        student_id = auth.uid() OR
        mentor_id IN (SELECT id FROM mentors WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create ratings" ON feedback_ratings
    FOR INSERT WITH CHECK (student_id = auth.uid());

-- Politiques pour notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Politiques pour integration_assistance
CREATE POLICY "Users can manage own assistance requests" ON integration_assistance
    FOR ALL USING (user_id = auth.uid());

-- Données de test
INSERT INTO user_profiles (user_id, first_name, last_name, email, role, is_student, is_mentor, student_status, mentor_status, points, level, subscription_type, referral_code) VALUES
('00000000-0000-0000-0000-000000000001', 'Admin', 'Traillearn', 'admin@traillearn.com', 'admin', true, true, 'active', 'approved', 1000, 'platinum', 'premium', 'ADMIN-001'),
('00000000-0000-0000-0000-000000000002', 'Jean', 'Dupont', 'visitor1@traillearn.com', 'visitor', true, true, 'active', 'approved', 500, 'gold', 'pro', 'VISITOR-002'),
('00000000-0000-0000-0000-000000000003', 'Marie', 'Martin', 'mentor@traillearn.com', 'visitor', false, true, 'inactive', 'approved', 300, 'silver', 'plus', 'MENTOR-003'),
('00000000-0000-0000-0000-000000000004', 'Pierre', 'Durand', 'student@traillearn.com', 'visitor', true, false, 'active', 'inactive', 200, 'bronze', 'free', 'STUDENT-004'),
('00000000-0000-0000-0000-000000000005', 'Sophie', 'Leroy', 'visitor@traillearn.com', 'visitor', false, false, 'inactive', 'inactive', 100, 'bronze', 'free', 'VISITOR-005');

-- Données de test pour les mentors
INSERT INTO mentors (user_id, domains, languages, timezone, capacity_month, hourly_rate, currency, experience_years, education, bio, is_verified, rating, total_sessions) VALUES
('00000000-0000-0000-0000-000000000002', '{"Data Science", "Machine Learning", "Python"}', '{"French", "English"}', 'Europe/Paris', 15, 45.00, 'EUR', 5, 'Master en Data Science', 'Expert en data science avec 5 ans d''expérience', true, 4.8, 120),
('00000000-0000-0000-0000-000000000003', '{"Cybersecurity", "Network Security", "Ethical Hacking"}', '{"French", "English", "Spanish"}', 'Europe/Paris', 12, 50.00, 'EUR', 7, 'Master en Cybersécurité', 'Spécialiste en cybersécurité et sécurité des réseaux', true, 4.9, 150);

-- Données de test pour les bourses
INSERT INTO scholarships (title, description, amount, currency, country, level, fields_of_study, language_requirements, application_opening_date, application_deadline, university, program_type, duration_months, eligibility_criteria, application_process, documents_required, is_active, created_by) VALUES
('Bourse Excellence France', 'Bourse pour étudiants internationaux d''excellence', 10000.00, 'EUR', 'France', 'Master', '{"Informatique", "Ingénierie", "Business"}', '{"French", "English"}', '2024-01-01', '2024-12-31', 'Université de Paris', 'Master', 24, 'Diplôme de licence avec mention', 'Candidature en ligne + entretien', '{"Diplôme", "Relevés de notes", "Lettres de recommandation", "CV"}', true, '00000000-0000-0000-0000-000000000001'),
('Bourse Eiffel', 'Programme de bourses d''excellence du gouvernement français', 1181.00, 'EUR', 'France', 'Master', '{"Toutes disciplines"}', '{"French"}', '2024-10-01', '2025-01-15', 'Toutes universités françaises', 'Master/Doctorat', 12, 'Être âgé de moins de 30 ans', 'Candidature via Campus France', '{"Diplôme", "Relevés de notes", "Projet de recherche", "Lettres de recommandation"}', true, '00000000-0000-0000-0000-000000000001');

-- Données de test pour les événements
INSERT INTO events (title, description, category, type, start_date, end_date, timezone, location, country, is_online, max_participants, registration_deadline, price, currency, organizer_id, tags, is_active) VALUES
('Webinaire Data Science', 'Introduction aux concepts de data science', 'Formation', 'webinar', '2024-12-15 14:00:00', '2024-12-15 16:00:00', 'Europe/Paris', 'En ligne', 'France', true, 100, '2024-12-14 23:59:59', 0.00, 'EUR', '00000000-0000-0000-0000-000000000001', '{"Data Science", "Formation", "Gratuit"}', true),
('Bootcamp Cybersécurité', 'Formation intensive en cybersécurité', 'Formation', 'bootcamp', '2024-12-20 09:00:00', '2024-12-22 18:00:00', 'Europe/Paris', 'Paris, France', 'France', false, 25, '2024-12-18 23:59:59', 299.00, 'EUR', '00000000-0000-0000-0000-000000000001', '{"Cybersécurité", "Bootcamp", "Formation"}', true);