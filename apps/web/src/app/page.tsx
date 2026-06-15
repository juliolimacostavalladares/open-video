import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Film, Upload } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold tracking-tight">Open Video Studio</h1>
              <div className="hidden md:flex items-center space-x-6">
                <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
                <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  How it works
                </Link>
                <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard">Get started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Create videos with AI,{' '}
              <span className="text-primary">in minutes</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Transform ideas into professional videos with AI-powered scripting, voice synthesis, and intelligent media selection. No editing skills required.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">Start creating</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#how-it-works">See how it works</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Everything you need to create videos
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful AI tools that handle the heavy lifting, so you can focus on your message.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="outline" className="hover:shadow-medium transition-shadow">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Script Generation</h3>
                <p className="text-muted-foreground">
                  Generate engaging scripts from simple prompts. Our AI understands your topic and creates structured, compelling content.
                </p>
              </CardContent>
            </Card>
            <Card variant="outline" className="hover:shadow-medium transition-shadow">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Film className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Media Selection</h3>
                <p className="text-muted-foreground">
                  Automatically find the perfect images and videos from royalty-free sources. Match visuals to your script effortlessly.
                </p>
              </CardContent>
            </Card>
            <Card variant="outline" className="hover:shadow-medium transition-shadow">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">One-Click Publishing</h3>
                <p className="text-muted-foreground">
                  Render and publish directly to YouTube and other platforms. Schedule releases and track performance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps from idea to published video.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Describe your video</h3>
              <p className="text-muted-foreground">
                Enter a topic or paste your script. Our AI generates a structured outline with scenes and narration.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Customize and refine</h3>
              <p className="text-muted-foreground">
                Review AI suggestions, adjust scenes, choose visuals, and generate voiceover in your preferred voice.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Render and publish</h3>
              <p className="text-muted-foreground">
                Export your video in seconds and publish directly to YouTube or download for other platforms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to create your first video?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of creators using AI to produce professional videos faster.
            </p>
            <Button size="lg" asChild>
              <Link href="/dashboard">Get started for free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 Open Video Studio. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
