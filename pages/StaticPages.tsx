import React from 'react';
import { FadeIn } from '../components/Anim';
import { SEO } from '../components/SEO';
import { Mail, MapPin, Phone, Shield, FileText, Info } from 'lucide-react';

export const About: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <SEO title="About Us" description="Learn more about NovelVerse, the premier platform for web novels." />
    <FadeIn>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">About NovelVerse</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">Reimagining the way you experience stories.</p>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <p className="text-lg leading-relaxed mb-6">
          NovelVerse was founded with a simple mission: to build the best possible reading experience for web novel enthusiasts. 
          We believe that stories have the power to transport us to new worlds, and the platform you read them on should be just as magical.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 my-12">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center">
                    <Info className="mr-2 text-primary" /> Our Mission
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                    To empower authors to share their creativity and provide readers with an immersive, distraction-free environment to discover their next favorite story.
                </p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center">
                    <Shield className="mr-2 text-primary" /> Our Values
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                    We prioritize community, creativity, and quality. We are committed to supporting our authors and ensuring a safe, inclusive space for all readers.
                </p>
            </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">The Team</h2>
        <p className="mb-6">
            We are a passionate team of developers, designers, and avid readers. We built NovelVerse because it's the platform we wanted to use ourselves.
        </p>
      </div>
    </FadeIn>
  </div>
);

export const Contact: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <SEO title="Contact Us" description="Get in touch with the NovelVerse team." />
    <FadeIn>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Contact Us</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">We'd love to hear from you.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Get in Touch</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
                Have a question, suggestion, or just want to say hi? Fill out the form or reach out to us directly.
            </p>
            
            <div className="space-y-6">
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                    <Mail className="mr-4 text-primary" />
                    <span>support@novelverse.com</span>
                </div>
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                    <MapPin className="mr-4 text-primary" />
                    <span>123 Story Street, Fiction City, FC 90210</span>
                </div>
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                    <Phone className="mr-4 text-primary" />
                    <span>+1 (555) 123-4567</span>
                </div>
            </div>
        </div>

        <form className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700">
            <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Name</label>
                <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none" placeholder="Your Name" />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input type="email" className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none" placeholder="your@email.com" />
            </div>
            <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                <textarea rows={4} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none resize-none" placeholder="How can we help?"></textarea>
            </div>
            <button type="button" className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                Send Message
            </button>
        </form>
      </div>
    </FadeIn>
  </div>
);

export const Terms: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <SEO title="Terms of Service" description="NovelVerse Terms of Service." />
    <FadeIn>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 flex items-center">
        <FileText className="mr-3 text-primary" /> Terms of Service
      </h1>
      <div className="prose dark:prose-invert max-w-none bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700">
        <h3>1. Acceptance of Terms</h3>
        <p>By accessing and using NovelVerse, you accept and agree to be bound by the terms and provision of this agreement.</p>
        
        <h3>2. User Accounts</h3>
        <p>To access certain features of the platform, you must register for an account. You agree to provide accurate information and keep it updated.</p>
        
        <h3>3. Content Policy</h3>
        <p>Users are responsible for the content they post. Hate speech, harassment, and copyright infringement are strictly prohibited.</p>
        
        <h3>4. Intellectual Property</h3>
        <p>Authors retain all rights to their original works published on NovelVerse. By posting, you grant NovelVerse a license to display and distribute your content on the platform.</p>
        
        <h3>5. Termination</h3>
        <p>We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever.</p>
      </div>
    </FadeIn>
  </div>
);

export const Privacy: React.FC = () => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <SEO title="Privacy Policy" description="NovelVerse Privacy Policy." />
    <FadeIn>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 flex items-center">
        <Shield className="mr-3 text-primary" /> Privacy Policy
      </h1>
      <div className="prose dark:prose-invert max-w-none bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700">
        <h3>1. Information We Collect</h3>
        <p>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us.</p>
        
        <h3>2. How We Use Your Information</h3>
        <p>We use the information we collect to provide, maintain, and improve our services, including to personalize your experience and send you technical notices.</p>
        
        <h3>3. Data Security</h3>
        <p>We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access.</p>
        
        <h3>4. Cookies</h3>
        <p>We use cookies and similar technologies to collect information about your activity, browser, and device.</p>
        
        <h3>5. Contact Us</h3>
        <p>If you have any questions about this Privacy Policy, please contact us at privacy@novelverse.com.</p>
      </div>
    </FadeIn>
  </div>
);
