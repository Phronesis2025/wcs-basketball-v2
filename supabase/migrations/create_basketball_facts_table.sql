-- Create basketball_facts table
CREATE TABLE IF NOT EXISTS basketball_facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emoji TEXT NOT NULL,
  fact_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all 15 basketball facts (numbers removed from emojis)
INSERT INTO basketball_facts (emoji, fact_text) VALUES
('🏀', 'The first basketball game used a soccer ball. When James Naismith invented basketball in 1891, there were no basketballs — so players used a soccer ball instead!'),
('🧺', 'The "basket" was a real peach basket. The first hoops were actual peach baskets nailed to a gym balcony. Someone had to climb up and retrieve the ball every time someone scored.'),
('🕳️', 'The baskets had no holes at first. Unlike today''s hoops, early baskets didn''t have holes in the bottom — so every made shot was followed by a short pause to fish out the ball.'),
('🏫', 'Basketball was invented at a YMCA. James Naismith came up with basketball in December 1891 at the YMCA Training School in Springfield, Massachusetts, to keep students active indoors during winter.'),
('👟', 'Players couldn''t dribble at first. In the earliest games, players had to pass to move the ball — no dribbling! The first dribble didn''t appear until years later.'),
('🧾', 'The first game had nine players per team. Naismith divided his 18 students into two teams of nine, not five like today.'),
('🧮', 'The first game''s score was 1–0. The first-ever basketball game ended with a single basket — one team scored once, and that was it!'),
('🚫', 'There were no backboards. Originally, baskets were just nailed to walls. Backboards were added later to stop fans in the balconies from interfering.'),
('🎩', 'Slam dunks were banned for nearly a decade. From 1967 to 1976, the NCAA banned dunking because officials thought it was too dangerous — or gave tall players an unfair advantage.'),
('🐐', 'The first NBA backboard was made of wire. Before glass, early backboards were made of chicken wire — not great for visibility or bounce!'),
('💨', 'The shot clock changed everything. Before the 24-second shot clock in 1954, teams would sometimes just hold the ball for minutes at a time to protect a lead.'),
('📻', 'The first televised basketball game was in 1939. Columbia faced Princeton in a college game broadcast in New York City — and only a few hundred TVs existed at the time!'),
('🏆', 'The NBA wasn''t always called the NBA. It started as the Basketball Association of America (BAA) in 1946, and later merged with the National Basketball League (NBL) to form the NBA in 1949.'),
('🌍', 'Basketball is now played in over 200 countries. What started in one gym in Massachusetts is now one of the most popular sports on Earth.'),
('🎯', 'The three-point line didn''t exist until 1979. Before that, every shot — no matter how far away — was worth only two points!')
ON CONFLICT DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_basketball_facts_updated_at ON basketball_facts;
CREATE TRIGGER update_basketball_facts_updated_at
  BEFORE UPDATE ON basketball_facts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

