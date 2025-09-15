import React, { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, UploadCloud, File, X, Loader2, ServerCrash, FileWarning, Shield, ShieldAlert, ShieldCheck, Eye, EyeOff, Menu, Sun, Moon } from 'lucide-react';
import userAvatar from '../Assets/avatar.jpg';

// --- THEME CONTEXT ---
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) return storedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const themeValue = useMemo(() => ({
    theme,
    toggleTheme,
  }), [theme]);

  return <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>;
};

const useTheme = () => useContext(ThemeContext);


// --- MOCK DATA SETUP ---
const API = {
  getContracts: async () => {
    const response = await fetch('/contracts.json');
    if (!response.ok) throw new Error('Failed to fetch contracts');
    return response.json();
  },
  getContractById: async (id) => {
    try {
        const response = await fetch(`/${id}.json`);
        if (!response.ok) throw new Error(`Contract ${id} not found`);
        return response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
  },
};


// --- AUTHENTICATION CONTEXT ---
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem('mock_jwt'));

  const login = (password) => {
    if (password === 'test123') {
      const mockJwt = 'mock_jwt_token_for_saas_dashboard';
      localStorage.setItem('mock_jwt', mockJwt);
      setUser(mockJwt);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('mock_jwt');
    setUser(null);
  };

  const authValue = useMemo(() => ({
    user,
    login,
    logout,
  }), [user]);

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

const useAuth = () => useContext(AuthContext);


// --- MAIN APP COMPONENT & ROUTING ---
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SaaSContractsApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

function SaaSContractsApp() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [currentContractId, setCurrentContractId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigateToContract = (id) => {
    setCurrentContractId(id);
    setCurrentPage('contractDetail');
  };

  const navigateToDashboard = () => {
    setCurrentContractId(null);
    setCurrentPage('dashboard');
  };
  
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200">
      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} navigateToDashboard={navigateToDashboard} />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="p-4 md:p-8 flex-1">
            {currentPage === 'dashboard' && <ContractsDashboard navigateToContract={navigateToContract} />}
            {currentPage === 'contractDetail' && <ContractDetailPage contractId={currentContractId} navigateBack={navigateToDashboard} />}
          </main>
        </div>
      </div>
    </div>
  );
}


// --- PAGES ---

// 1. LOGIN PAGE
function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const success = login(password);
      if (!success) {
        setError('Invalid credentials. The correct password is "test123".');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Welcome to your Contracts Dashboard</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username (any)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// 2. CONTRACTS DASHBOARD
function ContractsDashboard({ navigateToContract }) {
  const [contracts, setContracts] = useState([]);
  const [status, setStatus] = useState('loading'); // loading, success, empty, error
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'All', risk: 'All' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setStatus('loading');
        const data = await API.getContracts();
        setContracts(data);
        setStatus(data.length > 0 ? 'success' : 'empty');
      } catch (err) {
        setStatus('error');
        console.error(err);
      }
    };
    fetchContracts();
  }, []);

  const filteredContracts = useMemo(() => {
    return contracts
      .filter(contract => 
        (contract.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         contract.parties.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter(contract => 
        (filters.status === 'All' || contract.status === filters.status)
      )
      .filter(contract => 
        (filters.risk === 'All' || contract.risk === filters.risk)
      );
  }, [contracts, searchTerm, filters]);

  const paginatedContracts = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredContracts.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredContracts, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredContracts.length / rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "Renewal Due": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      Expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    return `px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`;
  };

  const getRiskBadge = (risk) => {
    const styles = {
      High: "bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200",
      Medium: "bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100",
      Low: "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200",
    };
    const icon = {
      High: <ShieldAlert className="w-3 h-3 mr-1" />,
      Medium: <ShieldCheck className="w-3 h-3 mr-1" />,
      Low: <Shield className="w-3 h-3 mr-1" />,
    }
    return <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-md ${styles[risk]}`}>{icon[risk]} {risk}</span>;
  };

  const renderContent = () => {
    switch(status) {
      case 'loading':
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
      case 'error':
        return <div className="flex flex-col items-center justify-center h-64 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-4"><ServerCrash className="w-12 h-12 mb-4" /><p className="font-semibold">Failed to load contracts.</p><p className="text-sm">Please try again later.</p></div>;
      case 'empty':
        return <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4"><FileWarning className="w-12 h-12 mb-4" /><p className="font-semibold">No contracts yet.</p><p className="text-sm">Upload your first contract to get started.</p></div>;
      case 'success':
        return (
          <>
            <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3">Contract Name</th>
                    <th scope="col" className="px-6 py-3">Parties</th>
                    <th scope="col" className="px-6 py-3">Expiry Date</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Risk Score</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedContracts.map(contract => (
                    <tr key={contract.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => navigateToContract(contract.id)}>
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{contract.name}</th>
                      <td className="px-6 py-4">{contract.parties}</td>
                      <td className="px-6 py-4">{new Date(contract.expiry).toLocaleDateString()}</td>
                      <td className="px-6 py-4"><span className={getStatusBadge(contract.status)}>{contract.status}</span></td>
                      <td className="px-6 py-4">{getRiskBadge(contract.risk)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredContracts.length === 0 && (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">No contracts match your search or filters.</div>
            )}
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
              totalItems={filteredContracts.length}
              itemsPerPage={rowsPerPage}
            />
          </>
        );
      default:
        return null;
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contracts</h1>
        <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition duration-200">
          <UploadCloud size={18} /> Upload Contract
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by name or parties..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-4 md:col-span-2">
            <select
              value={filters.status}
              onChange={(e) => { setFilters(f => ({...f, status: e.target.value})); setCurrentPage(1); }}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Renewal Due">Renewal Due</option>
              <option value="Expired">Expired</option>
            </select>
            <select
              value={filters.risk}
              onChange={(e) => { setFilters(f => ({...f, risk: e.target.value})); setCurrentPage(1); }}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="All">All Risks</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>
      
      {renderContent()}

      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  );
}

// 3. CONTRACT DETAIL PAGE
function ContractDetailPage({ contractId, navigateBack }) {
    const [contract, setContract] = useState(null);
    const [status, setStatus] = useState('loading');
    const [isEvidencePanelOpen, setEvidencePanelOpen] = useState(false);

    useEffect(() => {
        if (!contractId) return;
        const fetchContract = async () => {
            try {
                setStatus('loading');
                const data = await API.getContractById(contractId);
                if (data) {
                    setContract(data);
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (err) {
                setStatus('error');
                console.error(err);
            }
        };
        fetchContract();
    }, [contractId]);

    const getRiskPill = (risk) => {
        const styles = {
            High: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-500/50",
            Medium: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-500/50",
            Low: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-500/50",
        };
        const icon = {
            High: <ShieldAlert className="w-4 h-4 mr-1.5" />,
            Medium: <ShieldCheck className="w-4 h-4 mr-1.5" />,
            Low: <Shield className="w-4 h-4 mr-1.5" />,
        };
        return <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full border ${styles[risk]}`}>{icon[risk]} {risk} Risk</span>;
    };

    const getConfidenceColor = (score) => {
        if (score > 0.85) return "text-green-600 dark:text-green-400";
        if (score > 0.7) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    if (status === 'loading') {
        return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
    }

    if (status === 'error' || !contract) {
        return (
            <div className="text-center">
                <p className="text-red-500 dark:text-red-400 font-semibold mb-4">Could not load contract details.</p>
                <button onClick={navigateBack} className="text-indigo-600 hover:underline dark:text-indigo-400">
                    &larr; Back to Dashboard
                </button>
            </div>
        );
    }
    
    return (
        <div className="max-w-7xl mx-auto">
            <button onClick={navigateBack} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 font-semibold">
                <ChevronLeft size={16} /> Back to Dashboard
            </button>
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{contract.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">{contract.parties}</p>
                    </div>
                    <div>{getRiskPill(contract.risk)}</div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Status</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{contract.status}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Start Date</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{new Date(contract.start).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Expiry Date</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{new Date(contract.expiry).toLocaleDateString()}</p>
                    </div>
                     <div>
                        <button onClick={() => setEvidencePanelOpen(true)} className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold px-4 py-2 rounded-lg transition">View Evidence</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Clauses Section */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Key Clauses</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {contract.clauses.map((clause, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-800 dark:text-gray-200">{clause.title}</h3>
                                    <span className={`text-sm font-bold ${getConfidenceColor(clause.confidence)}`}>
                                        {(clause.confidence * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">{clause.summary}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Insights Section */}
                <div>
                    <h2 className="text-xl font-bold mb-4 dark:text-white">AI Insights</h2>
                    <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow space-y-4">
                        {contract.insights.map((insight, index) => (
                            <div key={index} className="flex items-start">
                                <div className={`mt-1 mr-3 ${insight.risk === 'High' ? 'text-red-500 dark:text-red-400' : 'text-yellow-500 dark:text-yellow-400'}`}>
                                    {insight.risk === 'High' ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm dark:text-gray-200">{insight.risk} Risk</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">{insight.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <EvidencePanel 
                isOpen={isEvidencePanelOpen} 
                onClose={() => setEvidencePanelOpen(false)} 
                evidence={contract.evidence} 
            />
        </div>
    );
}


// --- REUSABLE COMPONENTS ---

// Sidebar
function Sidebar({ isOpen, setIsOpen, navigateToDashboard }) {
  const NavItem = ({ icon, text, active, onClick }) => (
    <a
      href="#"
      onClick={(e) => {
        onClick(e);
        // On mobile, close sidebar after nav
        if (window.innerWidth < 768) {
          setIsOpen(false);
        }
      }}
      className={`flex items-center h-12 rounded-lg transition-colors duration-200 overflow-hidden ${
        active ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-semibold' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      } ${isOpen ? 'px-4' : 'justify-center'}`}
    >
      {icon}
      <span
        className={`whitespace-nowrap transition-all duration-300 ${
          isOpen ? 'ml-4 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        {text}
      </span>
    </a>
  );
  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar Panel */}
      <aside className={`fixed inset-y-0 left-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 ease-in-out md:sticky md:translate-x-0 md:h-screen ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:w-20'}`}>
        {/* Spacer to align with header */}
        <div className="h-16 border-b dark:border-gray-700 flex items-center px-4">
           <button onClick={() => setIsOpen(prev => !prev)} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                <Menu size={24} />
            </button>
        </div>
        <nav className="p-2 mt-2 space-y-2">
          <NavItem icon={<File size={20} />} text="Contracts" active={true} onClick={(e) => { e.preventDefault(); navigateToDashboard(); }}/>
          <NavItem icon={<Search size={20} />} text="Insights" />
          <NavItem icon={<File size={20} />} text="Reports" />
          <NavItem icon={<UploadCloud size={20} />} text="Settings" />
        </nav>
      </aside>
    </>
  );
}

// Header
function Header() {
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div className="flex justify-between items-center h-16 px-4">
        <div className="flex items-center">
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                CONTRACTX
            </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
              <img className="w-8 h-8 rounded-full" src={userAvatar} alt="User avatar" />
              <span className="hidden md:inline text-sm font-semibold dark:text-gray-200">Admin</span>
              <ChevronDown size={16} className={`transition-transform dark:text-gray-400 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-20 ring-1 ring-black ring-opacity-5">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Profile</a>
                <a href="#" onClick={logout} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Logout</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


// Pagination
function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
  if (totalPages <= 1) return null;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mt-6 text-sm">
      <p className="text-gray-600 dark:text-gray-400 mb-2 md:mb-0">
        Showing <span className="font-semibold dark:text-gray-200">{startItem}</span> to <span className="font-semibold dark:text-gray-200">{endItem}</span> of <span className="font-semibold dark:text-gray-200">{totalItems}</span> results
      </p>
      <div className="flex items-center space-x-1">
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronLeft size={16} />
        </button>
        {/* We can add page numbers here if needed */}
        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md font-semibold">{currentPage} / {totalPages}</span>
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// Upload Modal
function UploadModal({ isOpen, onClose }) {
  const [files, setFiles] = useState([]);

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files).map(file => ({
      name: file.name,
      status: 'uploading',
    }));
    setFiles(f => [...f, ...droppedFiles]);
    simulateUpload(droppedFiles);
  }, []);

  const simulateUpload = (newFiles) => {
    newFiles.forEach(file => {
      setTimeout(() => {
        setFiles(currentFiles =>
          currentFiles.map(f =>
            f.name === file.name
              ? { ...f, status: Math.random() > 0.2 ? 'success' : 'error' }
              : f
          )
        );
      }, Math.random() * 2000 + 1000);
    });
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (!isOpen) {
      setFiles([]); // Reset on close
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const FileStatusIcon = ({ status }) => {
    switch (status) {
      case 'uploading': return <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />;
      case 'success': return <ShieldCheck className="w-5 h-5 text-green-500" />;
      case 'error': return <FileWarning className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold dark:text-white">Upload Contracts</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"><X /></button>
        </div>
        <div className="p-6">
          <div 
            onDrop={handleFileDrop} 
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-10 text-center cursor-pointer hover:border-indigo-500 bg-gray-50 dark:bg-gray-700/50 dark:hover:border-indigo-400"
          >
            <UploadCloud className="mx-auto w-12 h-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">PDF, DOCX, etc. (max 10MB)</p>
            <input type="file" multiple className="hidden" />
          </div>
          {files.length > 0 && (
            <div className="mt-6 max-h-60 overflow-y-auto">
              <h3 className="font-semibold text-sm mb-2 dark:text-gray-200">Uploaded Files</h3>
              <ul className="space-y-3">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between text-sm p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-800 dark:text-gray-200">{file.name}</span>
                    </div>
                    <FileStatusIcon status={file.status} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 rounded-b-lg text-right">
          <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">Done</button>
        </div>
      </div>
    </div>
  );
}

// Evidence Panel (Side Drawer)
function EvidencePanel({ isOpen, onClose, evidence }) {
    return (
        <div className={`fixed top-0 right-0 h-full bg-white dark:bg-gray-800 shadow-2xl z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} w-full md:w-1/3 lg:w-1/4`}>
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold dark:text-white">Retrieved Evidence</h2>
                <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"><X /></button>
            </div>
            <div className="p-6 overflow-y-auto h-[calc(100vh-70px)]">
                <div className="space-y-6">
                    {evidence.map((item, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{item.source}</span>
                                <span className="text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full">
                                    Relevance: {(item.relevance * 100).toFixed(0)}%
                                </span>
                            </div>
                            <blockquote className="text-gray-700 dark:text-gray-300 text-sm italic border-l-4 border-indigo-200 dark:border-indigo-500 pl-4 py-1">
                                "{item.snippet}"
                            </blockquote>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


