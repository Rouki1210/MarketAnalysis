import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Article } from '../../models/post.model';
import { CommunityService } from '../../services/community.service';

/**
 * ArticleDetailComponent
 *
 * Article detail page displaying full content
 *
 * Features:
 * - Full article display with category badge
 * - Title, summary, and content sections
 * - Source URL link to external articles
 * - Back navigation to articles list
 * - Article not found handling
 * - Integration with CommunityService
 */
@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 py-6">
      <!-- Back Button -->
      <button
        (click)="goBack()"
        class="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <svg
          class="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span>Back to Articles</span>
      </button>

      <div
        *ngIf="article()"
        class="bg-card border border-border rounded-xl p-8"
      >
        <!-- Category Badge -->
        <div class="mb-4">
          <span
            class="text-xs px-3 py-1 rounded-full font-medium"
            [ngClass]="{
              'bg-blue-500/20 text-blue-400': article()?.category === 'Coin',
              'bg-purple-500/20 text-purple-400':
                article()?.category === 'Market',
              'bg-green-500/20 text-green-400':
                article()?.category === 'Education'
            }"
          >
            {{ article()?.category }}
          </span>
        </div>

        <!-- Title -->
        <h1 class="text-4xl font-bold text-foreground mb-6">
          {{ article()?.title }}
        </h1>

        <!-- Summary -->
        <p class="text-xl text-muted-foreground mb-8 leading-relaxed">
          {{ article()?.summary }}
        </p>

        <!-- Content -->
        <div class="prose prose-invert max-w-none">
          <p class="text-foreground leading-relaxed mb-4">
            This is a detailed article about
            {{ article()?.title || 'cryptocurrency' }}. In the cryptocurrency
            market, understanding these concepts is crucial for making informed
            investment decisions.
          </p>

          <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">
            Key Points
          </h2>
          <ul
            class="list-disc list-inside space-y-2 text-muted-foreground mb-6"
          >
            <li>Comprehensive analysis of market trends and patterns</li>
            <li>Expert insights from industry leaders</li>
            <li>Practical strategies for investors</li>
            <li>Real-world examples and case studies</li>
          </ul>

          <h2 class="text-2xl font-bold text-foreground mt-8 mb-4">
            Conclusion
          </h2>
          <p class="text-foreground leading-relaxed mb-4">
            Understanding these concepts will help you navigate the complex
            world of cryptocurrency with more confidence and make
            better-informed decisions.
          </p>
        </div>

        <!-- External Link -->
        <div
          *ngIf="article()?.sourceUrl"
          class="mt-8 pt-6 border-t border-border"
        >
          <a
            [href]="article()?.sourceUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            <span>Read full article on CoinMarketCap</span>
            <svg
              class="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
              ></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        </div>
      </div>

      <!-- Article Not Found -->
      <div *ngIf="!article()" class="text-center py-16">
        <div
          class="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-8 h-8 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-foreground mb-2">
          Article not found
        </h3>
        <p class="text-muted-foreground mb-4">
          The article you're looking for doesn't exist
        </p>
        <button
          (click)="goBack()"
          class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Back to Articles
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class ArticleDetailComponent implements OnInit {
  article = signal<Article | null>(null);

  // Mock articles data (same as ArticlesComponent)
  private articles: Article[] = [
    // {
    //   id: 'a1',
    //   title: 'Understanding Bitcoin Halvings and Market Impact',
    //   summary: 'A comprehensive look at Bitcoin halving cycles and how they historically affect price action and market sentiment.',
    //   category: 'Coin',
    //   sourceUrl: 'https://coinmarketcap.com/community/articles/6912fc3072417b07898023f5/'
    // },
    // {
    //   id: 'a2',
    //   title: 'DeFi Protocols: A Beginner Guide',
    //   summary: 'Learn about decentralized finance protocols, how they work, and why they are revolutionizing traditional finance.',
    //   category: 'Education'
    // },
    // {
    //   id: 'a3',
    //   title: 'Market Analysis: Q1 2024 Crypto Trends',
    //   summary: 'Analyzing the major trends and movements in the cryptocurrency market during the first quarter of 2024.',
    //   category: 'Market'
    // }
  ];

  constructor(
    private route: ActivatedRoute,
    private communityService: CommunityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const articleId = this.route.snapshot.paramMap.get('id');
    if (articleId) {
      // const foundArticle = this.articles.find(a => a.id === articleId);
      // this.article.set(foundArticle || null);
    }
    this.loadArticle();
  }

  loadArticle(): void {
    const articleid = this.route.snapshot.paramMap.get('id');
    this.communityService.getArticleById(parseInt(articleid!)).subscribe({
      next: (article) => {
        this.article.set(article);
      },
      error: (err) => {
        console.error(err);
        this.article.set(null);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/community/articles']);
  }
}
