import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// In-memory rate limiting map
// Key: IP address, Value: { count: number, resetTime: number }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_MAX = 5; // 5 requests
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

    let rateData = rateLimitMap.get(ip);
    
    // Cleanup expired entries
    if (rateData && now > rateData.resetTime) {
      rateLimitMap.delete(ip);
      rateData = undefined;
    }

    if (!rateData) {
      rateData = { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
      rateLimitMap.set(ip, rateData);
    } else {
      rateData.count++;
      if (rateData.count > RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: "Too many requests. Even Rizul wouldn't spam this much. Slow down." },
          { status: 429, headers: { "Retry-After": "60" } }
        );
      }
    }

    // 2. Parse request
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ roast: "Your cart is emptier than Rizul's social life on a Friday night." });
    }

    const itemNames = items.map((i: any) => {
      const tagsStr = i.tags && i.tags.length > 0 ? ` (Tags: ${i.tags.join(', ')})` : '';
      return `${i.title}${tagsStr}`;
    }).join(", ");

    // 3. Initialize Gemini
    const ai = new GoogleGenAI({}); // Automatically uses GEMINI_API_KEY from environment

    const prompt = `You are a snarky, pop-culture-obsessed AI. Roast the user based on the following posters they are buying: [${itemNames}]. Keep it to 1-2 short, punchy sentences. Make it brutal but funny.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const roast = response.text?.trim() || "Good taste. But more posters = more power.";

    return NextResponse.json({ roast });
  } catch (error) {
    console.error("Roast API error:", error);
    return NextResponse.json(
      { roast: "Wow, your cart is so tragic it broke my AI brain." },
      { status: 200 } // Return 200 with fallback so the UI still works
    );
  }
}
