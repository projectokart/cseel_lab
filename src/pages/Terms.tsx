import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";

const Terms = () => (
  <Layout>
    <PageTransition>
      <section className="hero-gradient py-16 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Terms & Conditions</h1>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl prose prose-sm text-foreground">
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using the CSEEL platform, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.</p>
          
          <h2>2. User Accounts</h2>
          <p>Users are responsible for maintaining the confidentiality of their account credentials. You must provide accurate and complete information during registration.</p>
          
          <h2>3. Acceptable Use</h2>
          <p>You agree to use the platform only for educational purposes and in compliance with applicable laws. You may not misuse, disrupt, or attempt to gain unauthorized access to the platform.</p>
          
          <h2>4. Intellectual Property</h2>
          <p>All content on the CSEEL platform, including experiments, simulations, and educational materials, is the intellectual property of CSEEL and may not be reproduced without permission.</p>
          
          <h2>5. Limitation of Liability</h2>
          <p>CSEEL provides the platform "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from use of the platform.</p>
          
          <h2>6. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of updated terms.</p>
          
          <h2>7. Contact</h2>
          <p>For questions about these terms, please contact us at <a href="mailto:legal@cseel.org" className="text-primary">legal@cseel.org</a>.</p>
        </div>
      </section>
    </PageTransition>
  </Layout>
);

export default Terms;
