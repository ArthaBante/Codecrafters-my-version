import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useParams,
  Link 
} from 'react-router-dom';
import { 
  FolderGit2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Layers, 
  Clock, 
  AlertCircle,
  Code2,
  Cpu,
  Zap,
  Check,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Lock,
  Play,
  HelpCircle,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { 
  getCurrentUser, 
  loginUser, 
  logoutUser, 
  User 
} from './services/auth';
import { 
  saveProject, 
  getProjects, 
  getProjectById,
  deleteProject,
  updateProject,
  getDraft, 
  saveDraft, 
  clearDraft, 
  SavedProject,
  ProjectLanguage,
  ProjectProficiency 
} from './services/projectStorage';
import { generateStages, Stage } from './services/aiService';
import { runCodeCheck, RunResult } from './services/runnerService';

export default function App() {
  const [user, setUser] = useState<User | null>(getCurrentUser());

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
        <Header user={user} onLogout={() => setUser(null)} />
        <main className="flex-1 flex flex-col justify-center">
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={(u) => setUser(u)} />} />
            
            {/* Protected Routes */}
            <Route path="/" element={user ? <ProjectsListPage user={user} /> : <Navigate to="/login" replace />} />
            <Route path="/projects" element={user ? <ProjectsListPage user={user} /> : <Navigate to="/login" replace />} />
            <Route path="/projects/new/setup" element={user ? <SetupPage /> : <Navigate to="/login" replace />} />
            <Route path="/projects/new/describe" element={user ? <DescribePage user={user} /> : <Navigate to="/login" replace />} />
            <Route path="/projects/:id" element={user ? <ProjectDetailPage /> : <Navigate to="/login" replace />} />
            <Route path="/projects/:id/stages" element={user ? <StageViewPage /> : <Navigate to="/login" replace />} />
            
            <Route path="*" element={<Navigate to="/projects" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

function Header({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const [projectCount, setProjectCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setProjectCount(getProjects(user.id).length);
    }
  }, [user]);

  const handleLogout = () => {
    logoutUser();
    onLogout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <Link to={user ? "/projects" : "/login"} className="flex items-center gap-3 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <FolderGit2 className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            ProjectForge
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 font-mono font-normal">v3.0</span>
          </span>
        </Link>

        {user && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/projects" className="hover:text-cyan-400 transition-colors flex items-center gap-1.5">
              <span>My projects</span>
              {projectCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-mono bg-slate-800 text-cyan-300 rounded-full">
                  {projectCount}
                </span>
              )}
            </Link>
            <Link to="/projects/new/setup" className="hover:text-cyan-400 transition-colors">
              New project
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-4 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate max-w-[120px]">{user.email}</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all rounded-lg shadow-sm"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-6 px-6 text-center text-xs text-slate-600 font-mono">
      <p>ProjectForge · Step-by-step project builder</p>
    </footer>
  );
}

/* ========================================================
   DEMO LOGIN PAGE (/login)
   ======================================================== */
function LoginPage({ onLogin }: { onLogin: (u: User) => void }) {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter an email address.');
      return;
    }
    const user = loginUser(email);
    onLogin(user);
    navigate('/projects', { replace: true });
  };

  const handleGuest = () => {
    const user = loginUser('guest');
    onLogin(user);
    navigate('/projects', { replace: true });
  };

  return (
    <div className="max-w-md w-full mx-auto px-6 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20 text-slate-950 font-bold mb-4">
          <FolderGit2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-sm text-slate-400">
          {isSignUp ? 'Start building custom coding projects step by step.' : 'Log in to access your saved projects.'}
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="developer@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-medium text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 font-medium text-sm"
            />
          </div>

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-cyan-400/10 text-sm cursor-pointer"
          >
            {isSignUp ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-xs font-mono text-slate-500">OR</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        <button
          type="button"
          onClick={handleGuest}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-all border border-slate-700 text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Continue as guest</span>
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================
   MY PROJECTS PAGE (/projects & /)
   ======================================================== */
function ProjectsListPage({ user }: { user: User }) {
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    setProjects(getProjects(user.id));
  }, [user.id]);

  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Projects</h1>
          <p className="text-sm text-slate-400 mt-1">Manage and track your coding projects step by step.</p>
        </div>
        <Link
          to="/projects/new/setup"
          className="px-4.5 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all shadow-lg shadow-cyan-400/10 flex items-center gap-2"
        >
          <span>+ New project</span>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-white">No projects yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            Choose your language and proficiency, then describe your first project to get started.
          </p>
          <Link
            to="/projects/new/setup"
            className="px-5 py-3 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors inline-flex items-center gap-2 shadow-lg shadow-cyan-400/10"
          >
            <span>Start a new project</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:border-cyan-500/40 hover:bg-slate-900 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
            >
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                    {project.name}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono border capitalize ${
                    project.status === 'completed' 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                      : project.status === 'in_progress'
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 font-mono flex-wrap pt-1">
                  <span className="uppercase text-cyan-400 font-semibold">{project.language}</span>
                  <span>·</span>
                  <span className="uppercase text-indigo-300 font-semibold">{project.proficiency}</span>
                  <span>·</span>
                  <span>Stage {project.currentStage + 1} / {project.stages?.length || 5}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(project.createdAt).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center self-end md:self-center">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-400 group-hover:bg-cyan-400 group-hover:text-slate-950 group-hover:border-cyan-400 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ========================================================
   SETUP PAGE (/projects/new/setup)
   ======================================================== */
function SetupPage() {
  const navigate = useNavigate();
  const draft = getDraft();

  const [language, setLanguage] = useState<ProjectLanguage | null>(draft?.language || null);
  const [proficiency, setProficiency] = useState<ProjectProficiency | null>(draft?.proficiency || null);

  const languages: { id: ProjectLanguage; label: string; icon: any; desc: string }[] = [
    { id: 'python', label: 'Python', icon: Code2, desc: 'Data science, scripts, backends & AI.' },
    { id: 'java', label: 'Java', icon: Cpu, desc: 'Robust enterprise systems & services.' },
    { id: 'javascript', label: 'JavaScript', icon: Zap, desc: 'Web apps, full-stack & interactive UI.' },
  ];

  const proficiencies: { id: ProjectProficiency; label: string; tag: string; desc: string }[] = [
    { id: 'beginner', label: 'Beginner', tag: 'Guided Path', desc: 'smaller stages, concepts explained, more hints.' },
    { id: 'intermediate', label: 'Intermediate', tag: 'Standard Path', desc: 'normal stages, hints when you ask.' },
    { id: 'advanced', label: 'Advanced', tag: 'Expert Path', desc: 'bigger stages, minimal help.' },
  ];

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!language || !proficiency) return;

    saveDraft({
      name: draft?.name || '',
      description: draft?.description || '',
      language,
      proficiency,
    });

    navigate('/projects/new/describe');
  };

  const isReady = language && proficiency;

  return (
    <div className="max-w-3xl w-full mx-auto px-6 py-12 space-y-10">
      <div className="space-y-2 text-center max-w-xl mx-auto">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">Step 1 of 2</span>
        <h1 className="text-3xl font-bold tracking-tight text-white">Configure Your Project</h1>
        <p className="text-sm text-slate-400">
          Choose your primary programming language and experience level to tailor your building journey.
        </p>
      </div>

      <form onSubmit={handleContinue} className="space-y-10">
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-200">
            1. Select programming language <span className="text-cyan-400">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {languages.map((lang) => {
              const Icon = lang.icon;
              const isSelected = language === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id)}
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-4 relative group cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 group-hover:text-white'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white capitalize text-base">{lang.label}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{lang.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-slate-200">
            2. Select proficiency level <span className="text-cyan-400">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {proficiencies.map((prof) => {
              const isSelected = proficiency === prof.id;
              return (
                <button
                  key={prof.id}
                  type="button"
                  onClick={() => setProficiency(prof.id)}
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-4 relative group cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-mono px-2.5 py-1 rounded-md uppercase tracking-wider ${
                      isSelected ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {prof.tag}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-indigo-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white capitalize text-base">{prof.label}</h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed capitalize">{prof.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-slate-800/80">
          <div className="text-xs text-slate-400 font-mono">
            {!isReady ? 'Please select both language and proficiency to continue.' : 'Configuration ready.'}
          </div>
          <button
            type="submit"
            disabled={!isReady}
            className={`px-6 py-3.5 rounded-xl font-semibold transition-all flex items-center gap-2 text-sm shadow-lg ${
              isReady
                ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-400/10 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
            }`}
          >
            <span>Continue to description</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

/* ========================================================
   DESCRIBE PAGE (/projects/new/describe)
   ======================================================== */
function DescribePage({ user }: { user: User }) {
  const navigate = useNavigate();
  const draft = getDraft();

  useEffect(() => {
    if (!draft?.language || !draft?.proficiency) {
      navigate('/projects/new/setup', { replace: true });
    }
  }, [draft, navigate]);

  const [projectName, setProjectName] = useState(draft?.name || '');
  const [projectDescription, setProjectDescription] = useState(draft?.description || '');

  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  useEffect(() => {
    if (draft?.language && draft?.proficiency) {
      saveDraft({
        name: projectName,
        description: projectDescription,
        language: draft.language,
        proficiency: draft.proficiency,
      });
    }
  }, [projectName, projectDescription, draft?.language, draft?.proficiency]);

  if (!draft?.language || !draft?.proficiency) {
    return null;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!projectName.trim()) {
      setNameError('Project name is required.');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!projectDescription.trim()) {
      setDescriptionError('Please describe your project.');
      hasError = true;
    } else {
      setDescriptionError('');
    }

    if (hasError) return;

    const newProject = saveProject(
      {
        name: projectName,
        description: projectDescription,
        language: draft.language!,
        proficiency: draft.proficiency!,
      },
      user.id
    );

    navigate(`/projects/${newProject.id}`, { replace: true });
  };

  const wordCount = projectDescription.trim() ? projectDescription.trim().split(/\s+/).length : 0;
  const charCount = projectDescription.length;

  return (
    <div className="max-w-3xl w-full mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 px-5 py-3.5 rounded-xl">
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-400">Config:</span>
          <span className="px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase font-semibold">
            {draft.language}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase font-semibold">
            {draft.proficiency}
          </span>
        </div>
        <Link
          to="/projects/new/setup"
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors underline underline-offset-4"
        >
          Change
        </Link>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold">Step 2 of 2</span>
        <h1 className="text-3xl font-bold tracking-tight text-white">Describe Your Project</h1>
        <p className="text-sm text-slate-400">
          Provide your project name and detailed description below.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="space-y-2">
          <label htmlFor="projectName" className="block text-sm font-semibold text-slate-200">
            Project name <span className="text-cyan-400">*</span>
          </label>
          <input
            id="projectName"
            type="text"
            value={projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              if (nameError) setNameError('');
            }}
            placeholder="e.g. Distributed Task Queue in Python"
            className={`w-full bg-slate-900 border rounded-xl px-4 py-3.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all font-medium ${
              nameError 
                ? 'border-red-500/80 focus:ring-red-500/30' 
                : 'border-slate-800 focus:border-cyan-500/50 focus:ring-cyan-500/20'
            }`}
          />
          {nameError && (
            <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{nameError}</span>
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="projectDescription" className="block text-sm font-semibold text-slate-200">
              Describe your project <span className="text-cyan-400">*</span>
            </label>
            <span className="text-xs text-slate-500 font-mono">
              {wordCount} words · {charCount} chars
            </span>
          </div>
          <textarea
            id="projectDescription"
            rows={8}
            value={projectDescription}
            onChange={(e) => {
              setProjectDescription(e.target.value);
              if (descriptionError) setDescriptionError('');
            }}
            placeholder="What is the project? What should it do? What features do you want? What language or tools, experience level, and why you are building it..."
            className={`w-full bg-slate-900 border rounded-xl p-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all leading-relaxed resize-y min-h-[220px] ${
              descriptionError 
                ? 'border-red-500/80 focus:ring-red-500/30' 
                : 'border-slate-800 focus:border-cyan-500/50 focus:ring-cyan-500/20'
            }`}
          />
          {descriptionError && (
            <p className="text-xs text-red-400 flex items-center gap-1.5 mt-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{descriptionError}</span>
            </p>
          )}
        </div>

        <div className="pt-2 flex items-center justify-between">
          <Link
            to="/projects/new/setup"
            className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to setup</span>
          </Link>
          <button
            type="submit"
            className="px-6 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-cyan-400/10 flex items-center gap-2 text-sm cursor-pointer"
          >
            <span>Save project</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

/* ========================================================
   PROJECT DETAIL PAGE (/projects/:id)
   ======================================================== */
function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<SavedProject | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }
    const found = getProjectById(id);
    if (!found) {
      setNotFound(true);
    } else {
      setProject(found);
    }
  }, [id]);

  const handleGeneratePlan = () => {
    if (!project) return;
    setIsGenerating(true);
    setTimeout(() => {
      const stages = generateStages(project);
      const updated: SavedProject = {
        ...project,
        stages,
        status: 'in_progress',
        currentStage: 0,
      };
      updateProject(updated);
      setProject(updated);
      setIsGenerating(false);
      navigate(`/projects/${project.id}/stages`);
    }, 600);
  };

  const handleDelete = () => {
    if (!project) return;
    const confirmed = window.confirm(`Are you sure you want to delete "${project.name}"?`);
    if (confirmed) {
      deleteProject(project.id);
      navigate('/projects', { replace: true });
    }
  };

  if (notFound || !project) {
    return (
      <div className="max-w-md w-full mx-auto px-6 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Project not found</h1>
          <p className="text-sm text-slate-400">
            The project you are looking for does not exist or has been deleted.
          </p>
        </div>
        <div>
          <Link
            to="/projects"
            className="px-5 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-colors inline-flex items-center gap-2 shadow-lg shadow-cyan-400/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My projects</span>
          </Link>
        </div>
      </div>
    );
  }

  const hasStages = project.stages && project.stages.length > 0;

  return (
    <div className="max-w-3xl w-full mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My projects</span>
        </Link>
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete project</span>
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-8 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-mono border capitalize font-semibold ${
                project.status === 'completed' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                  : project.status === 'in_progress'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25'
                  : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'
              }`}>
                {project.status.replace('_', ' ')}
              </span>
              <span className="text-xs font-mono text-slate-400">
                {hasStages ? `Stage ${project.currentStage + 1} of ${project.stages?.length}` : 'Pending Plan'}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">{project.name}</h1>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase font-semibold">
              {project.language}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 uppercase font-semibold border border-slate-700">
              {project.proficiency}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold">Project Description</h3>
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-5 text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
            {project.description}
          </div>
        </div>

        {/* Action: Generate Plan or View Stages */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-slate-400 font-mono">
            {hasStages ? 'Building plan generated.' : 'Ready to generate step-by-step roadmap.'}
          </span>
          {hasStages ? (
            <Link
              to={`/projects/${project.id}/stages`}
              className="w-full sm:w-auto px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-cyan-400/10 text-sm flex items-center justify-center gap-2"
            >
              <span>Continue to stages</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-cyan-400/10 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Generating plan...' : 'Generate plan (demo)'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800/80 font-mono">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            Created: {new Date(project.createdAt).toLocaleDateString(undefined, { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          <span className="text-slate-600">ID: {project.id}</span>
        </div>
      </div>
    </div>
  );
}

/* ========================================================
   STAGE VIEW & SUBMISSION RUNNER (/projects/:id/stages)
   ======================================================== */
function StageViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<SavedProject | null>(null);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  
  // Code editor state
  const [code, setCode] = useState('');
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [revealedHintsCount, setRevealedHintsCount] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = getProjectById(id);
    if (found) {
      setProject(found);
      const stageIdx = found.currentStage || 0;
      setCurrentStageIdx(stageIdx);
      if (found.status === 'completed') {
        setIsCompleted(true);
      }
    }
  }, [id]);

  if (!project || !project.stages || project.stages.length === 0) {
    return (
      <div className="max-w-md w-full mx-auto px-6 py-20 text-center space-y-6">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No stages generated yet</h2>
        <p className="text-sm text-slate-400">Please generate a plan on the project page first.</p>
        <Link
          to={`/projects/${id}`}
          className="px-5 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-xl inline-block"
        >
          Go to project overview
        </Link>
      </div>
    );
  }

  const stages = project.stages;
  const currentStage = stages[currentStageIdx] || stages[0];
  const passedStages = project.passedStages || [];

  // Progress percentage
  const progressPercent = Math.round((passedStages.length / stages.length) * 100);

  const handleSelectStage = (idx: number) => {
    // Can select passed stages or current/unlocked stage
    const stage = stages[idx];
    const isPassed = passedStages.includes(stage.id);
    const isUnlocked = idx <= project.currentStage;
    if (isPassed || isUnlocked) {
      setCurrentStageIdx(idx);
      setRunResult(null);
      setRevealedHintsCount(1);
      setCode('');
    }
  };

  const handleShowHint = () => {
    if (revealedHintsCount < currentStage.hints.length) {
      setRevealedHintsCount(prev => prev + 1);
    }
  };

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    const result = runCodeCheck(code, currentStage.testCases, currentStage.hints);
    setRunResult(result);

    if (result.success) {
      // Mark stage passed
      const newPassed = Array.from(new Set([...passedStages, currentStage.id]));
      let nextStageIdx = currentStageIdx;
      let newStatus = project.status;

      if (currentStageIdx + 1 < stages.length) {
        nextStageIdx = currentStageIdx + 1;
      } else {
        newStatus = 'completed';
        setIsCompleted(true);
      }

      const updated: SavedProject = {
        ...project,
        passedStages: newPassed,
        currentStage: nextStageIdx,
        status: newStatus,
      };

      updateProject(updated);
      setProject(updated);
    }
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-4 md:px-6 py-8 flex flex-col gap-6">
      {/* Top bar breadcrumb */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to={`/projects/${project.id}`}
            className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{project.name}</span>
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-xs font-mono text-cyan-400">Stage {currentStageIdx + 1} of {stages.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Progress: {progressPercent}%</span>
          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {isCompleted && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3 animate-fadeIn">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Project Complete!</h2>
          <p className="text-sm text-slate-300">
            Congratulations! You have successfully completed all stages of <strong className="text-white">{project.name}</strong>.
          </p>
        </div>
      )}

      {/* Main Grid: Left List + Right Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Stages List */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold px-1">Project Roadmap</h3>
          <div className="space-y-2">
            {stages.map((st, idx) => {
              const isPassed = passedStages.includes(st.id);
              const isCurrent = idx === currentStageIdx;
              const isUnlocked = idx <= project.currentStage || isPassed;

              return (
                <button
                  key={st.id}
                  onClick={() => handleSelectStage(idx)}
                  disabled={!isUnlocked}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                    isCurrent
                      ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-md'
                      : isPassed
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      : isUnlocked
                      ? 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono shrink-0 ${
                    isPassed 
                      ? 'bg-emerald-500 text-slate-950 font-bold' 
                      : isCurrent 
                      ? 'bg-cyan-500 text-slate-950 font-bold' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{st.title}</div>
                    <div className="text-[10px] font-mono text-slate-500 capitalize">
                      {isPassed ? 'Passed' : isCurrent ? 'Current Stage' : isUnlocked ? 'Unlocked' : 'Locked'}
                    </div>
                  </div>
                  {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Main Panel: Stage Details & Code Runner */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-6">
            {/* Stage Header */}
            <div className="space-y-2 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span>STAGE {currentStageIdx + 1} OF {stages.length}</span>
                <span>·</span>
                <span className="uppercase">{project.language}</span>
              </div>
              <h2 className="text-2xl font-bold text-white">{currentStage.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{currentStage.goal}</p>
            </div>

            {/* Concept & Done When */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-2 bg-slate-950/50 border border-slate-800/60 rounded-xl p-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">Core Concept</h4>
                <p className="text-slate-300 text-xs leading-relaxed">{currentStage.concept}</p>
              </div>

              <div className="space-y-2 bg-slate-950/50 border border-slate-800/60 rounded-xl p-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">Done When</h4>
                <ul className="space-y-1 text-xs text-slate-300">
                  {currentStage.doneWhen.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Test Cases */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Visible Test Cases</h4>
              <div className="grid gap-3">
                {currentStage.testCases.map((tc, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-slate-500 mr-2">INPUT:</span>
                      <span className="text-cyan-300 bg-slate-900 px-2 py-1 rounded">{tc.input}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 mr-2">EXPECTED:</span>
                      <span className="text-emerald-300 bg-slate-900 px-2 py-1 rounded">{tc.expectedOutput}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hints Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">Hints & Guidance</h4>
                {revealedHintsCount < currentStage.hints.length && (
                  <button
                    onClick={handleShowHint}
                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Show hint ({revealedHintsCount}/{currentStage.hints.length})</span>
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {currentStage.hints.slice(0, revealedHintsCount).map((hint, i) => (
                  <div key={i} className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-3.5 text-xs text-cyan-200 font-mono leading-relaxed flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">💡</span>
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Editor & Submit */}
            <form onSubmit={handleSubmitCode} className="space-y-4 pt-4 border-t border-slate-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                    Code Editor ({project.language})
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">Type any code to pass (or include 'fail' to test error handling)</span>
                </div>
                <textarea
                  rows={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`# Write your ${project.language} solution here...\nprint("Initialized Successfully")`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 leading-relaxed resize-y"
                />
              </div>

              {/* Run Result Panel */}
              {runResult && (
                <div className={`rounded-xl p-4 text-xs font-mono space-y-2 animate-fadeIn ${
                  runResult.success 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                    : 'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}>
                  <div className="font-semibold flex items-center gap-2">
                    {runResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                    <span>{runResult.message}</span>
                  </div>
                  {!runResult.success && runResult.failedTest && (
                    <div className="bg-slate-950/80 p-3 rounded-lg space-y-1 text-slate-300">
                      <div><strong className="text-red-400">Failed Input:</strong> {runResult.failedTest.input}</div>
                      <div><strong className="text-emerald-400">Expected:</strong> {runResult.failedTest.expectedOutput}</div>
                      {runResult.hint && <div className="text-cyan-300 pt-1">💡 Hint: {runResult.hint}</div>}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-cyan-400/10 text-sm flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Submit Solution</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
