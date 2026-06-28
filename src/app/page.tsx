"use client";

import { useState } from "react";
import { ShieldCheck, Car, HeartPulse, Flame, Phone, Search, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const services = [
  {
    icon: Car,
    title: "بیمه شخص ثالث و بدنه",
    desc: "صدور آنی و تمدید بیمه خودرو بدون نیاز به مراجعه حضوری",
  },
  {
    icon: HeartPulse,
    title: "بیمه حوادث و درمان",
    desc: "پوشش هزینه‌های درمانی و حوادث برای شما و خانواده‌تان",
  },
  {
    icon: Flame,
    title: "بیمه آتش‌سوزی",
    desc: "حفاظت از منزل و محل کسب‌وکار در برابر خطرات احتمالی",
  },
  {
    icon: ShieldCheck,
    title: "بیمه مسئولیت",
    desc: "پوشش مسئولیت حرفه‌ای و کارفرما مطابق ضوابط بیمه ایران",
  },
];

export default function Home() {
  const [step, setStep] = useState<"form" | "loading" | "done" | "error">("form");
  const [trackingCode, setTrackingCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStep("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const fullname = (form.elements.namedItem("fullname") as HTMLInputElement).value;
    const mobile = (form.elements.namedItem("mobile") as HTMLInputElement).value;
    const city = (form.elements.namedItem("city") as HTMLInputElement).value;
    const insuranceType = (form.elements.namedItem("insurance_type") as HTMLSelectElement).value;

    try {
      // 1. Insert into customers table
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({
          fullname,
          mobile,
          city,
          insurance_type: insuranceType,
          status: "new",
        })
        .select()
        .single();

      if (customerError) throw customerError;

      // 2. Insert into quotes table, linked to the new customer
      const { error: quoteError } = await supabase.from("quotes").insert({
        customer_id: customer.id,
        insurance_type: insuranceType,
        status: "pending",
      });

      if (quoteError) throw quoteError;

      // 3. Build a real tracking code from the database id
      const code = `INS-${new Date().getFullYear()}-${String(customer.id).padStart(4, "0")}`;
      setTrackingCode(code);
      setStep("done");
    } catch (err) {
      console.error(err);
      setErrorMsg("ثبت درخواست با خطا مواجه شد. لطفاً دوباره تلاش کنید یا با ما تماس بگیرید.");
      setStep("error");
    }
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-[var(--color-line)]">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-navy)] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-[var(--color-navy)]">گلزار بیمه</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#services" className="hover:text-[var(--color-navy)] transition-colors">خدمات</a>
            <a href="#tracking" className="hover:text-[var(--color-navy)] transition-colors">پیگیری درخواست</a>
            <a href="#trust" className="hover:text-[var(--color-navy)] transition-colors">چرا گلزار</a>
            <a href="#contact" className="hover:text-[var(--color-navy)] transition-colors">تماس با ما</a>
          </nav>

          <a
            href="tel:02100000000"
            className="hidden sm:flex items-center gap-2 bg-[var(--color-navy)] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[var(--color-blue)] transition-colors"
          >
            <Phone className="w-4 h-4" />
            مشاوره تلفنی
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--color-navy)]">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-28 relative">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/10 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full mb-5">
              نمایندگی رسمی بیمه ایران
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-5">
              بیمه‌ات را آنلاین بساز،
              <br />
              <span className="text-amber-400">خاطرت آسوده باشد</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-8 mb-8">
              ثبت درخواست در کمتر از دو دقیقه، تماس کارشناس ظرف چند ساعت، و پیگیری
              زنده وضعیت بیمه‌نامه‌تان از همین صفحه.
            </p>
            <a
              href="#estelam"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-[var(--color-navy)] font-bold px-7 py-3.5 rounded-xl transition-colors"
            >
              ثبت درخواست بیمه
            </a>
          </div>
        </div>
      </section>

      {/* Signature element: live tracking-style quote form, pulled up over hero */}
      <section id="estelam" className="max-w-3xl mx-auto px-5 -mt-10 md:-mt-14 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-[var(--color-line)] p-6 md:p-8">
          {step === "form" ? (
            <>
              <h2 className="font-bold text-lg text-[var(--color-navy)] mb-1">
                درخواست مشاوره و استعلام بیمه
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                اطلاعات زیر را وارد کنید، کارشناس ما با شما تماس می‌گیرد.
              </p>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fullname" className="text-sm font-medium text-slate-700">
                    نام و نام خانوادگی
                  </label>
                  <input
                    id="fullname"
                    name="fullname"
                    required
                    type="text"
                    placeholder="مثلاً علی محمدی"
                    className="border border-[var(--color-line)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-blue)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="mobile" className="text-sm font-medium text-slate-700">
                    شماره موبایل
                  </label>
                  <input
                    id="mobile"
                    name="mobile"
                    required
                    type="tel"
                    placeholder="09xxxxxxxxx"
                    className="border border-[var(--color-line)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-blue)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="city" className="text-sm font-medium text-slate-700">
                    شهر
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="مثلاً تهران"
                    className="border border-[var(--color-line)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-blue)] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="insurance_type" className="text-sm font-medium text-slate-700">
                    نوع بیمه
                  </label>
                  <select
                    id="insurance_type"
                    name="insurance_type"
                    className="border border-[var(--color-line)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-blue)] transition-colors bg-white"
                  >
                    <option>شخص ثالث / بدنه</option>
                    <option>حوادث و درمان</option>
                    <option>آتش‌سوزی</option>
                    <option>مسئولیت</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="md:col-span-2 bg-[var(--color-navy)] hover:bg-[var(--color-blue)] text-white font-bold rounded-lg py-3 transition-colors mt-1"
                >
                  ثبت درخواست
                </button>
              </form>
            </>
          ) : step === "loading" ? (
            <div className="text-center py-10">
              <Loader2 className="w-10 h-10 text-[var(--color-navy)] mx-auto mb-3 animate-spin" />
              <p className="text-sm text-slate-500">در حال ثبت درخواست شما...</p>
            </div>
          ) : step === "error" ? (
            <div className="text-center py-6">
              <p className="text-sm text-red-600 mb-4">{errorMsg}</p>
              <button
                onClick={() => setStep("form")}
                className="bg-[var(--color-navy)] hover:bg-[var(--color-blue)] text-white text-sm font-bold rounded-lg px-5 py-2.5 transition-colors"
              >
                تلاش دوباره
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h2 className="font-bold text-lg text-[var(--color-navy)] mb-1">
                درخواست شما با موفقیت ثبت شد
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                کارشناسان ما به‌زودی با شما تماس می‌گیرند. کد پیگیری خود را ذخیره کنید:
              </p>
              <div className="inline-flex items-center gap-2 bg-[var(--color-blue-light)] text-[var(--color-navy)] font-bold px-5 py-2.5 rounded-lg tracking-wide">
                {trackingCode}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tracking */}
      <section id="tracking" className="max-w-3xl mx-auto px-5 mt-16 md:mt-20">
        <div className="bg-white rounded-2xl border border-[var(--color-line)] p-6 md:p-8 flex flex-col md:flex-row items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-blue-light)] flex items-center justify-center shrink-0">
            <Search className="w-6 h-6 text-[var(--color-navy)]" />
          </div>
          <div className="flex-1 text-center md:text-right">
            <h3 className="font-bold text-[var(--color-navy)] mb-1">پیگیری درخواست قبلی</h3>
            <p className="text-sm text-slate-500">کد رهگیری خود را برای مشاهده آخرین وضعیت وارد کنید.</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input
              type="text"
              placeholder="INS-2026-XXXX"
              className="border border-[var(--color-line)] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-blue)] flex-1 md:w-48"
            />
            <button className="bg-[var(--color-navy)] hover:bg-[var(--color-blue)] text-white text-sm font-bold rounded-lg px-5 transition-colors">
              پیگیری
            </button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="max-w-6xl mx-auto px-5 mt-20 md:mt-28">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-[var(--color-navy)] mb-2">
            خدمات بیمه ایران
          </h2>
          <p className="text-slate-500 text-sm md:text-base">
            تمام پوشش‌هایی که برای آرامش شما و خانواده‌تان نیاز است
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {services.map((s) => (
            <div
              key={s.title}
              className="bg-white border border-[var(--color-line)] rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--color-blue-light)] flex items-center justify-center mb-4">
                <s.icon className="w-5 h-5 text-[var(--color-navy)]" />
              </div>
              <h3 className="font-bold text-sm mb-2">{s.title}</h3>
              <p className="text-xs text-slate-500 leading-6">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section id="trust" className="max-w-6xl mx-auto px-5 mt-20 md:mt-28">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            ["+۱۲", "سال تجربه نمایندگی"],
            ["+۸۰۰۰", "مشتری راضی"],
            ["۲۴ ساعت", "پاسخگویی کارشناس"],
            ["۱۰۰٪", "آنلاین و بدون مراجعه"],
          ].map(([num, label]) => (
            <div key={label}>
              <div className="text-2xl md:text-3xl font-black text-[var(--color-navy)] mb-1">{num}</div>
              <div className="text-xs md:text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[var(--color-navy)] mt-24">
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-white">گلزار بیمه ایران</span>
          </div>
          <p className="text-slate-300 text-sm">
            تماس با ما: ۰۲۱-۰۰۰۰۰۰۰۰ — تمام حقوق محفوظ است.
          </p>
        </div>
      </footer>
    </main>
  );
}
