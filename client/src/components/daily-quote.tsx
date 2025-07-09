import { Quote, Zap } from "lucide-react";
import { useState, useEffect } from "react";

const MOTIVATIONAL_QUOTES = [
  {
    text: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu"
  },
  {
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph Waldo Emerson"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  },
  {
    text: "Your limitation—it's only your imagination.",
    author: "Unknown"
  },
  {
    text: "Progress, not perfection, is the goal.",
    author: "Unknown"
  },
  {
    text: "The cave you fear to enter holds the treasure you seek.",
    author: "Joseph Campbell"
  },
  {
    text: "You are not a drop in the ocean, but the entire ocean in each drop.",
    author: "Rumi"
  },
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha"
  },
  {
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein"
  },
  {
    text: "The only person you are destined to become is the person you decide to be.",
    author: "Ralph Waldo Emerson"
  },
  {
    text: "Change your thoughts and you change your world.",
    author: "Norman Vincent Peale"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    text: "The greatest revolution of our generation is the discovery that human beings, by changing the inner attitudes of their minds, can change the outer aspects of their lives.",
    author: "William James"
  },
  {
    text: "You have been assigned this mountain to show others it can be moved.",
    author: "Mel Robbins"
  },
  {
    text: "The wound is the place where the Light enters you.",
    author: "Rumi"
  },
  {
    text: "What you seek is seeking you.",
    author: "Rumi"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb"
  },
  {
    text: "Your authentic self is who you are when you have nothing left to lose.",
    author: "Unknown"
  },
  {
    text: "Life isn't about finding yourself. Life is about creating yourself.",
    author: "George Bernard Shaw"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    text: "Don't let yesterday take up too much of today.",
    author: "Will Rogers"
  },
  {
    text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
    author: "Unknown"
  },
  {
    text: "If you want to lift yourself up, lift up someone else.",
    author: "Booker T. Washington"
  },
  {
    text: "The purpose of our lives is to be happy.",
    author: "Dalai Lama"
  },
  {
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "Strive not to be a success, but rather to be of value.",
    author: "Albert Einstein"
  },
  {
    text: "Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.",
    author: "Robert Frost"
  },
  {
    text: "You miss 100% of the shots you don't take.",
    author: "Wayne Gretzky"
  },
  {
    text: "I have learned throughout my life as a composer chiefly through my mistakes and pursuits of false assumptions, not by my exposure to founts of wisdom and knowledge.",
    author: "Igor Stravinsky"
  },
  {
    text: "The most difficult thing is the decision to act, the rest is merely tenacity.",
    author: "Amelia Earhart"
  },
  {
    text: "Every strike brings me closer to the next home run.",
    author: "Babe Ruth"
  },
  {
    text: "Life is never fair, and perhaps it is a good thing for most of us that it is not.",
    author: "Oscar Wilde"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins"
  },
  {
    text: "In this life we cannot do great things. We can only do small things with great love.",
    author: "Mother Teresa"
  },
  {
    text: "Only a life lived for others is a life worthwhile.",
    author: "Albert Einstein"
  },
  {
    text: "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate, to have it make some difference that you have lived and lived well.",
    author: "Ralph Waldo Emerson"
  },
  {
    text: "Use what talents you possess: the woods would be very silent if no birds sang there except those that sang best.",
    author: "Henry Van Dyke"
  },
  {
    text: "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.",
    author: "Helen Keller"
  },
  {
    text: "It is not in the stars to hold our destiny but in ourselves.",
    author: "William Shakespeare"
  },
  {
    text: "Go confidently in the direction of your dreams. Live the life you have imagined.",
    author: "Henry David Thoreau"
  },
  {
    text: "When I was 5 years old, my mother always told me that happiness was the key to life. When I went to school, they asked me what I wanted to be when I grew up. I wrote down 'happy'. They told me I didn't understand the assignment, and I told them they didn't understand life.",
    author: "John Lennon"
  },
  {
    text: "Fall seven times and stand up eight.",
    author: "Japanese Proverb"
  },
  {
    text: "Everything has beauty, but not everyone can see.",
    author: "Confucius"
  },
  {
    text: "How wonderful it is that nobody need wait a single moment before starting to improve the world.",
    author: "Anne Frank"
  },
  {
    text: "When I let go of what I am, I become what I might be.",
    author: "Lao Tzu"
  },
  {
    text: "Life is really simple, but we insist on making it complicated.",
    author: "Confucius"
  },
  {
    text: "May you live all the days of your life.",
    author: "Jonathan Swift"
  },
  {
    text: "Life itself is the most wonderful fairy tale.",
    author: "Hans Christian Andersen"
  },
  {
    text: "Do not go where the path may lead, go instead where there is no path and leave a trail.",
    author: "Ralph Waldo Emerson"
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis"
  },
  {
    text: "If you look at what you have in life, you'll always have more.",
    author: "Oprah Winfrey"
  },
  {
    text: "If you want your children to turn out well, spend twice as much time with them, and half as much money.",
    author: "Abigail Van Buren"
  },
  {
    text: "Build your own dreams, or someone else will hire you to build theirs.",
    author: "Farrah Gray"
  },
  {
    text: "The battles that count aren't the ones for gold medals. The struggles within yourself–the invisible battles inside all of us–that's where it's at.",
    author: "Jesse Owens"
  },
  {
    text: "Education costs money. But then so does ignorance.",
    author: "Sir Claus Moser"
  },
  {
    text: "I have learned over the years that when one's mind is made up, this diminishes fear.",
    author: "Rosa Parks"
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius"
  },
  {
    text: "If you want to lift yourself up, lift up someone else.",
    author: "Booker T. Washington"
  },
  {
    text: "I can't change the direction of the wind, but I can adjust my sails to always reach my destination.",
    author: "Jimmy Dean"
  },
  {
    text: "If you don't like something, change it. If you can't change it, change your attitude.",
    author: "Maya Angelou"
  },
  {
    text: "You must be the change you wish to see in the world.",
    author: "Mahatma Gandhi"
  },
  {
    text: "You will face many defeats in life, but never let yourself be defeated.",
    author: "Maya Angelou"
  },
  {
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela"
  },
  {
    text: "In the end, we will remember not the words of our enemies, but the silence of our friends.",
    author: "Martin Luther King Jr."
  },
  {
    text: "The greatest wealth is to live content with little.",
    author: "Plato"
  },
  {
    text: "It is better to fail in originality than to succeed in imitation.",
    author: "Herman Melville"
  },
  {
    text: "The road to success and the road to failure are almost exactly the same.",
    author: "Colin R. Davis"
  },
  {
    text: "Success is not final; failure is not fatal: It is the courage to continue that counts.",
    author: "Winston S. Churchill"
  },
  {
    text: "The only way to achieve the impossible is to believe it is possible.",
    author: "Charles Kingsleigh"
  }
];

const XP_RULES = [
  {
    text: "Each journal entry grants you 10 XP... but deeper reflections yield hidden bonuses.",
    mysticalHint: "The Ancient Wisdom"
  },
  {
    text: "Write for 3 consecutive days to unlock the streak multiplier... XP flows like a river.",
    mysticalHint: "The Secret of Momentum"
  },
  {
    text: "Every 7 days of journaling unlocks new symbols... ancient knowledge awaits.",
    mysticalHint: "The Ritual of Seven"
  },
  {
    text: "Pin your most important entries... they hold power beyond mere words.",
    mysticalHint: "The Keeper's Mark"
  },
  {
    text: "Tag your entries with intention... patterns reveal themselves to those who seek.",
    mysticalHint: "The Art of Naming"
  },
  {
    text: "Your mood shapes your path... acknowledge it to gain deeper insights.",
    mysticalHint: "The Mirror of Self"
  },
  {
    text: "Weekly reflections unlock at Level 2... the mind's eye begins to open.",
    mysticalHint: "The Vision Quest"
  },
  {
    text: "Monthly insights await at Level 3... the bigger picture emerges.",
    mysticalHint: "The Great Cycle"
  },
  {
    text: "Level 5 unlocks the goal system... your true purpose becomes clear.",
    mysticalHint: "The Path Reveals Itself"
  },
  {
    text: "Complete daily challenges for bonus XP... small actions, great rewards.",
    mysticalHint: "The Sacred Tasks"
  }
];

function getDailyQuote() {
  // Get today's date and use it as a seed for consistent daily quote
  const today = new Date();
  const dateString = today.toDateString(); // "Wed Oct 05 2023" format
  
  // Create a simple hash from the date string
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use the hash to select a quote (ensure positive index)
  const index = Math.abs(hash) % MOTIVATIONAL_QUOTES.length;
  return MOTIVATIONAL_QUOTES[index];
}

export function DailyQuote() {
  const quote = getDailyQuote();
  const [showingRule, setShowingRule] = useState(false);
  const [currentRule, setCurrentRule] = useState<any>(null);

  useEffect(() => {
    // Randomly show XP rules every 15-30 seconds
    const interval = setInterval(() => {
      // 15% chance to show a rule
      if (Math.random() < 0.15) {
        const randomRule = XP_RULES[Math.floor(Math.random() * XP_RULES.length)];
        setCurrentRule(randomRule);
        setShowingRule(true);
        
        // Show for 4 seconds, then fade back
        setTimeout(() => {
          setShowingRule(false);
        }, 4000);
      }
    }, Math.random() * 15000 + 15000); // 15-30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md bg-white/20 dark:bg-gray-900/40">
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg text-white flex-shrink-0 transition-all duration-1000 ${
          showingRule 
            ? 'bg-gradient-to-br from-yellow-500 to-orange-600' 
            : 'bg-gradient-to-br from-purple-500 to-indigo-600'
        }`}>
          {showingRule ? <Zap className="w-5 h-5" /> : <Quote className="w-5 h-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`text-lg font-semibold mb-3 drop-shadow-sm transition-all duration-1000 ${
            showingRule 
              ? 'text-yellow-800 dark:text-yellow-200' 
              : 'text-gray-900 dark:text-white'
          }`}>
            {showingRule ? currentRule?.mysticalHint : "Daily Inspiration"}
          </h3>
          <blockquote className={`italic text-base leading-relaxed mb-3 drop-shadow-sm transition-all duration-1000 ${
            showingRule 
              ? 'text-yellow-700 dark:text-yellow-300' 
              : 'text-gray-800 dark:text-gray-200'
          }`}>
            "{showingRule ? currentRule?.text : quote.text}"
          </blockquote>
          <cite className={`text-sm font-medium drop-shadow-sm transition-all duration-1000 ${
            showingRule 
              ? 'text-yellow-600 dark:text-yellow-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            — {showingRule ? "The Path Keeper" : quote.author}
          </cite>
        </div>
      </div>
    </div>
  );
}