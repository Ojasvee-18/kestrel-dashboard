import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Rocket, Package, LayoutDashboard, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import societyLogo from "@/assets/society-logo.png";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItems = () => (
    <>
      <Button
        variant="ghost"
        onClick={() => {
          navigate(isAdmin ? "/admin" : "/dashboard");
          setMobileMenuOpen(false);
        }}
        className="w-full md:w-auto justify-start"
      >
        <LayoutDashboard className="mr-2 h-4 w-4" />
        Dashboard
      </Button>
      
      {isAdmin && (
        <Button
          variant="ghost"
          onClick={() => {
            navigate("/projects");
            setMobileMenuOpen(false);
          }}
          className="w-full md:w-auto justify-start"
        >
          <Rocket className="mr-2 h-4 w-4" />
          Projects
        </Button>
      )}
      
      <Button
        variant="ghost"
        onClick={() => {
          navigate("/inventory");
          setMobileMenuOpen(false);
        }}
        className="w-full md:w-auto justify-start"
      >
        <Package className="mr-2 h-4 w-4" />
        Inventory
      </Button>
      
      <Button
        variant="ghost"
        onClick={() => {
          signOut();
          setMobileMenuOpen(false);
        }}
        className="w-full md:w-auto justify-start"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <img src={societyLogo} alt="Logo" className="h-8 w-8 md:h-10 md:w-10" />
              <span className="text-lg md:text-xl font-bold text-primary">Aerospace Society</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-4">
              <NavItems />
            </nav>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-2 mt-8">
                  <NavItems />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
