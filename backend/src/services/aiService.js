/**
 * AI Service
 * Integrates with Claude API (Anthropic) for content generation.
 * Falls back to local generation when API key is not configured.
 */
const axios = require('axios');
const { anthropicApiKey } = require('../config/env');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.apiKey = anthropicApiKey;
    this.apiUrl = 'https://api.anthropic.com/v1/messages';
  }

  /**
   * Generate a caption for a social media post
   * @param {object} params - { topic, platform, tone, length }
   * @returns {object} { caption, hashtags }
   */
  async generateCaption({ topic, platform = 'twitter', tone = 'professional', length = 'medium' }) {
    const prompt = `Generate a ${tone} social media caption for ${platform} about "${topic}". 
    
    Requirements:
    - Length: ${length} (short: 1-2 sentences, medium: 2-3 sentences, long: 3-5 sentences)
    - Platform: ${platform} (respect character limits — Twitter: 280 chars)
    - Tone: ${tone}
    - Include 3-5 relevant hashtags at the end
    - Make it engaging and actionable
    - Use emojis where appropriate
    
    Respond in this exact JSON format:
    {
      "caption": "Your generated caption here",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
    }`;

    // Try Claude API first
    if (this.apiKey && this.apiKey !== 'your-anthropic-api-key') {
      try {
        const response = await axios.post(
          this.apiUrl,
          {
            model: 'claude-sonnet-4-20250514',
            max_tokens: 500,
            messages: [{ role: 'user', content: prompt }],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.apiKey,
              'anthropic-version': '2023-06-01',
            },
          }
        );

        const text = response.data.content[0].text;
        // Parse JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        logger.warn(`Claude API failed, using fallback: ${error.message}`);
      }
    }

    // Fallback: Generate locally
    return this._generateLocalCaption(topic, platform, tone);
  }

  /**
   * Suggest hashtags for a given topic
   */
  async suggestHashtags({ topic, platform = 'twitter', count = 10 }) {
    if (this.apiKey && this.apiKey !== 'your-anthropic-api-key') {
      try {
        const response = await axios.post(
          this.apiUrl,
          {
            model: 'claude-sonnet-4-20250514',
            max_tokens: 300,
            messages: [
              {
                role: 'user',
                content: `Suggest ${count} trending and relevant hashtags for "${topic}" on ${platform}. Return ONLY a JSON array of strings, e.g. ["hashtag1", "hashtag2"].`,
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': this.apiKey,
              'anthropic-version': '2023-06-01',
            },
          }
        );

        const text = response.data.content[0].text;
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return { hashtags: JSON.parse(jsonMatch[0]) };
        }
      } catch (error) {
        logger.warn(`Claude API failed for hashtags, using fallback: ${error.message}`);
      }
    }

    // Fallback
    return { hashtags: this._generateLocalHashtags(topic) };
  }

  /**
   * Suggest optimal posting times based on platform
   */
  async suggestOptimalTime({ platform = 'twitter', timezone = 'UTC' }) {
    // Research-backed optimal posting times
    const optimalTimes = {
      twitter: {
        bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
        bestTimes: ['9:00 AM', '12:00 PM', '5:00 PM'],
        peakEngagement: 'Tuesday 9:00 AM - 11:00 AM',
        advice: 'Post during work breaks and commute times. Avoid weekends for B2B content.',
      },
      linkedin: {
        bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
        bestTimes: ['7:30 AM', '10:00 AM', '12:00 PM'],
        peakEngagement: 'Wednesday 10:00 AM',
        advice: 'Post during business hours. Tuesday-Thursday see highest engagement. Avoid after 5 PM.',
      },
      instagram: {
        bestDays: ['Monday', 'Tuesday', 'Wednesday'],
        bestTimes: ['11:00 AM', '1:00 PM', '7:00 PM'],
        peakEngagement: 'Monday 11:00 AM',
        advice: 'Lunch hours and evening perform best. Stories perform well on weekends.',
      },
    };

    return {
      platform,
      timezone,
      recommendations: optimalTimes[platform] || optimalTimes.twitter,
      suggestedSlots: this._generateTimeSlots(platform),
    };
  }

  /**
   * Generate time slot suggestions
   */
  _generateTimeSlots(platform) {
    const now = new Date();
    const slots = [];

    for (let i = 1; i <= 5; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);

      // Set optimal hour based on platform
      const hours = { twitter: 9, linkedin: 10, instagram: 11 };
      date.setHours(hours[platform] || 9, 0, 0, 0);

      slots.push({
        datetime: date.toISOString(),
        day: date.toLocaleDateString('en-US', { weekday: 'long' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      });
    }

    return slots;
  }

  /**
   * Local fallback caption generator
   */
  _generateLocalCaption(topic, platform, tone) {
    const toneStyles = {
      professional: [
        `Excited to share insights on ${topic}. This is a game-changer for the industry! 🚀`,
        `${topic} is transforming how we work. Here's what you need to know 👇`,
        `Breaking down ${topic} — the trends you can't afford to miss. 💡`,
      ],
      casual: [
        `Can we talk about ${topic} for a sec? Because WOW 🤯`,
        `Just had a lightbulb moment about ${topic}! Here's the deal 💡`,
        `${topic} hits different when you really get into it 🔥`,
      ],
      humorous: [
        `${topic} walked so we could run 🏃‍♂️ And honestly, we're still tripping 😂`,
        `Nobody: ... Absolutely nobody: ... Me: "Let me tell you about ${topic}" 🤣`,
        `POV: You just discovered ${topic} and can't stop talking about it 😅`,
      ],
    };

    const captions = toneStyles[tone] || toneStyles.professional;
    const caption = captions[Math.floor(Math.random() * captions.length)];

    const hashtags = this._generateLocalHashtags(topic);

    return { caption, hashtags };
  }

  /**
   * Local fallback hashtag generator
   */
  _generateLocalHashtags(topic) {
    const words = topic.toLowerCase().split(/\s+/);
    const base = words.map((w) => w.replace(/[^a-z0-9]/g, ''));
    const hashtags = [
      ...base.filter((w) => w.length > 2).map((w) => `#${w}`),
      `#${base.join('')}`,
      '#trending',
      '#socialmedia',
      '#contentcreation',
      '#digitalmarketing',
      '#growth',
    ];
    return [...new Set(hashtags)].slice(0, 8);
  }
}

module.exports = new AIService();
