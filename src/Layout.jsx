import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  DollarSign,
  Target,
  Bell,
  Sparkles,
  LogOut,
  Menu,
  X } from
"lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger } from
"@/components/ui/sidebar";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

const navigationItems = [
{
  title: "Dashboard",
  url: createPageUrl("Dashboard"),
  icon: LayoutDashboard
},
{
  title: "Conversar com IA",
  url: createPageUrl("Chat"),
  icon: MessageSquare
},
{
  title: "Tarefas",
  url: createPageUrl("Tarefas"),
  icon: CheckSquare
},
{
  title: "Agenda",
  url: createPageUrl("Agenda"),
  icon: Bell
},
{
  title: "Finanças",
  url: createPageUrl("Financas"),
  icon: DollarSign
},
{
  title: "Hábitos",
  url: createPageUrl("Habitos"),
  icon: Target
},
{
  title: "Central de Conteúdo",
  url: createPageUrl("CentralConteudo"),
  icon: Sparkles
}];


export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        :root {
          --primary: 238 76% 58%;
          --primary-foreground: 0 0% 100%;
          --accent: 238 76% 95%;
          --sidebar-bg: 240 10% 3.9%;
        }
        
        body {
          background: #0f0f23;
          background-image: 
            radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(236, 72, 153, 0.15) 0px, transparent 50%),
            radial-gradient(at 0% 100%, rgba(59, 130, 246, 0.15) 0px, transparent 50%);
          background-attachment: fixed;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .glow-effect {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }

        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
      
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {/* Desktop Sidebar */}
          <Sidebar className="hidden lg:flex border-r border-white/5 glass-effect">
            <SidebarHeader className="bg-indigo-900 p-6 flex flex-col gap-2 border-b border-white/5">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3">

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-md opacity-75"></div>
                  <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl w-12 h-12 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="font-bold text-xl text-white tracking-tight">Orquestra</h2>
                  <p className="text-xs text-gray-400">Assistente Inteligente</p>
                </div>
              </motion.div>
            </SidebarHeader>
            
            <SidebarContent className="bg-indigo-900 p-3 flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden overflow-y-auto">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {navigationItems.map((item, index) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}>

                          <SidebarMenuItem>
                            <SidebarMenuButton asChild>
                              <Link
                                to={item.url}
                                className={`
                                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                                  ${isActive ?
                                'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 glow-effect' :
                                'text-gray-400 hover:text-white hover:bg-white/5'}
                                `}>

                                <item.icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                                <span className="font-medium">{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        </motion.div>);

                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="bg-indigo-900 p-4 flex flex-col gap-2 border-t border-white/5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3">

                {user &&
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl glass-effect">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-sm opacity-75"></div>
                      <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">
                        {user.full_name || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                }
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300">

                  <LogOut className="w-4 h-4" />
                  <span className="font-medium">Sair</span>
                </button>
              </motion.div>
            </SidebarFooter>
          </Sidebar>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen &&
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setMobileMenuOpen(false)}>

                <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 25 }}
                className="w-80 h-full glass-effect border-r border-white/5 flex flex-col"
                onClick={(e) => e.stopPropagation()}>

                  <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-md opacity-75"></div>
                        <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl w-12 h-12 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <h2 className="font-bold text-xl text-white">Orquestra</h2>
                        <p className="text-xs text-gray-400">Assistente Inteligente</p>
                      </div>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="text-white">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3">
                    <div className="space-y-1">
                      {navigationItems.map((item) => {
                      const isActive = location.pathname === item.url;
                      return (
                        <Link
                          key={item.title}
                          to={item.url}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`
                              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                              ${isActive ?
                          'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' :
                          'text-gray-400 hover:text-white hover:bg-white/5'}
                            `}>

                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>);

                    })}
                    </div>
                  </div>

                  <div className="p-4 border-t border-white/5">
                    {user &&
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl glass-effect mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {user.full_name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm truncate">
                            {user.full_name || 'Usuário'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                  }
                    
                    <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">

                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Sair</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            }
          </AnimatePresence>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-w-0">
            <header className="lg:hidden glass-effect border-b border-white/5 px-6 py-4 sticky top-0 z-40">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors">

                  <Menu className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl w-8 h-8 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-lg font-bold text-white">Orquestra</h1>
                </div>
                <div className="w-10"></div>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </>);


}
