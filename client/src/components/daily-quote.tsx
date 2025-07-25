
import { Quote, Zap } from "lucide-react";
import { useState, useEffect } from "react";

const MOTIVATIONAL_QUOTES = [
  // Stoic Philosophy
  { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "The best revenge is not to be like your enemy.", author: "Marcus Aurelius" },
  { text: "Wealth consists in not having great possessions, but in having few wants.", author: "Epictetus" },
  { text: "It's not what happens to you, but how you react to it that matters.", author: "Epictetus" },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
  { text: "Every new beginning comes from some other beginning's end.", author: "Seneca" },
  { text: "You are an actor in a play, which is as the author wants it to be.", author: "Epictetus" },
  { text: "The happiness of your life depends upon the quality of your thoughts.", author: "Marcus Aurelius" },
  { text: "Man is disturbed not by things, but by the views he takes of them.", author: "Epictetus" },
  { text: "Life is long enough if you know how to use it.", author: "Seneca" },
  
  // Presidents & Political Leaders
  { text: "The only thing we have to fear is fear itself.", author: "Franklin D. Roosevelt" },
  { text: "Ask not what your country can do for you; ask what you can do for your country.", author: "John F. Kennedy" },
  { text: "Nearly all men can stand adversity, but if you want to test a man's character, give him power.", author: "Abraham Lincoln" },
  { text: "The best way to predict your future is to create it.", author: "Abraham Lincoln" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "The ultimate measure of a man is not where he stands in moments of comfort, but where he stands at times of challenge.", author: "Martin Luther King Jr." },
  { text: "Change will not come if we wait for some other person or some other time.", author: "Barack Obama" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "If you want to go fast, go alone. If you want to go far, go together.", author: "African Proverb" },
  
  // Leonardo da Vinci & Renaissance Geniuses
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Obstacles cannot crush me; every obstacle yields to stern resolve.", author: "Leonardo da Vinci" },
  { text: "I have been impressed with the urgency of doing. Knowing is not enough; we must apply.", author: "Leonardo da Vinci" },
  { text: "As a well-spent day brings happy sleep, so a life well spent brings happy death.", author: "Leonardo da Vinci" },
  { text: "The noblest pleasure is the joy of understanding.", author: "Leonardo da Vinci" },
  { text: "Time stays long enough for anyone who will use it.", author: "Leonardo da Vinci" },
  { text: "Where the spirit does not work with the hand, there is no art.", author: "Leonardo da Vinci" },
  { text: "Poor is the pupil who does not surpass his master.", author: "Leonardo da Vinci" },
  { text: "Iron rusts from disuse; water loses its purity from stagnation; so does inaction sap the vigor of the mind.", author: "Leonardo da Vinci" },
  
  // Henry Ford & Industrial Pioneers
  { text: "Whether you think you can or you think you can't, you're right.", author: "Henry Ford" },
  { text: "Failure is simply the opportunity to begin again, this time more intelligently.", author: "Henry Ford" },
  { text: "Coming together is a beginning; keeping together is progress; working together is success.", author: "Henry Ford" },
  { text: "Quality means doing it right when no one is looking.", author: "Henry Ford" },
  { text: "If everyone is moving forward together, then success takes care of itself.", author: "Henry Ford" },
  { text: "The only real mistake is the one from which we learn nothing.", author: "Henry Ford" },
  { text: "Don't find fault, find a remedy.", author: "Henry Ford" },
  { text: "Anyone who stops learning is old, whether at twenty or eighty.", author: "Henry Ford" },
  { text: "Obstacles are those frightful things you see when you take your eyes off your goal.", author: "Henry Ford" },
  { text: "If you always do what you've always done, you'll always get what you've always got.", author: "Henry Ford" },
  
  // Einstein & Scientific Minds
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein" },
  { text: "The important thing is not to stop questioning.", author: "Albert Einstein" },
  { text: "Try not to become a person of success, but rather try to become a person of value.", author: "Albert Einstein" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Life is like riding a bicycle. To keep your balance, you must keep moving.", author: "Albert Einstein" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein" },
  { text: "Logic will get you from A to B. Imagination will take you everywhere.", author: "Albert Einstein" },
  { text: "The only source of knowledge is experience.", author: "Albert Einstein" },
  { text: "Education is what remains after one has forgotten what one has learned in school.", author: "Albert Einstein" },
  { text: "Great spirits have always encountered violent opposition from mediocre minds.", author: "Albert Einstein" },
  
  // Ancient Wisdom & Philosophy
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "When I let go of what I am, I become what I might be.", author: "Lao Tzu" },
  { text: "Do the difficult things while they are easy and do the great things while they are small.", author: "Lao Tzu" },
  { text: "A leader is best when people barely know he exists.", author: "Lao Tzu" },
  { text: "At the center of your being you have the answer; you know who you are and you know what you want.", author: "Lao Tzu" },
  { text: "The wise find pleasure in water; the virtuous find pleasure in hills.", author: "Confucius" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Our greatest glory is not in never falling, but in rising every time we fall.", author: "Confucius" },
  { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" },
  { text: "Everything has beauty, but not everyone sees it.", author: "Confucius" },
  
  // Modern Success & Achievement
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The people in the crazy ones, the misfits, the rebels, the troublemakers, the round pegs in the square holes are the ones who change the world.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "We make a living by what we get, but we make a life by what we give.", author: "Winston Churchill" },
  { text: "The empires of the future are the empires of the mind.", author: "Winston Churchill" },
  { text: "Kites rise highest against the wind, not with it.", author: "Winston Churchill" },
  { text: "Attitude is a little thing that makes a big difference.", author: "Winston Churchill" },
  
  // Personal Development & Growth
  { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { text: "I can resist everything except temptation.", author: "Oscar Wilde" },
  { text: "We are all in the gutter, but some of us are looking at the stars.", author: "Oscar Wilde" },
  { text: "Experience is merely the name men gave to their mistakes.", author: "Oscar Wilde" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { text: "What we plant in the soil of contemplation, we shall reap in the harvest of action.", author: "Meister Eckhart" },
  { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment.", author: "Ralph Waldo Emerson" },
  { text: "Nothing great was ever achieved without enthusiasm.", author: "Ralph Waldo Emerson" },
  
  // Spiritual & Mystical Wisdom
  { text: "What you seek is seeking you.", author: "Rumi" },
  { text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.", author: "Rumi" },
  { text: "The wound is the place where the Light enters you.", author: "Rumi" },
  { text: "Let yourself be silently drawn by the strange pull of what you really love.", author: "Rumi" },
  { text: "Don't be satisfied with stories, how things have gone with others. Unfold your own myth.", author: "Rumi" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Three things cannot be long hidden: the sun, the moon, and the truth.", author: "Buddha" },
  { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha" },
  { text: "Health is the greatest gift, contentment the greatest wealth, faithfulness the best relationship.", author: "Buddha" },
  { text: "Thousands of candles can be lighted from a single candle, and the life of the candle will not be shortened.", author: "Buddha" },
  
  // Creative & Artistic Minds
  { text: "Creativity takes courage.", author: "Henri Matisse" },
  { text: "I dream my painting and I paint my dream.", author: "Vincent van Gogh" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent van Gogh" },
  { text: "What is done in love is done well.", author: "Vincent van Gogh" },
  { text: "I would rather die of passion than of boredom.", author: "Vincent van Gogh" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "All our dreams can come true, if we have the courage to pursue them.", author: "Walt Disney" },
  { text: "It's kind of fun to do the impossible.", author: "Walt Disney" },
  { text: "The difference between winning and losing is most often not quitting.", author: "Walt Disney" },
  { text: "If you can dream it, you can do it.", author: "Walt Disney" },
  
  // Women Leaders & Pioneers
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "No one can make you feel inferior without your consent.", author: "Eleanor Roosevelt" },
  { text: "You must do the things you think you cannot do.", author: "Eleanor Roosevelt" },
  { text: "Great minds discuss ideas; average minds discuss events; small minds discuss people.", author: "Eleanor Roosevelt" },
  { text: "A woman is like a tea bag; you never know how strong it is until it's in hot water.", author: "Eleanor Roosevelt" },
  { text: "The most difficult thing is the decision to act, the rest is merely tenacity.", author: "Amelia Earhart" },
  { text: "Adventure is worthwhile in itself.", author: "Amelia Earhart" },
  { text: "Courage is the price that life exacts for granting peace.", author: "Amelia Earhart" },
  { text: "Please know that I am aware of the hazards. I want to do it because I want to do it.", author: "Amelia Earhart" },
  { text: "The most effective way to do it, is to do it.", author: "Amelia Earhart" },
  
  // Athletes & Competitors
  { text: "Champions aren't made in the gyms. Champions are made from something deep inside them: a desire, a dream, a vision.", author: "Muhammad Ali" },
  { text: "Float like a butterfly, sting like a bee.", author: "Muhammad Ali" },
  { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
  { text: "Impossible is just an opinion.", author: "Muhammad Ali" },
  { text: "Service to others is the rent you pay for your room here on earth.", author: "Muhammad Ali" },
  { text: "I've missed more than 9000 shots in my career. I've lost almost 300 games.", author: "Michael Jordan" },
  { text: "Talent wins games, but teamwork and intelligence wins championships.", author: "Michael Jordan" },
  { text: "Some people want it to happen, some wish it would happen, others make it happen.", author: "Michael Jordan" },
  { text: "I can accept failure, everyone fails at something. But I can't accept not trying.", author: "Michael Jordan" },
  { text: "Limits, like fear, is often an illusion.", author: "Michael Jordan" },
  
  // Modern Entrepreneurs & Innovators
  { text: "Your most unhappy customers are your greatest source of learning.", author: "Bill Gates" },
  { text: "We always overestimate the change that will occur in the next two years and underestimate the change that will occur in the next ten.", author: "Bill Gates" },
  { text: "Success is a lousy teacher. It seduces smart people into thinking they can't lose.", author: "Bill Gates" },
  { text: "As we look ahead into the next century, leaders will be those who empower others.", author: "Bill Gates" },
  { text: "Don't compare yourself with anyone in this world. If you do so, you are insulting yourself.", author: "Bill Gates" },
  { text: "The first rule of any technology used in a business is that automation applied to an efficient operation will magnify the efficiency.", author: "Bill Gates" },
  { text: "When you have money in hand, only you forget who are you. But when you do not have any money in your hand, the whole world forget who you are.", author: "Bill Gates" },
  { text: "If you are born poor it's not your mistake, but if you die poor it's your mistake.", author: "Bill Gates" },
  { text: "Patience is a key element of success.", author: "Bill Gates" },
  { text: "I believe that if you show people the problems and then show them the solutions, they will be moved to act.", author: "Bill Gates" },
  
  // Classical Literature & Wisdom
  { text: "To be, or not to be, that is the question.", author: "William Shakespeare" },
  { text: "All the world's a stage, and all the men and women merely players.", author: "William Shakespeare" },
  { text: "This above all: to thine own self be true.", author: "William Shakespeare" },
  { text: "We know what we are, but know not what we may be.", author: "William Shakespeare" },
  { text: "There is nothing either good or bad, but thinking makes it so.", author: "William Shakespeare" },
  { text: "It is not in the stars to hold our destiny but in ourselves.", author: "William Shakespeare" },
  { text: "Better three hours too soon than a minute too late.", author: "William Shakespeare" },
  { text: "No legacy is so rich as honesty.", author: "William Shakespeare" },
  { text: "Love all, trust a few, do wrong to none.", author: "William Shakespeare" },
  { text: "The course of true love never did run smooth.", author: "William Shakespeare" },
  
  // Self-Improvement & Psychology
  { text: "The curious paradox is that when I accept myself just as I am, then I can change.", author: "Carl Rogers" },
  { text: "Everything that irritates us about others can lead us to an understanding of ourselves.", author: "Carl Jung" },
  { text: "Who looks outside, dreams; who looks inside, awakes.", author: "Carl Jung" },
  { text: "Your vision becomes clear when you look into your heart. Who looks outside, dreams. Who looks inside, awakens.", author: "Carl Jung" },
  { text: "The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed.", author: "Carl Jung" },
  { text: "I am not what happened to me, I am what I choose to become.", author: "Carl Jung" },
  { text: "Until you make the unconscious conscious, it will direct your life and you will call it fate.", author: "Carl Jung" },
  { text: "Knowing your own darkness is the best method for dealing with the darknesses of other people.", author: "Carl Jung" },
  { text: "The privilege of a lifetime is to become who you truly are.", author: "Carl Jung" },
  { text: "Thinking is difficult, that's why most people judge.", author: "Carl Jung" },
  
  // Social Justice & Human Rights
  { text: "Injustice anywhere is a threat to justice everywhere.", author: "Martin Luther King Jr." },
  { text: "The time is always right to do what is right.", author: "Martin Luther King Jr." },
  { text: "Darkness cannot drive out darkness; only light can do that.", author: "Martin Luther King Jr." },
  { text: "Faith is taking the first step even when you don't see the whole staircase.", author: "Martin Luther King Jr." },
  { text: "Life's most persistent and urgent question is: What are you doing for others?", author: "Martin Luther King Jr." },
  { text: "If you can't fly then run, if you can't run then walk, if you can't walk then crawl, but whatever you do you have to keep moving forward.", author: "Martin Luther King Jr." },
  { text: "Intelligence plus character—that is the goal of true education.", author: "Martin Luther King Jr." },
  { text: "The ultimate measure of a man is not where he stands in moments of comfort and convenience, but where he stands at times of challenge and controversy.", author: "Martin Luther King Jr." },
  { text: "We must accept finite disappointment, but never lose infinite hope.", author: "Martin Luther King Jr." },
  { text: "Love is the only force capable of transforming an enemy into a friend.", author: "Martin Luther King Jr." },
  
  // Adventure & Exploration
  { text: "The secret to getting ahead is getting started.", author: "Mark Twain" },
  { text: "Kindness is the language which the deaf can hear and the blind can see.", author: "Mark Twain" },
  { text: "The two most important days in your life are the day you are born and the day you find out why.", author: "Mark Twain" },
  { text: "Courage is resistance to fear, mastery of fear—not absence of fear.", author: "Mark Twain" },
  { text: "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do.", author: "Mark Twain" },
  { text: "Don't go around saying the world owes you a living. The world owes you nothing. It was here first.", author: "Mark Twain" },
  { text: "Good friends, good books, and a sleepy conscience: this is the ideal life.", author: "Mark Twain" },
  { text: "The best way to cheer yourself is to try to cheer someone else up.", author: "Mark Twain" },
  { text: "Age is an issue of mind over matter. If you don't mind, it doesn't matter.", author: "Mark Twain" },
  { text: "Give every day the chance to become the most beautiful day of your life.", author: "Mark Twain" },
  
  // Science & Discovery
  { text: "The important thing is not to stop questioning. Curiosity has its own reason for existence.", author: "Albert Einstein" },
  { text: "Science without religion is lame, religion without science is blind.", author: "Albert Einstein" },
  { text: "Reality is merely an illusion, albeit a very persistent one.", author: "Albert Einstein" },
  { text: "I have no special talent. I am only passionately curious.", author: "Albert Einstein" },
  { text: "Peace cannot be kept by force; it can only be achieved by understanding.", author: "Albert Einstein" },
  { text: "If you want to live a happy life, tie it to a goal, not to people or things.", author: "Albert Einstein" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "The world as we have created it is a process of our thinking.", author: "Albert Einstein" },
  { text: "We cannot solve our problems with the same thinking we used when we created them.", author: "Albert Einstein" },
  { text: "The measure of intelligence is the ability to change.", author: "Albert Einstein" },
  
  // Business & Leadership
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Leadership is not about titles, positions or flowcharts. It is about one life influencing another.", author: "John C. Maxwell" },
  { text: "A leader is one who knows the way, goes the way, and shows the way.", author: "John C. Maxwell" },
  { text: "The pessimist sees difficulty in every opportunity. The optimist sees opportunity in every difficulty.", author: "Winston Churchill" },
  { text: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
  { text: "If you're going through hell, keep going.", author: "Winston Churchill" },
  { text: "Continuous effort—not strength or intelligence—is the key to unlocking our potential.", author: "Winston Churchill" },
  { text: "The price of greatness is responsibility.", author: "Winston Churchill" },
  { text: "Success consists of going from failure to failure without loss of enthusiasm.", author: "Winston Churchill" },
  { text: "We shape our tools; thereafter they shape us.", author: "Winston Churchill" },
  
  // Modern Wisdom & Technology
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Chinese Proverb" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { text: "When the winds of change blow, some people build walls and others build windmills.", author: "Chinese Proverb" },
  { text: "The best revenge is massive success.", author: "Frank Sinatra" },
  { text: "Life isn't about finding yourself. Life is about creating yourself.", author: "George Bernard Shaw" },
  { text: "Progress is impossible without change, and those who cannot change their minds cannot change anything.", author: "George Bernard Shaw" },
  { text: "You see things; and you say 'Why?' But I dream things that never were; and I say 'Why not?'", author: "George Bernard Shaw" },
  { text: "A life spent making mistakes is not only more honorable, but more useful than a life spent doing nothing.", author: "George Bernard Shaw" },
  { text: "We don't stop playing because we grow old; we grow old because we stop playing.", author: "George Bernard Shaw" },
  
  // Resilience & Perseverance
  { text: "Fall seven times and stand up eight.", author: "Japanese Proverb" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The phoenix must burn to emerge.", author: "Janet Fitch" },
  { text: "Rock bottom became the solid foundation on which I rebuilt my life.", author: "J.K. Rowling" },
  { text: "It is impossible to live without failing at something, unless you live so cautiously that you might as well not have lived at all.", author: "J.K. Rowling" },
  { text: "We do not need magic to change the world, we carry all the power we need inside ourselves already.", author: "J.K. Rowling" },
  { text: "Happiness can be found, even in the darkest of times, if one only remembers to turn on the light.", author: "J.K. Rowling" },
  { text: "It matters not what someone is born, but what they grow to be.", author: "J.K. Rowling" },
  { text: "Words are, in my not-so-humble opinion, our most inexhaustible source of magic.", author: "J.K. Rowling" },
  
  // Mindfulness & Present Moment
  { text: "Yesterday is history, tomorrow is a mystery, today is a gift of God, which is why we call it the present.", author: "Bill Keane" },
  { text: "The present moment is the only time over which we have dominion.", author: "Thich Nhat Hanh" },
  { text: "Wherever you are, be there totally.", author: "Eckhart Tolle" },
  { text: "Life is available only in the present moment.", author: "Thich Nhat Hanh" },
  { text: "The power of now can only be realized now. It requires no time and effort. Effort means you're trying hard to get somewhere, and so you are not present.", author: "Eckhart Tolle" },
  { text: "Realize deeply that the present moment is all you have. Make the NOW the primary focus of your life.", author: "Eckhart Tolle" },
  { text: "Some changes look negative on the surface but you will soon realize that space is being created in your life for something new to emerge.", author: "Eckhart Tolle" },
  { text: "The primary cause of unhappiness is never the situation but your thoughts about it.", author: "Eckhart Tolle" },
  { text: "Life will give you whatever experience is most helpful for the evolution of your consciousness.", author: "Eckhart Tolle" },
  { text: "Accept—then act. Whatever the present moment contains, accept it as if you had chosen it.", author: "Eckhart Tolle" },
  
  // Innovation & Creativity
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Think different.", author: "Steve Jobs" },
  { text: "The people in the crazy ones, the misfits, the rebels, the troublemakers, the round pegs in the square holes... the ones who see things differently—they're not fond of rules.", author: "Steve Jobs" },
  { text: "Sometimes life hits you in the head with a brick. Don't lose faith.", author: "Steve Jobs" },
  { text: "I'm convinced that about half of what separates successful entrepreneurs from the non-successful ones is pure perseverance.", author: "Steve Jobs" },
  { text: "Details are not details. They make the design.", author: "Charles Eames" },
  { text: "Creativity is intelligence having fun.", author: "Albert Einstein" },
  { text: "The secret to creativity is knowing how to hide your sources.", author: "Einstein (attributed)" },
  { text: "Genius is one percent inspiration and ninety-nine percent perspiration.", author: "Thomas Edison" },
  { text: "I have not failed. I've just found 10,000 ways that won't work.", author: "Thomas Edison" },
  
  // Final Inspirational Messages
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "What we plant in the soil of contemplation, we shall reap in the harvest of action.", author: "Meister Eckhart" },
  { text: "Your limitation—it's only your imagination.", author: "Unknown" },
  { text: "Great things never come from comfort zones.", author: "Unknown" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown" },
  { text: "Success doesn't just find you. You have to go out and get it.", author: "Unknown" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown" },
  { text: "Dream bigger. Do bigger.", author: "Unknown" },
  { text: "Don't stop when you're tired. Stop when you're done.", author: "Unknown" },
  { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
  { text: "Do something today that your future self will thank you for.", author: "Unknown" },
  { text: "Little things make big days.", author: "Unknown" },
  { text: "It's going to be hard, but hard does not mean impossible.", author: "Unknown" },
  { text: "Don't wait for opportunity. Create it.", author: "Unknown" }
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
        
        // Show for 7 seconds, then fade back
        setTimeout(() => {
          setShowingRule(false);
        }, 7000);
      }
    }, Math.random() * 15000 + 15000); // 15-30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md bg-white/20 dark:bg-gray-900/40">
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-lg text-white flex-shrink-0 transition-all duration-1000 ease-in-out transform ${
          showingRule 
            ? 'bg-gradient-to-br from-yellow-500 to-orange-600 scale-110 shadow-lg' 
            : 'bg-gradient-to-br from-purple-500 to-indigo-600 scale-100'
        }`}>
          {showingRule ? <Zap className="w-5 h-5" /> : <Quote className="w-5 h-5" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`text-lg font-semibold mb-3 drop-shadow-sm transition-all duration-1000 ease-in-out ${
            showingRule 
              ? 'text-yellow-800 dark:text-yellow-200 transform scale-105' 
              : 'text-gray-900 dark:text-white transform scale-100'
          }`}>
            {showingRule ? currentRule?.mysticalHint : "Daily Inspiration"}
          </h3>
          <blockquote className={`italic text-base leading-relaxed mb-3 drop-shadow-sm transition-all duration-1000 ease-in-out ${
            showingRule 
              ? 'text-yellow-700 dark:text-yellow-300' 
              : 'text-gray-800 dark:text-gray-200'
          }`}>
            "{showingRule ? currentRule?.text : quote.text}"
          </blockquote>
          <cite className={`text-sm font-medium drop-shadow-sm transition-all duration-1000 ease-in-out ${
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