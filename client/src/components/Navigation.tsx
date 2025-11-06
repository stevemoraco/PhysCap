import { Link } from "wouter";
import { GoldButton } from "./GoldButton";
import { useAuth } from "@/hooks/useAuth";
import logoUrl from "@assets/51BCA963-A91C-41DE-B636-0BFA554C5787_1762447211277.PNG";

export function Navigation() {
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-3 hover-elevate transition-all duration-300" data-testid="link-logo">
            <img src={logoUrl} alt="Physical.Capital" className="h-10 w-10 object-contain" />
            <span className="font-serif text-xl font-bold text-foreground hidden sm:inline">
              Physical.Capital
            </span>
          </a>
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
