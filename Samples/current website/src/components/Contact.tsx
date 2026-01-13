import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Mail, Send } from "lucide-react";
import { useState } from "react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    // Reset form
    setFormData({ name: "", company: "", email: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <section id="contact" className="pt-16 lg:pt-20 pb-24 lg:pb-40 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center space-y-5 mb-16">
          <div className="inline-flex items-center bg-primary/10 text-primary px-5 py-2 rounded-full border border-primary/20 hover:bg-primary/15 transition-colors">
            <Mail className="w-4 h-4 mr-2" />
            <span className="text-sm">Let's Connect</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl">
            Book a Consultation
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Let's discuss how AI can create real value for your organization.
          </p>
        </div>

        <div className="bg-card/70 backdrop-blur-md border border-border/40 rounded-2xl p-8 md:p-12 shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-7">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="h-12 text-base border-border/60 focus:border-primary transition-all rounded-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="company" className="text-base">
                  Company <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="company"
                  name="company"
                  type="text"
                  required
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your company name"
                  className="h-12 text-base border-border/60 focus:border-primary transition-all rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-base">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@company.com"
                className="h-12 text-base border-border/60 focus:border-primary transition-all rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="message" className="text-base">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your AI transformation goals and challenges..."
                className="min-h-[160px] text-base border-border/60 focus:border-primary transition-all resize-none rounded-lg"
              />
            </div>

            <div className="pt-3">
              <Button 
                type="submit" 
                size="lg"
                className="w-full md:w-auto px-10 py-6 hover:bg-primary-hover transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-14 text-center">
          <p className="text-sm text-muted-foreground">
            We typically respond within 24 hours. Looking forward to connecting with you!
          </p>
        </div>
      </div>
    </section>
  );
}
