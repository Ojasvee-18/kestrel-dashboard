import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Users, Wrench, BookOpen } from "lucide-react";
import societyLogo from "@/assets/society-logo.png";
import heroBanner from "@/assets/hero-banner.jpg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${heroBanner})`,
            filter: "brightness(0.4)",
          }}
        />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <img
            src={societyLogo}
            alt="Kestrel Aerotech Logo"
            className="h-32 w-32 mx-auto mb-8"
          />
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 glow-text">
            Kestrel Aerotech
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-2xl mx-auto">
            Kestrel Aerotech is the official Aeronautical Scociety of KIIT University. HOVER WITH PURPOSE, STRIKE WITH POWER. Our core focus is on the design, fabrication, testing, and deployment of various types of drone systems.
          </p>
          
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate("/auth")}
            className="text-lg px-8 py-6"
          >
            <Rocket className="mr-2 h-5 w-5" />
            Member Login
          </Button>
        </div>
      </div>

      {/* About Section */}
      <section className="py-20 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-primary">About Our Society</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We aim to equip members with both advanced technical skills in aerospace engineering, aerodynamics, and embedded systems, as well as essential professional competencies like project management, documentation, fundraising, and industry engagement. The team participates in national-level competitions, pushing the boundaries of drone technology and innovation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="card-3d">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Collaborative Projects</h3>
                  <p className="text-muted-foreground">
                    Work alongside talented peers on cutting-edge aerospace projects and competitions.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-3d">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                    <Wrench className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Hands-On Experience</h3>
                  <p className="text-muted-foreground">
                    Gain practical skills through workshops, labs, and direct involvement in engineering projects.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-3d">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Knowledge Sharing</h3>
                  <p className="text-muted-foreground">
                    Learn from experts, and peers through seminars and mentorship programs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 hero-gradient">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Kestrel Aerotech
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            This is the official dashboard for members only.
          </p>
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate("/auth")}
          >
            Login Now!
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
