import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/seo/SEOHead";

import { useState } from "react";
import PageTransition from "@/components/shared/PageTransition";
import ScrollReveal from "@/components/shared/ScrollReveal";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ContactUs = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", institution: "", phone: "",
    position: "", type: "", country: "", message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      institution: formData.institution,
      phone: formData.phone,
      message: `Position: ${formData.position} | Type: ${formData.type} | Country: ${formData.country}\n\n${formData.message}`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Message sent!", description: "We'll be in touch soon." });
      setFormData({ firstName: "", lastName: "", email: "", institution: "", phone: "", position: "", type: "", country: "", message: "" });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <PageTransition>
      <SEOHead
        title="Contact CSEEL | Science Education Platform India"
        description="Get in touch with CSEEL for science education partnerships, school programs, teacher training, and workshop inquiries. Serving students and educators across India."
        keywords="contact CSEEL, science education India contact, school science program inquiry, teacher training India"
        canonical="https://www.cseel.org/contact-us"
      />
      <Layout>
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left side */}
              <ScrollReveal direction="left">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">Contact Us</h1>
                  <p className="text-muted-foreground mb-8">
                    Need to reach our team? Let us know you need help and we will be in touch.
                  </p>

                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-primary mb-2">Pune</h3>
                    <p className="text-muted-foreground text-sm">
                      Mr. Dev Sharma<br />
                      9050778830<br />
                      New Delhi-11001<br />
                      India
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-primary mb-2">Customer Support</h3>
                      <a href="mailto:support@cseel.org" className="text-sm text-muted-foreground underline">support@cseel.org</a>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary mb-2">Help Center</h3>
                      <a href="https://help.cseel.org" className="text-sm text-muted-foreground underline">help.cseel.org</a>
                    </div>
                  </div>

                  <motion.div
                    className="rounded-2xl overflow-hidden shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.4 }}
                  >
                    <img
                      src="https://cdn.prod.website-files.com/63105b5082760e06eb992f00/66bf9f93d712be6d135ac575_Student-Remote-Room-Labster-reverse-edit.avif"
                      alt="Student using tablet"
                      className="w-full h-64 object-cover"
                    />
                  </motion.div>
                </div>
              </ScrollReveal>

              {/* Right side - Form */}
              <ScrollReveal direction="right" delay={0.15}>
                <div className="bg-background border border-border rounded-xl p-8 shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-6">Fill out the form and we'll be in touch.</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">
                          <span className="text-destructive">*</span> First Name
                        </label>
                        <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">
                          <span className="text-destructive">*</span> Last Name
                        </label>
                        <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" required className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        <span className="text-destructive">*</span> Email
                      </label>
                      <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">
                          <span className="text-destructive">*</span> Institution
                        </label>
                        <input name="institution" value={formData.institution} onChange={handleChange} placeholder="Institution / Company Name" required className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">
                          <span className="text-destructive">*</span> Phone
                        </label>
                        <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">
                          <span className="text-destructive">*</span> Position
                        </label>
                        <select name="position" value={formData.position} onChange={handleChange} required className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background">
                          <option value="">Position</option>
                          <option value="professor">Professor</option>
                          <option value="teacher">Teacher</option>
                          <option value="administrator">Administrator</option>
                          <option value="student">Student</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1 block">
                          <span className="text-destructive">*</span> Type
                        </label>
                        <select name="type" value={formData.type} onChange={handleChange} required className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background">
                          <option value="">Institution Type</option>
                          <option value="university">University</option>
                          <option value="school">School</option>
                          <option value="college">College</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        <span className="text-destructive">*</span> Country
                      </label>
                      <select name="country" value={formData.country} onChange={handleChange} required className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background">
                        <option value="">Country</option>
                        <option value="india">India</option>
                        <option value="usa">USA</option>
                        <option value="uk">UK</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">
                        <span className="text-destructive">*</span> Message
                      </label>
                      <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Your message..." rows={4} required className="w-full px-3 py-2 border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary-hover transition-colors disabled:opacity-60"
                    >
                      {loading ? "Sending..." : "Submit"}
                    </motion.button>
                  </form>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </Layout>
    </PageTransition>
  );
};

export default ContactUs;
