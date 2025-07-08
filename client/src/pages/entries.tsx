import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { EnhancedEntriesList } from "@/components/enhanced-entries-list";

export default function Entries() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <EnhancedEntriesList />
      </main>
      <Footer />
    </div>
  );
}