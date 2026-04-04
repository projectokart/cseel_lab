import Layout from "@/components/layout/Layout";
import PageTransition from "@/components/shared/PageTransition";

const Privacy = () => (
  <Layout>
    <PageTransition>
      <section className="hero-gradient py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Privacy Policy</h1>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl prose prose-sm text-foreground">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide during registration (name, email, institution) and usage data to improve our platform.</p>
          
          <h2>2. How We Use Information</h2>
          <p>Your information is used to provide and improve our educational services, communicate updates, and ensure platform security.</p>
          
          <h2>3. Data Protection</h2>
          <p>We implement industry-standard security measures to protect your data. We do not sell your personal information to third parties.</p>
          
          <h2>4. Cookies</h2>
          <p>We use cookies to maintain your session and improve user experience. You can disable cookies in your browser settings.</p>
          
          <h2>5. Children's Privacy</h2>
          <p>Our platform is designed for educational use. We take special care to protect the privacy of students under 18, in compliance with applicable laws.</p>
          
          <h2>6. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:privacy@cseel.org" className="text-primary">privacy@cseel.org</a> for any requests.</p>
          
          <h2>7. Changes</h2>
          <p>We may update this policy periodically. We will notify users of significant changes via email or platform notification.</p>
        </div>
      </section>
    </PageTransition>
  </Layout>
);

export default Privacy;
