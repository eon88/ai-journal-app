import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, User, Share2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlogArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  authorId: number;
  category: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  readTime: number;
  metaTitle?: string;
  metaDescription?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author: {
    username: string;
    displayName?: string;
  };
}

export default function BlogArticlePage() {
  const [match, params] = useRoute("/blog/:slug");
  const { toast } = useToast();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ["/api/blog/articles/slug", params?.slug],
    enabled: !!params?.slug,
    queryFn: async () => {
      const response = await fetch(`/api/blog/articles/slug/${params?.slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Article not found');
        }
        throw new Error('Failed to fetch article');
      }
      return response.json();
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: "Link copied!",
        description: "Article link has been copied to your clipboard.",
      });
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-slate-700 rounded w-1/4"></div>
              <div className="h-12 bg-slate-700 rounded w-3/4"></div>
              <div className="h-6 bg-slate-700 rounded w-1/2"></div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="py-12">
                <h1 className="text-2xl font-bold text-white mb-4">Article Not Found</h1>
                <p className="text-gray-300 mb-6">
                  The article you're looking for doesn't exist or has been removed.
                </p>
                <Link href="/blog">
                  <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-700">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Blog
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/blog">
              <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>

          {/* Article Header */}
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardContent className="p-8">
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-400">
                <Badge variant="outline" className="border-purple-600 text-purple-300">
                  {article.category}
                </Badge>
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {article.author.displayName || article.author.username}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.readTime} min read
                </span>
                {article.isFeatured && (
                  <Badge className="bg-yellow-600 text-white">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {article.title}
              </h1>

              {/* Excerpt */}
              <p className="text-lg text-gray-300 mb-6">
                {article.excerpt}
              </p>

              {/* Tags and Share */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: string) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="border-slate-600 text-gray-400 text-xs"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="border-slate-700 text-white hover:bg-slate-700"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          {article.featuredImage && (
            <Card className="bg-slate-800 border-slate-700 mb-8">
              <CardContent className="p-0">
                <img
                  src={article.featuredImage}
                  alt={article.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Article Content */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-8">
              <div 
                className="prose prose-lg prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-em:text-gray-300 prose-blockquote:border-l-purple-500 prose-blockquote:text-gray-300 prose-code:text-purple-300 prose-code:bg-slate-700 prose-pre:bg-slate-900 prose-a:text-purple-400 hover:prose-a:text-purple-300"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </CardContent>
          </Card>

          {/* Article Footer */}
          <Card className="bg-slate-800 border-slate-700 mt-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Written by {article.author.displayName || article.author.username}
                  </h3>
                  <p className="text-gray-400">
                    Published on {formatDate(article.publishedAt)}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="border-slate-700 text-white hover:bg-slate-700"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Article
                  </Button>
                  <Link href="/blog">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      More Articles
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}