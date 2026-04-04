import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/seo/SEOHead";

import PageTransition from "@/components/shared/PageTransition";

const OurStory = () => (
  <Layout>
    <PageTransition>
      <SEOHead
        title="Our Story | How CSEEL is Transforming Science Education in India"
        description="Read the story of CSEEL — from idea to India's leading experimental science learning platform. Discover our journey, values, and vision for science education in India."
        keywords="CSEEL story, science education startup India, experimental learning India history"
        canonical="https://www.cseel.org/our-story"
      />
      <section className="hero-gradient py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Our Story</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            How CSEEL began and where we're headed.
          </p>
        </div>
      </section>
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-3xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">The Beginning</h2>
            <p className="text-muted-foreground leading-relaxed">
              CSEEL was founded with a simple yet powerful vision: to make quality science education accessible to every student, regardless of their school's lab infrastructure. We believe that experiential learning is the key to true scientific understanding.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              We aim to bridge the gap between theoretical knowledge and practical application by providing virtual laboratories that simulate real-world experiments. Our platform empowers both educators and students to explore, experiment, and discover.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Looking Ahead</h2>
            <p className="text-muted-foreground leading-relaxed">
              With a growing community of schools and institutions, we continue to expand our experiment library, improve our simulations, and develop new tools that make science education more engaging and effective than ever.
            </p>
          </div>
        </div>
      </section>
    </PageTransition>
  </Layout>
);

export default OurStory;
