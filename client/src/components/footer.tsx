import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="glass-overlay border-t border-border mt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-500">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="hover:text-journal-primary text-gray-700 dark:text-gray-300">
                User Profile
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="sm" className="hover:text-journal-primary text-gray-700 dark:text-gray-300">
                Contact Us
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="ghost" size="sm" className="hover:text-journal-primary text-gray-700 dark:text-gray-300">
                About Us
              </Button>
            </Link>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Built with ❤️ and AI
          </div>
        </div>
      </div>
    </footer>
  );
}
