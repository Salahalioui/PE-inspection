-- Create the absence_motifs table if it doesn't exist
CREATE TABLE IF NOT EXISTS absence_motifs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    motif_label_fr TEXT NOT NULL,
    motif_label_ar TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common absence motifs in French and Arabic if they don't exist
INSERT INTO absence_motifs (id, motif_label_fr, motif_label_ar, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'Maladie', 'مرض', NOW(), NOW()),
    (gen_random_uuid(), 'Formation professionnelle', 'تكوين مهني', NOW(), NOW()),
    (gen_random_uuid(), 'Congé administratif', 'عطلة إدارية', NOW(), NOW()),
    (gen_random_uuid(), 'Urgence familiale', 'طارئ عائلي', NOW(), NOW()),
    (gen_random_uuid(), 'Congé maternité', 'إجازة أمومة', NOW(), NOW()),
    (gen_random_uuid(), 'Rendez-vous médical', 'موعد طبي', NOW(), NOW()),
    (gen_random_uuid(), 'Mission officielle', 'مهمة رسمية', NOW(), NOW()),
    (gen_random_uuid(), 'Congé annuel', 'عطلة سنوية', NOW(), NOW()),
    (gen_random_uuid(), 'Congé exceptionnel', 'عطلة استثنائية', NOW(), NOW()),
    (gen_random_uuid(), 'Autre', 'آخر', NOW(), NOW());
