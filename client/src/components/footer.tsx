import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="glass-overlay border-t border-border mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <Button variant="ghost" size="sm" className="hover:text-journal-primary">
              User
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-journal-primary">
              Contact Us
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-journal-primary">
              About Us
            </Button>
          </div>
          <div className="text-sm text-gray-400">
            Built with ❤️ and AI
          </div>
        </div>
      </div>
    </footer>
  );
}
