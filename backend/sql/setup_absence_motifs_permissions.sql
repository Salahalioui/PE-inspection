-- Enable row level security
ALTER TABLE absence_motifs ENABLE ROW LEVEL SECURITY;

-- Add index for faster sorting on motif_label_fr
CREATE INDEX IF NOT EXISTS idx_absence_motifs_label_fr ON absence_motifs USING btree(motif_label_fr);

-- Create policy to allow anyone to read absence motifs
CREATE POLICY "Allow public read access for absence motifs"
ON absence_motifs
FOR SELECT
TO public
USING (true);

-- Grant SELECT permissions to authenticated and anonymous users
GRANT SELECT ON absence_motifs TO anon, authenticated;

-- Verify the table contents and permissions
SELECT * FROM absence_motifs ORDER BY motif_label_fr;
