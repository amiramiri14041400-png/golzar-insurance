/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure Gemini API key is available
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is not set. Smart AI Consulting will run in offline demo mode.");
}

const app = express();
const PORT = 3000;

app.use(express.json());

// API route for Smart Consulting
app.post("/api/smart-consult", async (req, res) => {
  try {
    const { messages, userPreferences } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "لیست پیام‌ها الزامی است." });
    }

    if (!ai) {
      // Return beautiful offline-mock response in Farsi if API key is not configured
      return res.json({
        text: "به علت عدم تنظیم کلید امنیتی هوش مصنوعی (GEMINI_API_KEY) در سرور، بنده در حالت دمو پاسخ می‌دهم.\n\nمن مشاور بیمه هوشمند نمایندگی گلزار بیمه ایران هستم. بر اساس نرخنامه‌های مصوب بیمه ایران در سال جاری، شما می‌توانید با استفاده از تب‌های بالای صفحه، نرخ دقیق بیمه خود را محاسبه کنید. جهت مشاوره حضوری یا تماس تلفنی با نمایندگی گلزار (کد ۴۴۵۶) تماس بگیرید تا به بهترین نحو راهنمایی شوید!"
      });
    }

    // Format historical messages for Gemini content
    // Gemini 2.5 SDK uses: { role: 'user' | 'model', parts: [{ text: string }] }
    const geminiContents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    // System instruction to guide the model about Iran Insurance and Golzar Agency details
    const systemInstruction = `شما مشاور و دستیار هوشمندِ بیمه ارشد نمایندگی گلزار بیمه ایران (کد ۴۴۵۶) هستید. وظیفه شما راهنمایی دقیق مشتریان در انتخاب بهترین پوشش‌ها، پاسخ به سوالات تخصصی بر اساس آخرین آیین‌نامه‌ها و بخش‌نامه‌های مصوب بیمه مرکزی و بیمه ایران (سال ۱۴۰۵) و تحلیل ریسک است.

قواعد مشاوره و نرخ‌دهی شما:
۱. نام نمایندگی: نمایندگی گلزار بیمه ایران (کد ۴۴۵۶ - تهران، خیابان گلزار، پلاک ۴۴ - تلفن ۰۲۱-۴۴۵۶۷۸۹۰).
۲. شرکت بیمه: شرکت سهامی بیمه ایران (تنها شرکت بیمه ۱۰۰٪ دولتی کشور با بیشترین توانگری مالی).
۳. فرآیند استعلام قیمت گام‌به‌گام:
   - ابتدا یک نرخ پایه و حدودی بدون تخفیف و بدون پوشش‌های اضافی ارائه دهید.
   - از کاربر بپرسید که آیا پوشش‌های تکمیلی (مانند نوسان قیمت، سرقت قطعات، شکست شیشه، مواد شیمیایی، بلایای طبیعی) می‌خواهد یا خیر.
   - از کاربر بپرسید چند سال تخفیف عدم خسارت دارد (ثالث: سالی ۵٪ تا ۷۰٪ / بدنه: ۱ سال ۲۵٪، ۲ سال ۳۵٪، ۳ سال ۴۵٪، ۴ سال به بالا ۶۰٪).
   - سپس قیمت نهایی با تخفیف و پوشش‌ها را دوباره دقیق محاسبه و اعلام کنید.
۴. سقف پوشش مالی شخص ثالث در سال ۱۴۰۵ تا ۱۶,۰۰۰,۰۰۰,۰۰۰ ریال (۱.۶ میلیارد تومان) قابل افزایش است و دیه کامل ۱۶,۰۰۰,۰۰۰,۰۰۰ ریال می‌باشد.
۵. از عبارات تخصصی بیمه‌ای مانند "فرانشیز"، "الحاقیه"، "خسارت ارزیابی"، "تخفیف عدم خسارت"، "بیمه عمر مان" روان و حرفه‌ای استفاده کنید.
۶. اطلاعات ترجیحات فعلی مشتری اگر ارسال شده باشد: ${JSON.stringify(userPreferences || {})}. از این اطلاعات برای پاسخ‌های شخصی‌سازی شده استفاده کنید.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: geminiContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "خطایی در پردازش هوشمند رخ داد. لطفا مجددا تلاش کنید." });
  }
});

// Serve static assets or mount Vite middleware
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    // Dynamically import Vite server for development
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
