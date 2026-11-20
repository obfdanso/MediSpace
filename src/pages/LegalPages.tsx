import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SITE_NAME, SUPPORT_EMAIL } from "@/lib/site";

const UPDATED = "20 November 2026";

function Email() {
  return (
    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-emerald-600 dark:text-emerald-400 hover:underline">
      {SUPPORT_EMAIL}
    </a>
  );
}

function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto text-gray-700 dark:text-gray-300 leading-relaxed [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:dark:text-white [&_h2]:mt-10 [&_h2]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_li]:mb-1.5">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Last updated {UPDATED}</p>
          {children}
        </article>
      </main>
      <Footer />
    </div>
  );
}

export function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <p>
        These terms apply when you use {SITE_NAME}, an AI assistant that gives general health information.
        By creating an account or using the chat, you agree to them. If you don't agree, please don't use {SITE_NAME}.
      </p>

      <h2>{SITE_NAME} is not a doctor</h2>
      <p>
        {SITE_NAME} gives general information only. It does not diagnose, treat or prescribe, and it can be wrong.
        Always speak to a qualified health professional about your health, and never ignore or delay medical advice
        because of something {SITE_NAME} said. In an emergency, call 112 or go to the nearest hospital.
        See our <Link to="/disclaimer" className="text-emerald-600 dark:text-emerald-400 hover:underline">medical disclaimer</Link>.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>You must be at least 18, or have a parent or guardian's permission, to use {SITE_NAME}.</li>
        <li>Keep your password safe. You are responsible for what happens on your account.</li>
        <li>Give accurate details. Wrong health profile details can make answers less useful.</li>
      </ul>

      <h2>Fair use</h2>
      <p>Please don't:</p>
      <ul>
        <li>use {SITE_NAME} for anything illegal or to harm others;</li>
        <li>try to get around the daily message limits, break into accounts or overload the service;</li>
        <li>copy, resell or automate access to {SITE_NAME} without our written permission.</li>
      </ul>
      <p>We may suspend accounts that break these rules.</p>

      <h2>Free and Premium plans</h2>
      <p>
        The free plan has a daily message limit. Premium is a 30-day pass paid once through Paystack, by card or
        Mobile Money. It does not renew on its own, so you are never charged again unless you buy another pass.
        Prices are shown in Ghana cedis on the plans page before you pay. Refunds follow our{" "}
        <Link to="/refunds" className="text-emerald-600 dark:text-emerald-400 hover:underline">refund policy</Link>.
      </p>

      <h2>Availability</h2>
      <p>
        We work to keep {SITE_NAME} running, but we can't promise it will always be available or error-free.
        We may change, pause or stop features. If we stop offering Premium, we will refund any unused days of an active pass.
      </p>

      <h2>Limits on our responsibility</h2>
      <p>
        As far as the law allows, {SITE_NAME} is provided "as is", and we are not responsible for decisions you make
        based on its answers or for losses that come from using it. Nothing in these terms limits rights you have under
        Ghanaian consumer law.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. When we make important changes we will update the date at the top and, where we can,
        tell you in the app. Using {SITE_NAME} after a change means you accept the new terms.
      </p>

      <h2>Law and contact</h2>
      <p>These terms are governed by the laws of Ghana. Questions? Email <Email />.</p>
    </LegalLayout>
  );
}

export function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>
        This policy explains what {SITE_NAME} collects, why, and who else handles it. We follow Ghana's Data Protection
        Act, 2012 (Act 843).
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account details:</strong> your name, email address and password (stored scrambled, never readable).</li>
        <li><strong>Health profile (optional):</strong> details you choose to add, such as age, conditions, allergies and medicines.</li>
        <li><strong>Chats:</strong> the messages you send and the replies, so you can come back to them.</li>
        <li><strong>Usage:</strong> how many messages you send each day. For visitors who aren't signed in, we keep the IP address to apply the free limit.</li>
        <li><strong>Payments:</strong> the payment reference, amount and date. Card and Mobile Money details go straight to Paystack; we never see or store them.</li>
        <li><strong>Contact form:</strong> what you send us when you get in touch.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To answer your questions. Your health profile is included with your messages so answers fit you.</li>
        <li>To run your account, apply message limits and switch on Premium.</li>
        <li>To fix problems and keep the service safe.</li>
      </ul>
      <p>We don't sell your data and we don't use it for advertising.</p>

      <h2>Who else handles it</h2>
      <p>{SITE_NAME} relies on a few services to work. Each only gets what it needs:</p>
      <ul>
        <li><strong>Supabase</strong> stores your account, health profile and chats.</li>
        <li><strong>Groq</strong> runs the AI model. Your message, recent chat and health profile are sent to it to write each reply.</li>
        <li><strong>Paystack</strong> processes payments.</li>
        <li><strong>Vercel</strong> hosts the website and keeps short-lived technical logs.</li>
      </ul>
      <p>Some of these services store data outside Ghana. All connections to and between them are encrypted.</p>

      <h2>How long we keep it</h2>
      <p>
        We keep your account, health profile and chats until you delete them or your account. Payment records are kept
        as long as the law requires for financial records. Daily usage counts are only needed for the day they cover.
      </p>

      <h2>Your rights</h2>
      <p>
        You can ask to see, correct or delete your data, or close your account, at any time. Email <Email /> from the
        address on your account and we will reply within 30 days. You can also complain to the Data Protection Commission of Ghana.
      </p>

      <h2>Children</h2>
      <p>{SITE_NAME} is not meant for children under 13, and we don't knowingly collect their data.</p>

      <h2>Changes</h2>
      <p>If we change this policy we will update the date at the top and, for important changes, tell you in the app.</p>

      <h2>Contact</h2>
      <p>Questions about your privacy? Email <Email />.</p>
    </LegalLayout>
  );
}

export function RefundPage() {
  return (
    <LegalLayout title="Refund Policy">
      <p>
        Premium is a one-off 30-day pass. It does not renew, so you will never be charged again unless you buy
        another pass yourself.
      </p>

      <h2>When you get a full refund</h2>
      <ul>
        <li>You were charged but Premium didn't switch on and we can't fix it.</li>
        <li>You were charged twice for the same pass.</li>
        <li>You ask within 7 days of paying and have sent no more than 10 Premium messages.</li>
        <li>We stop offering Premium while your pass is active (you get the unused days back).</li>
      </ul>

      <h2>When we can't refund</h2>
      <p>Outside these cases, a pass that has been used isn't refundable, but it stays active until it runs out.</p>

      <h2>How to ask</h2>
      <p>
        Email <Email /> from the address on your account with the date you paid and, if you have it, the Paystack
        reference from your receipt. We reply within 3 working days. Approved refunds go back through Paystack to the
        card or Mobile Money wallet you paid with, usually within 5 to 10 working days.
      </p>
    </LegalLayout>
  );
}

export function DisclaimerPage() {
  return (
    <LegalLayout title="Medical Disclaimer">
      <p>
        <strong>{SITE_NAME} is not a doctor and does not give medical advice.</strong> It is an AI assistant that shares
        general health information to help you understand your health and prepare questions for a professional.
      </p>
      <ul>
        <li>It cannot examine you, diagnose a condition, or prescribe or change medicines.</li>
        <li>AI can make mistakes, miss important details or give out-of-date information.</li>
        <li>Never start, stop or change a medicine because of something {SITE_NAME} said. Ask a doctor or pharmacist.</li>
        <li>Don't ignore professional advice or delay getting care because of an answer here.</li>
      </ul>

      <h2>In an emergency</h2>
      <p>
        If you have chest pain, trouble breathing, heavy bleeding, signs of a stroke, thoughts of harming yourself,
        or any other emergency, <strong>call 112 or go to the nearest hospital now</strong>. Don't wait for a reply here.
      </p>
    </LegalLayout>
  );
}
