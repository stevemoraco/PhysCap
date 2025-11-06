import { Link } from "wouter";
import { GoldButton } from "./GoldButton";
import { useAuth } from "@/hooks/useAuth";
import { BRAND } from "@/lib/brand";

export function Navigation() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" data-testid="link-logo">
          <div className="flex items-center gap-3 hover-elevate transition-all duration-300 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
              <img
                src={BRAND.logoSrc}
                alt={BRAND.logoAlt}
                className="h-9 w-9 object-contain"
              />
            </div>
            <span className="font-serif text-xl font-bold text-foreground hidden sm:inline" aria-label={BRAND.name}>
              {BRAND.shortName}
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:inline">
                Welcome, {user?.firstName || user?.email}
              </span>
              <GoldButton
                onClick={() => window.location.href = '/api/logout'}
                variant="outline"
                size="default"
              >
                Sign Out
              </GoldButton>
            </>
          ) : (
            <GoldButton
              onClick={() => window.location.href = '/api/login'}
              icon="none"
            >
              Sign In
            </GoldButton>
          )}
        </div>
      </div>
    </nav>
  );
}
