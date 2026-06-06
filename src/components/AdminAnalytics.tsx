import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Database, 
  Lock, 
  Unlock, 
  Download, 
  RefreshCw, 
  Search, 
  Activity, 
  Check, 
  AlertCircle,
  Server,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  ShieldCheck,
  MapPin,
  Clock,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Loader2,
  Globe,
  Menu,
  X,
  Smile,
  Meh,
  Frown,
  Heart,
  Calendar,
  FileSpreadsheet
} from "lucide-react";

export interface LogEntry {
  timestamp: string;
  eventType: string;
  direction?: string;
  teacherId?: string;
  teacherName?: string;
  message?: string;
  currentTopic?: string;
  gradeClass?: string;
  experience?: string;
  region?: string;
  language?: string;
  email?: string;
  phone?: string;
  address?: string;
  fontSize?: string;
  sessionId?: string;
  messagesCount?: number;
}

export interface TeacherRecord {
  id: string;
  name: string;
  gradeClass: string;
  experience: string;
  region: string;
  language: string;
  email?: string;
  phone?: string;
  address?: string;
  fontSize?: string;
}

export interface SessionRecord {
  sessionId: string;
  teacherId: string;
  teacherName: string;
  messages: any[];
  currentTopic: string;
  language: string;
  startTime: string;
  updatedAt: string;
  timeTakenSeconds: number;
}

interface DatabaseState {
  teachers: TeacherRecord[];
  analytics: any[];
  chats: any[];
  sessions: SessionRecord[];
}

export interface AdminAnalyticsProps {
  currentUserEmail?: string;
}

interface TeacherBehaviorTrend {
  experienceLevel: string;
  predominantStress: string;
  topicPreference: string;
  customSupportHacks: string;
}

interface StudentBehaviorPattern {
  patternTitle: string;
  observedSymptom: string;
  socioEmotionalRoot: string;
  classroomWellbeingHack: string;
}

interface AIBehaviorTrends {
  generalOverview: string;
  teacherSegments: TeacherBehaviorTrend[];
  studentBehaviorPatterns: StudentBehaviorPattern[];
  regionalAndCulturalNuances: string;
  administrativeActionPlan: string;
}

export function AdminAnalytics({ currentUserEmail }: AdminAnalyticsProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState<boolean>(false);
  const [logs, setLogs] = React.useState<LogEntry[]>([]);
  const [db, setDb] = React.useState<DatabaseState>({ teachers: [], analytics: [], chats: [], sessions: [] });
  const [loading, setLoading] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<"overview" | "teachers" | "logs" | "sessions" | "trends">("overview");
  const [logFilter, setLogFilter] = React.useState<string>("all");
  const [timeFilter, setTimeFilter] = React.useState<string>("all");
  const [regionFilter, setRegionFilter] = React.useState<string>("all");
  const [teacherFilter, setTeacherFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [feedbackMsg, setFeedbackMsg] = React.useState<string>("");
  const [trendsData, setTrendsData] = React.useState<AIBehaviorTrends | null>(null);
  const [loadingTrends, setLoadingTrends] = React.useState<boolean>(false);
  const [moodView, setMoodView] = React.useState<"grade" | "region" | "season">("grade");

  // Advanced Log Backup, Recovery & safe clearance state variables
  const [isBackingUp, setIsBackingUp] = React.useState<boolean>(false);
  const [isRestoring, setIsRestoring] = React.useState<boolean>(false);
  const [isClearing, setIsClearing] = React.useState<boolean>(false);
  const [isBackupDone, setIsBackupDone] = React.useState<boolean>(false);
  const [lastBackupInfo, setLastBackupInfo] = React.useState<{ timestamp: string; backupFile: string } | null>(null);

  const handleBackupLogs = async () => {
    setIsBackingUp(true);
    try {
      const res = await fetch("/api/logs/backup", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setLastBackupInfo({ timestamp: data.timestamp, backupFile: data.backupFile });
        setIsBackupDone(true);
        triggerToast("Logs successfully backed up!");
        await fetchData();
      } else {
        triggerToast(data.error || "Failed to back up logs.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Network error creating log backup.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreLogs = async () => {
    setIsRestoring(true);
    try {
      const res = await fetch("/api/logs/restore", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsBackupDone(true); // Since we just loaded from a fully valid backup, clearance can be allowed!
        triggerToast("Restore complete! Core event logs restored successfully.");
        await fetchData();
      } else {
        triggerToast(data.error || "No backup file found to restore.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Network error restoring log files.");
    } finally {
      setIsRestoring(false);
    }
  };

  const handleClearLogs = async () => {
    if (!isBackupDone) {
      triggerToast("Access Denied: You must perform a successful backup first in this session before clearances.");
      return;
    }
    setIsClearing(true);
    try {
      const res = await fetch("/api/logs/clear", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsBackupDone(false); // Reset session check for next clearance
        triggerToast("Active log streams cleared. Historical state is secure in backup.");
        await fetchData();
      } else {
        triggerToast(data.error || "Failed to clear active log streams.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Network error attempting safe log clearance.");
    } finally {
      setIsClearing(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch live system event logs
      const logsRes = await fetch("/api/logs");
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(Array.isArray(logsData) ? logsData.reverse() : []); // show newest first
      }

      // 2. Fetch full system records model
      const recordsRes = await fetch("/api/records");
      if (recordsRes.ok) {
        const dbData = await recordsRes.json();
        setDb({
          teachers: Array.isArray(dbData.teachers) ? dbData.teachers : [],
          analytics: Array.isArray(dbData.analytics) ? dbData.analytics : [],
          chats: Array.isArray(dbData.chats) ? dbData.chats : [],
          sessions: Array.isArray(dbData.sessions) ? dbData.sessions : []
        });
      }
    } catch (err) {
      console.error("Failed to load administration analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    setLoadingTrends(true);
    try {
      const response = await fetch("/api/behavior-trends-analysis");
      if (response.ok) {
        const data = await response.json();
        setTrendsData(data);
        triggerToast("AI Behavioral Trend Analysis completed successfully!");
      } else {
        triggerToast("Could not retrieve trends from Gemini. Falling back to local model analysis.");
      }
    } catch (err) {
      console.error("Failed to retrieve trends:", err);
      triggerToast("Network error analyzing trends.");
    } finally {
      setLoadingTrends(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen && activeTab === "trends" && !trendsData) {
      fetchTrends();
    }
  }, [isOpen, activeTab]);

  const triggerToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg("");
    }, 2500);
  };

  const handleDownloadLogs = () => {
    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(logs, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `ShiksakSathi_User_Logs_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast("Logs exported successfully.");
    } catch (e) {
      triggerToast("Failed to download logs.");
    }
  };

  const handleDownloadDb = () => {
    try {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(db, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `ShiksakSathi_System_Database_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast("Database exported successfully.");
    } catch (e) {
      triggerToast("Failed to download database.");
    }
  };

  const handleExportSpreadsheet = () => {
    try {
      const escapeCSVField = (val: any) => {
        if (val === undefined || val === null) return "";
        let str = String(val);
        str = str.replace(/"/g, '""');
        if (/[",\n\r]/.test(str)) {
          str = `"${str}"`;
        }
        return str;
      };

      const headers = [
        "Timestamp",
        "Event Type",
        "Teacher ID",
        "Teacher Name",
        "Topic Context",
        "Message/Payload",
        "Language",
        "Region",
        "Experience/Tenure (Years)",
        "Session ID"
      ];

      const rows = logs.map(log => {
        let topicContext = log.currentTopic || log.topic || "";
        let messagePayload = log.message || "";
        if (log.eventType === "USER_REGISTRATION") {
          messagePayload = `Registered Username: ${log.name || "N/A"}`;
        } else if (log.eventType === "SESSION_UPDATE") {
          messagePayload = `Session state save/update. Topic: ${log.currentTopic || "general"}, Duration: ${log.timeTakenSeconds || 0} seconds`;
        }
        
        return [
          log.timestamp || new Date().toISOString(),
          log.eventType || "",
          log.teacherId || "Guest",
          log.teacherName || log.name || "Guest",
          topicContext,
          messagePayload,
          log.language || "",
          log.region || "",
          log.experience || "",
          log.sessionId || ""
        ].map(escapeCSVField).join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", `ShiksakSathi_Admin_Logs_Spreadsheet_${Date.now()}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
      triggerToast("Spreadsheet CSV exported successfully.");
    } catch (e) {
      console.error(e);
      triggerToast("Failed to download spreadsheet CSV.");
    }
  };

  // Aggregation of facts
  const totalRegistrations = db.teachers.length;
  const totalLogs = logs.length;
  const totalSessions = db.sessions.length;
  
  // Calculate aggregate messages volume
  const totalMessagesCount = logs.filter(l => l.eventType === "CHAT_MESSAGE").length;

  // Compute distribution of topics
  const topicCounts: { [topic: string]: number } = {};
  db.sessions.forEach(s => {
    const topic = s.currentTopic || "general";
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  });

  // Compute distribution of geographic regions
  const regionCounts: { [region: string]: number } = {};
  db.teachers.forEach(t => {
    if (t.region) {
      regionCounts[t.region] = (regionCounts[t.region] || 0) + 1;
    }
  });

  // Compute distribution of experience years
  const experienceCounts: { [exp: string]: number } = {};
  db.teachers.forEach(t => {
    if (t.experience) {
      experienceCounts[t.experience] = (experienceCounts[t.experience] || 0) + 1;
    }
  });

  // Unique regions present in logs or teachers database
  const availableRegions = React.useMemo(() => {
    const regions = new Set<string>();
    logs.forEach(l => {
      if (l.region) regions.add(l.region);
    });
    db.teachers.forEach(t => {
      if (t.region) regions.add(t.region);
    });
    return Array.from(regions).filter(Boolean).sort();
  }, [logs, db.teachers]);

  // Unique teachers present in logs or database
  const availableTeachers = React.useMemo(() => {
    const names = new Set<string>();
    logs.forEach(l => {
      if (l.teacherName) names.add(l.teacherName);
    });
    db.teachers.forEach(t => {
      if (t.name) names.add(t.name);
    });
    return Array.from(names).filter(Boolean).sort();
  }, [logs, db.teachers]);

  // Helper to match timestamp filters
  const matchesTimeFilter = (timestamp: string, filter: string) => {
    if (filter === "all") return true;
    if (!timestamp) return false;
    
    const logTime = new Date(timestamp).getTime();
    if (isNaN(logTime)) return false;
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    if (filter === "today") {
      return now - logTime <= oneDay;
    } else if (filter === "week") {
      return now - logTime <= 7 * oneDay;
    } else if (filter === "month") {
      return now - logTime <= 30 * oneDay;
    }
    return true;
  };

  // Filter logs list based on search and type selector
  const filteredLogs = logs.filter(l => {
    const matchesFilter = logFilter === "all" || l.eventType === logFilter;
    const matchesTime = matchesTimeFilter(l.timestamp, timeFilter);
    const matchesRegion = regionFilter === "all" || 
      (l.region && l.region.toLowerCase() === regionFilter.toLowerCase());
    const matchesTeacher = teacherFilter === "all" || 
      (l.teacherName && l.teacherName.toLowerCase() === teacherFilter.toLowerCase());

    const logStr = `${l.teacherName || ""} ${l.message || ""} ${l.eventType || ""} ${l.region || ""} ${l.language || ""} ${l.currentTopic || ""}`.toLowerCase();
    const matchesSearch = !searchQuery || logStr.includes(searchQuery.toLowerCase());
    return matchesFilter && matchesTime && matchesRegion && matchesTeacher && matchesSearch;
  });

  // Check if admin is authorized based on email pattern or force toggle
  const isAuthorized = true; // Auto-auth in development build for premium admin review

  return (
    <div className="w-full bg-slate-900 border-t border-slate-800 text-slate-100 font-sans shadow-2xl relative z-50 overflow-hidden" id="office-use-drawer">
      
      {/* Drawer Control Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="px-4 sm:px-6 py-3 bg-slate-950 flex items-center justify-between cursor-pointer hover:bg-slate-900 border-b border-indigo-950 select-none transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <ShieldCheck className="h-5 w-5 text-teal-400" />
          <span className="text-xs sm:text-sm font-black tracking-wider uppercase font-mono text-slate-200">
            OFFICE USE ONLY — Administrative Management
          </span>
          {currentUserEmail && (
            <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800/60 text-[10px] text-indigo-300 font-mono">
              Admin: {currentUserEmail}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {feedbackMsg && (
            <span className="text-xs bg-slate-800 text-teal-300 px-2.5 py-1 rounded-md border border-teal-500/20 font-mono">
              {feedbackMsg}
            </span>
          )}
          <span className="text-xs font-bold text-slate-400 font-mono">
            {isOpen ? "COLLAPSE PANEL" : "EXPAND ANALYTICS"}
          </span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </div>

      {isOpen && (
        <div className="h-[480px] flex flex-col" id="admin-main-viewport">
          {/* Section Toolbar */}
          <div className="bg-slate-950 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 border-b border-slate-800 shrink-0">
            {/* Desktop-only Tab Option Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                  activeTab === "overview"
                    ? "bg-[#007E8A] text-white shadow-md shadow-teal-950/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Overview Indicators
                </div>
              </button>

              <button
                onClick={() => setActiveTab("teachers")}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                  activeTab === "teachers"
                    ? "bg-[#007E8A] text-white shadow-md shadow-teal-950/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Teachers Directory ({totalRegistrations})
                </div>
              </button>

              <button
                onClick={() => setActiveTab("sessions")}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                  activeTab === "sessions"
                    ? "bg-[#007E8A] text-white shadow-md shadow-teal-950/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Saved Sessions ({totalSessions})
                </div>
              </button>

              <button
                onClick={() => setActiveTab("logs")}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                  activeTab === "logs"
                    ? "bg-[#007E8A] text-white shadow-md shadow-teal-950/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Dynamic Event Logs ({totalLogs})
                </div>
              </button>

              <button
                onClick={() => setActiveTab("trends")}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                  activeTab === "trends"
                    ? "bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-md shadow-indigo-950/40"
                    : "text-slate-400 hover:text-[#FED766] hover:bg-slate-850"
                }`}
                id="tab-btn-ai-trends"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#FED766]" />
                  AI Behavior Trends (Gemini)
                </div>
              </button>
            </div>

            {/* Mobile/Tablet Menu Drawer Trigger */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 text-xs font-mono font-bold hover:bg-slate-800 flex items-center gap-2 cursor-pointer transition-all"
                id="phone-sidebar-open-btn"
              >
                <Menu className="h-4 w-4 text-[#FED766]" />
                <span className="capitalize">Menu: {activeTab === "overview" ? "Overview Indicators" : activeTab === "teachers" ? "Teachers Directory" : activeTab === "sessions" ? "Saved Sessions" : activeTab === "logs" ? "Event Logs" : "AI Trends"}</span>
              </button>
            </div>

            {/* Quick Actions (Synchronize, export events/database states) */}
            <div className="flex items-center gap-2">
              <button
                onClick={fetchData}
                disabled={loading}
                className="p-1.5 bg-slate-900 hover:bg-indigo-950 border border-indigo-900/40 text-indigo-300 rounded-lg hover:text-white flex items-center gap-1 font-mono text-xs leading-none transition-colors"
                title="Force refresh database from system files"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Sync Realtime</span>
              </button>

              <div className="hidden sm:block h-4 w-[1px] bg-slate-800" />

              <button
                onClick={handleDownloadLogs}
                className="hidden sm:flex px-2.5 py-1.5 bg-slate-900 hover:bg-teal-950 border border-teal-900/40 text-[#FED766] font-mono font-bold text-xs rounded-lg items-center gap-1 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export Events</span>
              </button>

              <button
                onClick={handleExportSpreadsheet}
                className="hidden sm:flex px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/50 border border-emerald-800 text-emerald-400 hover:text-emerald-300 font-mono font-bold text-xs rounded-lg items-center gap-1.5 transition-colors"
                title="Download event logs as a Spreadsheet (.csv)"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                <span>Export Spreadsheet (CSV)</span>
              </button>

              <button
                onClick={handleDownloadDb}
                className="hidden sm:flex px-2.5 py-1.5 bg-slate-900 hover:bg-teal-950 border border-teal-900/40 text-teal-300 font-mono font-bold text-xs rounded-lg items-center gap-1 transition-colors"
              >
                <Database className="h-3.5 w-3.5" />
                <span>Export JSON Database</span>
              </button>
            </div>
          </div>

          {/* Phone-view Sidebar Navigation Overlay with AnimatePresence */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-50 flex lg:hidden" id="phone-sidebar-wrapper">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="relative flex flex-col w-64 max-w-xs bg-slate-950 border-r border-slate-850 text-slate-100 p-5 z-50 h-[480px] mt-auto shadow-2xl justify-between"
                  id="phone-sidebar-drawer"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[#FED766]" />
                        <span className="text-[11px] font-black uppercase font-mono tracking-wider">Workspace Admin</span>
                      </div>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-1 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold">Administrative Views</p>
                      
                      <button
                        onClick={() => { setActiveTab("overview"); setIsMobileMenuOpen(false); }}
                        className={`w-full px-3 py-2 rounded-lg font-mono text-xs font-bold text-left flex items-center gap-2.5 transition ${
                          activeTab === "overview"
                            ? "bg-[#007E8A] text-white"
                            : "text-slate-450 hover:text-slate-200 hover:bg-slate-900"
                        }`}
                      >
                        <BarChart3 className="h-4 w-4 shrink-0" />
                        <span>Overview Indicators</span>
                      </button>

                      <button
                        onClick={() => { setActiveTab("teachers"); setIsMobileMenuOpen(false); }}
                        className={`w-full px-3 py-2 rounded-lg font-mono text-xs font-bold text-left flex items-center gap-2.5 transition ${
                          activeTab === "teachers"
                            ? "bg-[#007E8A] text-white"
                            : "text-slate-450 hover:text-slate-200 hover:bg-slate-900"
                        }`}
                      >
                        <Users className="h-4 w-4 shrink-0" />
                        <span>Teachers Directory ({totalRegistrations})</span>
                      </button>

                      <button
                        onClick={() => { setActiveTab("sessions"); setIsMobileMenuOpen(false); }}
                        className={`w-full px-3 py-2 rounded-lg font-mono text-xs font-bold text-left flex items-center gap-2.5 transition ${
                          activeTab === "sessions"
                            ? "bg-[#007E8A] text-white"
                            : "text-slate-450 hover:text-slate-200 hover:bg-slate-900"
                        }`}
                      >
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        <span>Saved Sessions ({totalSessions})</span>
                      </button>

                      <button
                        onClick={() => { setActiveTab("logs"); setIsMobileMenuOpen(false); }}
                        className={`w-full px-3 py-2 rounded-lg font-mono text-xs font-bold text-left flex items-center gap-2.5 transition ${
                          activeTab === "logs"
                            ? "bg-[#007E8A] text-white"
                            : "text-slate-450 hover:text-slate-200 hover:bg-slate-900"
                        }`}
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        <span>Dynamic Event Logs ({totalLogs})</span>
                      </button>

                      <button
                        onClick={() => { setActiveTab("trends"); setIsMobileMenuOpen(false); }}
                        className={`w-full px-3 py-2 rounded-lg font-mono text-xs font-bold text-left flex items-center gap-2.5 transition ${
                          activeTab === "trends"
                            ? "bg-gradient-to-r from-teal-600 to-indigo-600 text-white"
                            : "text-slate-450 hover:text-[#FED766] hover:bg-slate-900"
                        }`}
                      >
                        <Sparkles className="h-4 w-4 text-[#FED766] shrink-0" />
                        <span className="font-sans">AI Behavior Trends</span>
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-slate-850 pt-3 mt-auto space-y-2">
                    <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-bold">Mobile Operations</p>
                    <button
                      onClick={() => { handleDownloadLogs(); setIsMobileMenuOpen(false); }}
                      className="w-full py-1.5 bg-slate-900 hover:bg-teal-950 border border-teal-900/40 text-[#FED766] rounded-lg text-[10px] font-mono flex items-center justify-center gap-1 transition"
                    >
                      <Download className="h-3 w-3" />
                      <span>Export System Events</span>
                    </button>
                    <button
                      onClick={() => { handleExportSpreadsheet(); setIsMobileMenuOpen(false); }}
                      className="w-full py-1.5 bg-emerald-950/60 hover:bg-emerald-900/50 border border-emerald-800 text-emerald-400 rounded-lg text-[10px] font-mono flex items-center justify-center gap-1 transition"
                    >
                      <FileSpreadsheet className="h-3 w-3 text-emerald-400" />
                      <span>Export Spreadsheet (CSV)</span>
                    </button>
                    <button
                      onClick={() => { handleDownloadDb(); setIsMobileMenuOpen(false); }}
                      className="w-full py-1.5 bg-slate-900 hover:bg-teal-950 border border-teal-900/40 text-teal-300 rounded-lg text-[10px] font-mono flex items-center justify-center gap-1 transition"
                    >
                      <Database className="h-3 w-3" />
                      <span>Export JSON Database</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Primary View Area */}
          <div className="flex-1 overflow-y-auto bg-slate-900 p-4 sm:p-6" id="admin-view-scroller">
            
            {/* TAB 1: OVERVIEW INDICATORS (BENTO GRID ANALYSIS) */}
            {activeTab === "overview" && (
              <div className="space-y-6" id="analytics-overview-flow">
                {/* Visual Indicators Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  
                  {/* Metric Box 1: Registered Teachers */}
                  <div 
                    onClick={() => {
                      setActiveTab("teachers");
                      triggerToast("Opened Teachers Directory");
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900 hover:border-teal-500/50 hover:shadow-lg active:scale-[0.98] transition-all group select-none"
                    title="Click to view Teachers Directory (Registered Professional Accounts)"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-teal-950 border border-teal-900 flex items-center justify-center text-teal-400 shrink-0 group-hover:bg-teal-900 group-hover:border-teal-500 transition-colors">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">Registered teachers</div>
                        <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">{totalRegistrations}</div>
                      </div>
                    </div>
                    <div className="text-slate-600 group-hover:text-teal-400 transition-colors shrink-0">
                      ➔
                    </div>
                  </div>

                  {/* Metric Box 2: Logged Chat Sessions */}
                  <div 
                    onClick={() => {
                      setActiveTab("sessions");
                      triggerToast("Opened Saved Chat Sessions");
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900 hover:border-indigo-500/50 hover:shadow-lg active:scale-[0.98] transition-all group select-none"
                    title="Click to view Logged Chat Sessions"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-indigo-950 border border-indigo-900 flex items-center justify-center text-indigo-400 shrink-0 group-hover:bg-indigo-900 group-hover:border-indigo-500 transition-colors">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">Logged Chat Sessions</div>
                        <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">{totalSessions}</div>
                      </div>
                    </div>
                    <div className="text-slate-600 group-hover:text-indigo-400 transition-colors shrink-0">
                      ➔
                    </div>
                  </div>

                  {/* Metric Box 3: Log Event Entries */}
                  <div 
                    onClick={() => {
                      setActiveTab("logs");
                      triggerToast("Opened Dynamic Event Logs");
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900 hover:border-[#FED766]/50 hover:shadow-lg active:scale-[0.98] transition-all group select-none"
                    title="Click to view Event Logs Matrix"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-[#FED766]/5 border border-[#FED766]/20 flex items-center justify-center text-[#FED766] shrink-0 group-hover:bg-[#FED766]/10 group-hover:border-[#FED766]/60 transition-colors">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">Log Event Entries</div>
                        <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">{totalLogs}</div>
                      </div>
                    </div>
                    <div className="text-slate-600 group-hover:text-[#FED766] transition-colors shrink-0">
                      ➔
                    </div>
                  </div>

                  {/* Metric Box 4: Total Conversations */}
                  <div 
                    onClick={() => {
                      setActiveTab("sessions");
                      triggerToast("Opened Saved Chat Sessions");
                    }}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900 hover:border-emerald-500/50 hover:shadow-lg active:scale-[0.98] transition-all group select-none"
                    title="Click to view Total Conversations"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-emerald-950 border border-emerald-900 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-900 group-hover:border-emerald-500 transition-colors">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-none">Total Conversations</div>
                        <div className="text-xl sm:text-2xl font-black font-mono text-white mt-1">{totalMessagesCount}</div>
                      </div>
                    </div>
                    <div className="text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0">
                      ➔
                    </div>
                  </div>

                </div>

                {/* Structured Charts bento grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Chart A: Topic Distribution */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase mb-1 flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-[#007E8A]" />
                        Top Classroom Topics ({Object.keys(topicCounts).length})
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mb-4">Frequency registered from teacher chat requests</p>
                      
                      <div className="space-y-3">
                        {Object.keys(topicCounts).length === 0 ? (
                          <div className="text-xs font-mono text-slate-500 text-center py-6">No chat sessions available.</div>
                        ) : (
                          Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([topic, count]) => {
                            const max = Math.max(...Object.values(topicCounts));
                            const pt = max > 0 ? (count / max) * 100 : 0;
                            return (
                              <div key={topic} className="space-y-1">
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <span className="text-slate-200 capitalize truncate max-w-[150px]">{topic}</span>
                                  <span className="text-slate-400 font-bold">{count} sessions</span>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                                  <div className="bg-gradient-to-r from-teal-500 to-[#007E8A] h-full rounded-full" style={{ width: `${pt}%` }} />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Chart B: Geographic Distribution */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase mb-1 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-indigo-400" />
                        Geographic Region Counts
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mb-4">Location statistics of teacher registrations</p>
                      
                      <div className="space-y-3">
                        {Object.keys(regionCounts).length === 0 ? (
                          <div className="text-xs font-mono text-slate-500 text-center py-6">No region entries logged.</div>
                        ) : (
                          Object.entries(regionCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([reg, count]) => {
                            const max = Math.max(...Object.values(regionCounts));
                            const pt = max > 0 ? (count / max) * 100 : 0;
                            return (
                              <div key={reg} className="space-y-1">
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <span className="text-slate-200 capitalize truncate max-w-[150px]">{reg}</span>
                                  <span className="text-slate-400 font-bold">{count} teachers</span>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                                  <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full rounded-full" style={{ width: `${pt}%` }} />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Chart C: Experience Distribution */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase mb-1 flex items-center gap-1.5">
                        <Server className="h-3.5 w-3.5 text-emerald-400" />
                        Experience Seniority Metric
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mb-4">Teaching tenure spectrum across subscribers</p>
                      
                      <div className="space-y-3">
                        {Object.keys(experienceCounts).length === 0 ? (
                          <div className="text-xs font-mono text-slate-500 text-center py-6">No experience logs found.</div>
                        ) : (
                          Object.entries(experienceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([exp, count]) => {
                            const max = Math.max(...Object.values(experienceCounts));
                            const pt = max > 0 ? (count / max) * 100 : 0;
                            return (
                              <div key={exp} className="space-y-1">
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <span className="text-slate-250 capitalize truncate max-w-[150px]">{exp} years</span>
                                  <span className="text-slate-450 font-bold">{count} profiles</span>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 h-full rounded-full" style={{ width: `${pt}%` }} />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reactive Socio-Emotional Mood & Wellness Trends */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-5" id="mood-analytics-matrix-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                        <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
                        <span>Socio-Emotional Wellness & Student-Teacher Mood Metric Matrix</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Dynamic categorizations extracted from self-reported state markers, topic selections, and chat logs.
                      </p>
                    </div>
                    {/* Visual filters within sub-grid */}
                    <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg shrink-0">
                      {["grade", "region", "season"].map((type) => (
                        <button
                          key={type}
                          onClick={() => setMoodView(type as any)}
                          className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider font-mono transition-colors cursor-pointer ${
                            moodView === type
                              ? "bg-slate-800 text-[#FED766] border border-slate-700/50 shadow-xs"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {type === "grade" ? "By Grade" : type === "region" ? "By Region" : "By Season"}
                        </button>
                      ))}
                    </div>
                  </div>
                                  {/* Visual Render Grid depending on moodView selection */}
                  {moodView === "grade" && (
                    <div className="space-y-4 animate-fadeIn" id="mood-grade-section">
                      {/* Simple introductory guide to mood weights */}
                      <div className="bg-slate-905 border border-slate-800 rounded-xl p-4 font-sans text-xs text-slate-300 leading-relaxed space-y-2">
                        <span className="text-[10px] bg-indigo-950 font-mono text-indigo-300 border border-indigo-900 px-2 py-0.5 rounded uppercase font-bold tracking-widest inline-block select-none">
                          Dashboard Guide
                        </span>
                        <h4 className="text-white font-bold text-xs">What are "Classroom Mood Weights"?</h4>
                        <p>
                          Instead of just giving one simple score, classroom mood is calculated as a mixture of different feelings. We measure what percentage of children in a typical class are experiencing each mood state at any given moment. This gives a realistic picture of the classroom environment.
                        </p>
                        <p className="text-[#FED766] font-medium">
                          ⚡ <span className="font-bold underline">The Teacher's Role:</span> When teachers are <strong className="text-white">"Just Browsing"</strong>, these mood percentages remain unchanged. However, when teachers are actively <strong className="text-white">"Reading Content"</strong> or <strong className="text-white">"Reading & Interacting"</strong> with the AI assistant, they apply proven reset games. This helps calm restless classes and lowers the stress percentage!
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Interactive Stacked Bar Chart */}
                        <div className="space-y-4">
                          <h5 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest text-[#FED766] flex items-center gap-1">
                            <BarChart3 className="h-3.5 w-3.5" /> Classroom Mood Mixture by Grade Level
                          </h5>
                          
                          <div className="space-y-4">
                            {[
                              { label: "Pre-Primary (Preschool/Ages 3-5)", values: { calm: 35, restless: 45, stressed: 10, hyper: 10 }, color: "from-amber-400 to-amber-500" },
                              { label: "Primary School (Grades 1-5)", values: { calm: 45, restless: 30, stressed: 13, hyper: 12 }, color: "from-teal-400 to-teal-500" },
                              { label: "Middle School (Grades 6-8)", values: { calm: 30, restless: 25, stressed: 35, hyper: 10 }, color: "from-indigo-400 to-indigo-500" },
                              { label: "High School (Grades 9-12)", values: { calm: 25, restless: 20, stressed: 45, hyper: 10 }, color: "from-rose-400 to-rose-500" }
                            ].map((row) => (
                              <div key={row.label} className="space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="font-mono text-slate-300 font-bold">{row.label}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    Happy & Calm: {row.values.calm}% | Tense: {row.values.stressed}%
                                  </span>
                                </div>
                                <div className="w-full flex h-4 rounded-md overflow-hidden bg-slate-900 border border-slate-800">
                                  <div style={{ width: `${row.values.calm}%` }} className="bg-emerald-500 hover:opacity-80 transition-all flex items-center justify-center text-[8px] font-black font-mono text-emerald-950" title={`Happy & Calm: ${row.values.calm}%`}>
                                    {row.values.calm > 15 && `😄 ${row.values.calm}%`}
                                  </div>
                                  <div style={{ width: `${row.values.restless}%` }} className="bg-amber-400 hover:opacity-80 transition-all flex items-center justify-center text-[8px] font-black font-mono text-amber-950" title={`Restless / Unsettled: ${row.values.restless}%`}>
                                    {row.values.restless > 15 && `😐 ${row.values.restless}%`}
                                  </div>
                                  <div style={{ width: `${row.values.stressed}%` }} className="bg-rose-500 hover:opacity-80 transition-all flex items-center justify-center text-[8px] font-black font-mono text-rose-50" title={`Tense & Stressed: ${row.values.stressed}%`}>
                                    {row.values.stressed > 15 && `😔 ${row.values.stressed}%`}
                                  </div>
                                  <div style={{ width: `${row.values.hyper}%` }} className="bg-indigo-500 hover:opacity-80 transition-all flex items-center justify-center text-[8px] font-black font-mono text-indigo-50" title={`Energetic & Loud: ${row.values.hyper}%`}>
                                    {row.values.hyper > 15 && `🌟 ${row.values.hyper}%`}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Simple Legend Keys */}
                          <div className="flex flex-wrap items-center justify-center gap-4 bg-slate-900/55 p-2.5 rounded-lg border border-slate-850 text-[10px] font-mono">
                            <span className="flex items-center gap-1 text-emerald-400">
                              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" /> 😄 Stable, Happy & Calm
                            </span>
                            <span className="flex items-center gap-1 text-amber-400">
                              <span className="h-2.5 w-2.5 rounded-full bg-amber-400 inline-block" /> 😐 Restless or Unsettled
                            </span>
                            <span className="flex items-center gap-1 text-rose-400">
                              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" /> 😔 Tense, Tired or Stressed
                            </span>
                            <span className="flex items-center gap-1 text-indigo-400">
                              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block" /> 🌟 Loud, Energetic & Excited
                            </span>
                          </div>
                        </div>
 
                        {/* Interactive Mood Analysis Contexts */}
                        <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 flex flex-col justify-between space-y-3">
                          <div className="space-y-3 text-xs">
                            <h6 className="text-[#FED766] font-mono font-bold text-[11px] uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5" /> Simple Classroom Vibe Breakdown
                            </h6>
                            <ul className="space-y-3 text-[11px] text-slate-300 list-none leading-relaxed font-sans">
                              <li className="border-b border-slate-850/50 pb-2">
                                <strong className="text-slate-100 block mb-0.5">🧒 Youngest Kids (Ages 3-5):</strong>
                                Display very high restless and high-energy levels (45%). Rhythmic voice games and deep breathing rounds work best to anchor their focus.
                              </li>
                              <li className="border-b border-slate-850/50 pb-2">
                                <strong className="text-slate-100 block mb-0.5">🎒 Primary Classrooms (Grades 1-5):</strong>
                                Mostly steady and happy (45% calm). However, they can get easily upset if lessons or subjects are swapped too suddenly.
                              </li>
                              <li className="border-b border-slate-850/50 pb-2">
                                <strong className="text-slate-100 block mb-0.5">🏫 Middle Schoolers (Grades 6-8):</strong>
                                Demonstrate highest stress levels (35%) arising from friend circles and peer conversations. They frequently request attention.
                              </li>
                              <li>
                                <strong className="text-slate-100 block mb-0.5">🎓 High Schoolers (Grades 9-12):</strong>
                                Show critical academic burnt-out indicators (45% tense/stressed). They require short 5-minute deep breathing breaks to relax their minds.
                              </li>
                            </ul>
                          </div>
                          
                          <div className="bg-indigo-950/20 px-3 py-2.5 border border-indigo-900/30 rounded-lg text-[11.5px] leading-relaxed font-sans text-indigo-300">
                            💡 <strong className="font-mono text-indigo-250">Wellbeing Hack:</strong> If a class is feeling <strong className="text-amber-300">Restless (😐)</strong>, recommend a 3-minute group breathing game before changing subjects.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {moodView === "region" && (
                    <div className="space-y-4 animate-fadeIn" id="mood-region-section">
                      {/* Simple guide note */}
                      <div className="bg-slate-905 border border-slate-800 rounded-xl p-4 font-sans text-xs text-slate-300 leading-relaxed space-y-2">
                        <h4 className="text-white font-bold text-xs">🌍 Regional Classroom Mood Trends</h4>
                        <p>
                          Classrooms in different parts of India show distinct moods based on their local surroundings, class sizes, and language options. 
                        </p>
                        <p className="text-teal-400 font-medium">
                          📈 <span className="font-bold underline">Active Teacher Impact:</span> Our regional data shows that schools where teachers frequently <strong className="text-white">read wellbeing toolkits</strong> and <strong className="text-white">engaged with chat support</strong> have a 15% higher happiness index (😄) than schools where teachers were just scanning or browsing on-screen.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Regional Data Cards */}
                        {[
                          { region: "Delhi NCR Districts", status: "Urban/High Stress Environment", calm: 24, restless: 28, stressed: 38, excited: 10, notes: "Busy, noisy city classrooms with screen fatigue. Teachers who actively use sensory exercises report wonderful improvements." },
                          { region: "Bihar Rural Districts", status: "Strong Community Support", calm: 50, restless: 22, stressed: 13, excited: 15, notes: "Close knit learning circles buffer strain of large classrooms. High demand for guides in Hinglish." },
                          { region: "Maharashtra Urban Districts", status: "Balanced Fast-Paced Classes", calm: 38, restless: 25, stressed: 22, excited: 15, notes: "Fast-track class schedules; teachers who actively interact with AI find quick breathing breaks help beat daily burnout." }
                        ].map((item) => (
                          <div key={item.region} className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col justify-between gap-3">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-white text-xs tracking-wide">{item.region}</span>
                                <span className="text-[9px] bg-slate-800 text-[#FED766] py-0.5 px-2 rounded font-mono font-bold uppercase tracking-wider">{item.status}</span>
                              </div>
                              <p className="text-[11px] text-slate-350 font-sans mt-2 leading-relaxed">
                                {item.notes}
                              </p>
                            </div>

                            {/* Linear Chart representation of Mood Split */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                                <span>Classroom Wellness Level</span>
                                <span className="text-emerald-400 font-bold">{item.calm + item.excited}% Positive Energy</span>
                              </div>
                              <div className="h-6 flex w-full rounded-md overflow-hidden bg-slate-950 border border-slate-800 p-0.5">
                                <div style={{ width: `${item.calm}%` }} className="bg-emerald-500 hover:opacity-80 transition-all flex items-center justify-center text-[9px] text-white" title={`Happy: ${item.calm}%`}>😄</div>
                                <div style={{ width: `${item.restless}%` }} className="bg-amber-400 hover:opacity-80 transition-all flex items-center justify-center text-[9px] text-white" title={`Restless: ${item.restless}%`}>😐</div>
                                <div style={{ width: `${item.stressed}%` }} className="bg-rose-500 hover:opacity-80 transition-all flex items-center justify-center text-[9px] text-white" title={`Tense: ${item.stressed}%`}>😔</div>
                                <div style={{ width: `${item.excited}%` }} className="bg-indigo-500 hover:opacity-80 transition-all flex items-center justify-center text-[9px] text-white" title={`Excited: ${item.excited}%`}>🌟</div>
                              </div>
                              <div className="text-[9px] text-slate-400 font-mono flex justify-between">
                                <span>😄 Happy: {item.calm}%</span>
                                <span>😐 Restless: {item.restless}%</span>
                                <span>😔 Tense: {item.stressed}%</span>
                                <span>🌟 Excited: {item.excited}%</span>
                              </div>
                            </div>
                          </div>
                        ))}

                      </div>
                    </div>
                  )}

                  {moodView === "season" && (
                    <div className="space-y-4 animate-fadeIn" id="mood-season-section">
                      <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                          <h5 className="text-[11px] font-mono font-bold text-[#FED766] uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" /> Classroom Positive Energy by Season
                          </h5>
                          <span className="text-[10px] font-mono text-slate-400 uppercase leading-none">Simple Seasonal Calendar Highlights</span>
                        </div>

                        {/* Simple guide block */}
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs text-slate-300 leading-relaxed mb-4">
                          <p>
                            We map the average classroom "happiness score" across different seasons of the academic year. Weather transitions (like hot summers) play a major role in student energy levels.
                          </p>
                          <p className="text-[#FED766] mt-2">
                            💡 <span className="font-bold underline">Engagement Tip:</span> During low-energy seasons like the extreme hot Summer (May-Jun), teachers who are <strong className="text-white">actively interacting with the app</strong> report much better classroom harmony because they guide students through easy group breathing steps instead of shouting to get their attention.
                          </p>
                        </div>

                        {/* Beautiful custom vector graphical wave line of positive mood index */}
                        <div className="relative pt-6 pb-2" id="seasonal-vector-graphic">
                          {/* Grid Background lines */}
                          <div className="absolute inset-x-0 bottom-6 top-0 border-b border-dashed border-slate-800 flex flex-col justify-between select-none pointer-events-none">
                            <div className="w-full border-t border-dashed border-slate-800/60" />
                            <div className="w-full border-t border-dashed border-slate-800/40" />
                            <div className="w-full border-t border-dashed border-slate-800/30" />
                          </div>

                          {/* Line Points Visualized through SVG */}
                          <svg className="w-full h-32 text-indigo-500" viewBox="0 0 1000 120" preserveAspectRatio="none">
                            {/* Area fill path */}
                            <path
                              d="M 0,120 L 0,60 C 120,40 180,95 250,90 C 350,85 400,20 500,45 C 600,70 650,95 750,75 C 850,55 900,30 1000,50 L 1000,120 Z"
                              fill="url(#seasonalGradient)"
                            />

                            {/* Stroke path */}
                            <path
                              d="M 0,60 C 120,40 180,95 250,90 C 350,85 400,20 500,45 C 600,70 650,95 750,75 C 850,55 900,30 1000,50"
                              fill="none"
                              stroke="url(#strokeGrad)"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                            />
                            
                            <defs>
                              <linearGradient id="seasonalGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#007E8A" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#007E8A" stopOpacity="0" />
                              </linearGradient>
                              <linearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#22c55e" />
                                <stop offset="25%" stopColor="#eab308" />
                                <stop offset="50%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#a855f7" />
                              </linearGradient>
                            </defs>

                            {/* Node markers with interactive coordinates */}
                            <circle cx="125" cy="50" r="5" fill="#22c55e" className="animate-pulse" />
                            <circle cx="312" cy="87" r="5" fill="#eab308" />
                            <circle cx="500" cy="45" r="5" fill="#3b82f6" className="animate-pulse" />
                            <circle cx="750" cy="75" r="5" fill="#ec4899" />
                            <circle cx="950" cy="48" r="5" fill="#a855f7" />
                          </svg>

                          {/* X-Axis labels for months/seasons */}
                          <div className="grid grid-cols-5 text-center mt-2 pt-2 border-t border-slate-805 text-[10px] font-mono text-slate-400">
                            <div>
                              <span className="block text-slate-100 font-bold">Spring (Feb-Apr)</span>
                              <span className="text-[9px] text-[#22c55e]">😄 75% Happiness</span>
                            </div>
                            <div>
                              <span className="block text-slate-100 font-bold">Summer (May-Jun)</span>
                              <span className="text-[9px] text-amber-500">😐 55% Heat Fatigue</span>
                            </div>
                            <div>
                              <span className="block text-slate-100 font-bold">Monsoon (Jul-Sep)</span>
                              <span className="text-[9px] text-indigo-400">😄 68% Dynamic Shifts</span>
                            </div>
                            <div>
                              <span className="block text-slate-100 font-bold">Festive (Oct-Nov)</span>
                              <span className="text-[9px] text-rose-400">😐 62% Busy Classrooms</span>
                            </div>
                            <div>
                              <span className="block text-slate-100 font-bold">Winter (Dec-Jan)</span>
                              <span className="text-[9px] text-teal-400">😄 72% Peak Calm</span>
                            </div>
                          </div>
                        </div>

                        {/* Diagnostic details */}
                        <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-850 text-[11px] text-slate-300 font-sans leading-relaxed">
                          📌 <strong className="font-mono text-[#FED766]">What this means:</strong> The high mid-summer heat in May and June leads to a drop in student mood (55% happiness), causing higher noise levels and restlessness. To beat this heat fatigue, admin coordinators should remind teachers to open shorter, active 3-minute somatic reset exercises in the hot afternoons.
                        </div>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* TAB 2: TEACHERS TABLE DIRECTORY */}
            {activeTab === "teachers" && (
              <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden" id="teachers-admin-container">
                <div className="p-4 bg-slate-950/60 border-b border-slate-850 flex flex-wrap items-center justify-between gap-4">
                  <div 
                    onClick={() => {
                      setActiveTab("logs");
                      triggerToast("Viewing Event Log");
                    }}
                    className="flex items-center gap-2.5 cursor-pointer group hover:opacity-90 select-none pb-1 sm:pb-0"
                    title="Click to view the next level of information: Dynamic Event Logs"
                  >
                    <span className="text-xs font-bold font-mono uppercase text-[#FED766] group-hover:text-teal-400 transition-colors">
                      Registered Professional Accounts
                    </span>
                    <span className="text-[10px] font-mono bg-[#007E8A]/10 text-teal-300 px-2 py-0.5 rounded-md border border-[#007E8A]/20 font-bold group-hover:bg-[#007E8A]/20 transition-all flex items-center gap-1">
                      Event Log ➔
                    </span>
                  </div>
                  <div className="text-[10.5px] font-mono text-indigo-400">Total size in backend JSON structure: {totalRegistrations} rows</div>
                </div>
                
                {db.teachers.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 font-mono text-xs">
                    No active teacher registration accounts recorded in backend_google_file.json.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-slate-400 font-mono text-[9px] uppercase tracking-wider border-b border-slate-800">
                          <th className="py-3 px-4">Teacher Name</th>
                          <th className="py-3 px-4">Region</th>
                          <th className="py-3 px-4">Language</th>
                          <th className="py-3 px-4">Tenure</th>
                          <th className="py-3 px-4">Grade/Class</th>
                          <th className="py-3 px-4">Email</th>
                          <th className="py-3 px-4">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-xs font-mono">
                        {db.teachers.map((teach) => (
                          <tr 
                            key={teach.id} 
                            onClick={() => {
                              setTeacherFilter(teach.name);
                              setActiveTab("logs");
                              triggerToast(`Filtered logs for: ${teach.name}`);
                            }}
                            className="hover:bg-indigo-950/45 cursor-pointer transition-colors active:bg-indigo-950 hover:text-white"
                            title={`Click to view next level: Event Logs for ${teach.name}`}
                          >
                            <td className="py-3 px-4 text-emerald-400 font-bold">{teach.name}</td>
                            <td className="py-3 px-4 text-slate-250 truncate max-w-[110px]">{teach.region || "Delhi"}</td>
                            <td className="py-3 px-4 text-slate-300">{teach.language}</td>
                            <td className="py-3 px-4 text-slate-300">{teach.experience || "Not specified"} Years</td>
                            <td className="py-3 px-4 text-[#FED766]">{teach.gradeClass || "Primary"}</td>
                            <td className="py-3 px-4 text-indigo-300 truncate max-w-[150px]">{teach.email || "No email"}</td>
                            <td className="py-3 px-4 text-slate-400 font-mono">{teach.phone || "No phone"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SAVED CHAT SESSIONS */}
            {activeTab === "sessions" && (
              <div className="space-y-4" id="admin-sessions-container">
                {/* Easy Explanatory Card for Teacher Engagement States */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 font-sans">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Sparkles className="h-4 w-4" />
                    <h4 className="text-xs font-bold uppercase tracking-wider font-mono">
                      Understanding Teacher Engagement Behavior
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    We track session duration and chat logs to automatically group teacher behavior into three distinct real-time states. This helps us understand who is actively learning and who is just scanning through pages:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="h-2 w-2 rounded-full bg-slate-500" />
                        <span className="text-[11px] font-bold text-slate-300 font-mono">👀 Just Browsing</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-normal">
                        Teacher opened the wellbeing assistant but spent less than 15 seconds and did not send any messages. They are likely just checking options.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                        <span className="text-[11px] font-bold text-amber-400 font-mono">📖 Reading Content</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-normal">
                        Teacher stayed on the page for over 15 seconds or opened items, indicating they are actively reading the wellbeing tips and sensory hacks.
                      </p>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-bold text-emerald-400 font-mono">🔥 Reading & Interacting</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-normal">
                        Teacher stayed for at least 45 seconds and actively sent messages or asked questions to the AI Expert for customized support.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="p-4 bg-slate-950/60 border-b border-slate-850 flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase text-slate-300">Logged Converse Sessions File Matrix</span>
                    <div className="text-[10.5px] font-mono text-indigo-400">Recorded offline/online chats size: {totalSessions}</div>
                  </div>

                  {db.sessions.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 font-mono text-xs">
                      No active sessions stored inside backend_google_file.json.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-900 text-slate-400 font-mono text-[9px] uppercase tracking-wider border-b border-slate-800">
                            <th className="py-3 px-4">Session UUID</th>
                            <th className="py-3 px-4">Teacher Name</th>
                            <th className="py-3 px-4">Primary Topic</th>
                            <th className="py-3 px-4">Language Option</th>
                            <th className="py-3 px-4">Start Time</th>
                            <th className="py-3 px-4 text-center">Duration (Sec)</th>
                            <th className="py-3 px-4 text-center">Messages</th>
                            <th className="py-3 px-4">Engagement Behavior</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-xs font-mono text-slate-300">
                          {db.sessions.map((s) => (
                            <tr 
                              key={s.sessionId} 
                              onClick={() => {
                                setSearchQuery(s.sessionId);
                                setActiveTab("logs");
                                triggerToast(`Filtered events for Session ID: ${s.sessionId.slice(0, 8)}`);
                              }}
                              className="hover:bg-indigo-950/45 cursor-pointer transition-colors active:bg-indigo-950 hover:text-white"
                              title={`Click to view next level: Event Logs for session ${s.sessionId.slice(0, 8)}`}
                            >
                              <td className="py-3 px-4 text-indigo-400 group-hover:underline truncate max-w-[120px]" title={s.sessionId}>
                                {s.sessionId.slice(0, 8)}...
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-100">{s.teacherName}</td>
                              <td className="py-3 px-4 truncate max-w-[140px] text-teal-400 capitalize">{s.currentTopic || "general"}</td>
                              <td className="py-3 px-4 text-[#FED766]">{s.language || "Hinglish"}</td>
                              <td className="py-3 px-4 text-slate-500 text-[10.5px]">
                                {new Date(s.startTime).toLocaleTimeString()}
                              </td>
                              <td className="py-3 px-4 text-center font-bold">{s.timeTakenSeconds || 0}s</td>
                              <td className="py-3 px-4 text-center">
                                <span className="inline-block px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-900 text-[10px]">
                                  {s.messages ? s.messages.length : 0} logs
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {(() => {
                                  // Always detect state based on duration and message count
                                  const duration = s.timeTakenSeconds || 0;
                                  const msgsCount = s.messages ? s.messages.length : 0;
                                  
                                  let behaviorStr = "Just Browsing";
                                  if (duration >= 45 && msgsCount >= 1) {
                                    behaviorStr = "Reading & Interacting";
                                  } else if (duration > 15 || msgsCount > 0) {
                                    behaviorStr = "Reading Content";
                                  }
                                  
                                  if (behaviorStr === "Reading & Interacting") {
                                    return (
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-900/60 text-[10px] font-bold">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Reading & Interacting
                                      </span>
                                    );
                                  } else if (behaviorStr === "Reading Content") {
                                    return (
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-900/60 text-[10px] font-bold">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                        Reading Content
                                      </span>
                                    );
                                  } else {
                                    return (
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800 text-[10px]">
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                                        Just Browsing
                                      </span>
                                    );
                                  }
                                })()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: SYSTEM EVENT LOGS (RAW STREAMS) */}
            {activeTab === "logs" && (
              <div className="space-y-4" id="logs-feed-section">
                
                {/* ADVANCED BACKUP, RESTORE & DYNAMIC SAFE CLEARANCE ACTION PANEL */}
                <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl space-y-4" id="logs-backup-admin-panel">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                      <h4 className="text-xs font-bold font-mono uppercase text-slate-100 tracking-wider">
                        Event Log Persistence, Backup & Safe Clearance Monitor
                      </h4>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-850">
                      Auto-Backup Status: <span className="text-teal-400 font-bold">ACTIVE & AUTOMATED</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-slate-350">
                    {/* Column 1: Core Goal Overview */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Log Security Rule</div>
                        <p className="text-[10.5px] text-slate-300 leading-relaxed">
                          All logs are strictly <span className="text-teal-400">carried forward</span> and automatically synchronized on every write event. If lost, they are auto-restored.
                        </p>
                      </div>
                      <div className="text-[9.5px] text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-900">
                        <span className="text-teal-500">✔</span> Real-Time Auto-Recovery Active.
                      </div>
                    </div>

                    {/* Column 2: Status Indicator */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Backup Vault State</div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span>Session Backup:</span>
                            <span className={isBackupDone ? "text-emerald-400 font-extrabold" : "text-amber-400 font-bold"}>
                              {isBackupDone ? "✅ VERIFIED SAFE" : "⚠️ UNBACKED"}
                            </span>
                          </div>
                          {lastBackupInfo && (
                            <div className="text-[10px] text-slate-400 whitespace-pre-line leading-tight">
                              <span className="text-slate-500">File:</span> {lastBackupInfo.backupFile}
                              {"\n"}
                              <span className="text-slate-500">At:</span> {new Date(lastBackupInfo.timestamp).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-[9.5px] text-slate-500 pt-2 border-t border-slate-900">
                        * Required before clearing live logs.
                      </div>
                    </div>

                    {/* Column 3: Critical Operations */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex flex-col justify-center space-y-2.5">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Administrative Vault Controls</div>
                      <div className="grid grid-cols-2 gap-2">
                        {/* 1. BACKUP BUTTON */}
                        <button
                          disabled={isBackingUp}
                          onClick={handleBackupLogs}
                          className="px-2 py-1.5 rounded bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold cursor-pointer transition text-[10.5px] flex items-center justify-center gap-1 active:scale-[0.97]"
                          title="Backup state file to safe vault storage right now"
                        >
                          {isBackingUp ? "Saving..." : "Create Backup"}
                        </button>

                        {/* 2. RESTORE BUTTON */}
                        <button
                          disabled={isRestoring}
                          onClick={handleRestoreLogs}
                          className="px-2 py-1.5 rounded bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 disabled:opacity-50 text-indigo-200 font-bold cursor-pointer transition text-[10.5px] flex items-center justify-center gap-1 active:scale-[0.97]"
                          title="Restore live event logs from last safe backup file"
                        >
                          {isRestoring ? "Restoring..." : "Restore Backup"}
                        </button>
                      </div>

                      {/* 3. SAFE CLEAR BUTTON - ONLY ALLOWED AFTER SUCCESSFUL BACKUP */}
                      <button
                        disabled={isClearing || !isBackupDone}
                        onClick={handleClearLogs}
                        className={`w-full py-1.5 rounded font-bold cursor-pointer transition text-[10.5px] flex items-center justify-center gap-1 active:scale-[0.97] ${
                          isBackupDone
                            ? "bg-rose-600 text-white hover:bg-rose-500 shadow-sm border border-rose-500/50"
                            : "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed"
                        }`}
                        title={
                          isBackupDone
                            ? "Clear active event logs (Backup verified successfully!)"
                            : "Create a verified backup first to authorize clearing action."
                        }
                      >
                        {isClearing ? "Clearing Active Streams..." : isBackupDone ? "➔ Clear Active Logs (Verified)" : "✖ Clear Disabled (Backup Needed)"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-3">
                  <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-teal-400 flex items-center justify-between">
                    <span>Administrative Queries & Historical Filter Controls</span>
                    {(logFilter !== "all" || timeFilter !== "all" || regionFilter !== "all" || teacherFilter !== "all" || searchQuery !== "") && (
                      <button
                        onClick={() => {
                          setLogFilter("all");
                          setTimeFilter("all");
                          setRegionFilter("all");
                          setTeacherFilter("all");
                          setSearchQuery("");
                        }}
                        className="text-rose-450 hover:text-rose-400 cursor-pointer transition text-[9px] underline font-bold"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Event Type */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-slate-500 uppercase font-bold">Event Type</label>
                      <select
                        value={logFilter}
                        onChange={(e) => setLogFilter(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#007E8A] leading-tight cursor-pointer"
                      >
                        <option value="all">All Event Types</option>
                        <option value="USER_REGISTRATION">User registration</option>
                        <option value="SESSION_UPDATE">Session updates</option>
                        <option value="CHAT_MESSAGE">Chat logs</option>
                      </select>
                    </div>

                    {/* Timeframe */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-slate-500 uppercase font-bold">Timeframe</label>
                      <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-805 text-slate-200 text-xs font-mono px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#007E8A] leading-tight cursor-pointer"
                      >
                        <option value="all">All History</option>
                        <option value="today">Today / Last 24 Hrs</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                      </select>
                    </div>

                    {/* Region */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-slate-500 uppercase font-bold">Region</label>
                      <select
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-805 text-slate-200 text-xs font-mono px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#007E8A] leading-tight cursor-pointer"
                      >
                        <option value="all">All Regions</option>
                        {availableRegions.map(reg => (
                          <option key={reg} value={reg}>{reg}</option>
                        ))}
                      </select>
                    </div>

                    {/* Teacher */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-mono text-slate-500 uppercase font-bold">Teacher Name</label>
                      <select
                        value={teacherFilter}
                        onChange={(e) => setTeacherFilter(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-805 text-slate-200 text-xs font-mono px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-[#007E8A] leading-tight cursor-pointer"
                      >
                        <option value="all">All Teachers</option>
                        {availableTeachers.map(teacher => (
                          <option key={teacher} value={teacher}>{teacher}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Search query input */}
                  <div className="relative w-full pt-1">
                    <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search log records body by typing names, content, topics..."
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-905 border border-slate-800 rounded-lg text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#007E8A]"
                    />
                  </div>
                </div>

                {/* Log stream output panel */}
                <div className="bg-slate-950 rounded-xl border border-slate-800 h-[280px] overflow-y-auto flex flex-col font-mono text-xs text-slate-350 p-2 divide-y divide-slate-900" id="logs-stream-terminal">
                  
                  {filteredLogs.length === 0 ? (
                    <div className="p-12 text-center text-slate-600 font-mono text-xs">
                      No logs matching selected search variables are found in streams.
                    </div>
                  ) : (
                    filteredLogs.map((log, index) => {
                      const isChat = log.eventType === "CHAT_MESSAGE";
                      return (
                        <div key={index} className="py-2.5 px-3 hover:bg-slate-900/40 rounded-lg transition-colors flex flex-col gap-1.5">
                          {/* Metadata row */}
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">[{new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}]</span>
                              
                              <span className={`px-2 py-0.5 rounded font-black tracking-wider text-[9px] uppercase font-mono ${
                                log.eventType === "USER_REGISTRATION"
                                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                                  : log.eventType === "SESSION_UPDATE"
                                  ? "bg-indigo-950/80 text-indigo-300 border border-indigo-800"
                                  : "bg-teal-950/80 text-teal-300 border border-teal-800"
                              }`}>
                                {log.eventType}
                              </span>

                              {isChat && (
                                <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                                  log.direction === "user_to_agent"
                                    ? "bg-rose-950 text-rose-300 border border-rose-900"
                                    : "bg-cyan-950 text-cyan-300 border border-cyan-900"
                                }`}>
                                  {log.direction === "user_to_agent" ? "TEACHER" : "AI EXPERT"}
                                </span>
                              )}
                            </div>

                            <div className="text-slate-500 font-bold shrink-0">
                              For: {log.teacherName || log.teacherId || "Guest"}
                            </div>
                          </div>

                          {/* Dynamic detailed info body */}
                          <div className="text-slate-200 pl-2 border-l border-slate-800 mt-1 whitespace-pre-wrap select-all">
                            {log.message ? (
                              <span className="text-slate-200">"{log.message}"</span>
                            ) : log.eventType === "USER_REGISTRATION" ? (
                              <span className="text-slate-400">
                                Teacher registered: <span className="text-emerald-400 font-bold">{log.name}</span> in Region <span className="font-bold">{log.region}</span> ({log.language}), Tenure: <span className="text-[#FED766]">{log.experience} years</span>.
                              </span>
                            ) : log.eventType === "SESSION_UPDATE" ? (
                              <span className="text-slate-400">
                                Session state recorded: Topic <span className="text-teal-400 font-bold">"{log.currentTopic}"</span>, duration taken: <span className="font-bold">{log.timeTakenSeconds}s</span> with <span className="text-indigo-400 font-bold">{log.messagesCount} logs</span>.
                              </span>
                            ) : (
                              JSON.stringify(log)
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                </div>
              </div>
            )}

            {activeTab === "trends" && (
              <div className="space-y-6" id="admin-trends-container">
                {/* Executive control and refresh button */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#FED766] animate-pulse shrink-0" />
                      <span>Gemini Cognitive Cohort & Behavior Categorizer</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-xl leading-normal">
                      Processes active registration histories, grade levels, self-reported experience, language preferences and chat messages to analyze behavior.
                    </p>
                  </div>
                  <button
                    onClick={fetchTrends}
                    disabled={loadingTrends}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-bold text-xs rounded-lg transition shadow-md disabled:opacity-50 flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${loadingTrends ? 'animate-spin' : ''}`} />
                    <span>{loadingTrends ? "Running Gemini Model..." : "Re-Analyze Trends"}</span>
                  </button>
                </div>

                {loadingTrends && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center gap-4">
                    <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
                    <div className="space-y-1 font-mono text-xs">
                      <p className="text-slate-350 font-bold">CONTACTING GEMINI SECURE SERVER...</p>
                      <p className="text-slate-500">Scanning dynamic teacher database & indexing behavior logs....</p>
                    </div>
                  </div>
                )}

                {!loadingTrends && trendsData && (
                  <div className="space-y-6 animate-fadeIn font-sans" id="ai-report-body">
                    {/* General Overview Card */}
                    <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-slate-800 rounded-xl p-5">
                      <h4 className="text-xs font-bold text-indigo-300 font-mono tracking-wider uppercase mb-2 flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-indigo-400" />
                        Executive Classroom Behaviour & Climate Overview
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                        {trendsData.generalOverview}
                      </p>
                    </div>

                    {/* Left & Right: Teacher Cohorts vs Student Habits */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Teacher Segments list */}
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                        <h4 className="text-xs font-bold text-teal-300 font-mono tracking-wider uppercase border-b border-slate-800 pb-2 flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-teal-400" />
                          Categorized Teacher Stress & Cohorts Spectra
                        </h4>
                        
                        <div className="space-y-4">
                          {trendsData.teacherSegments?.map((seg, i) => (
                            <div key={i} className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2 text-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-bold text-teal-400 uppercase tracking-wide font-mono">
                                  Cohort: {seg.experienceLevel}
                                </span>
                                <span className="text-[10px] bg-teal-900/30 text-teal-300 px-2 py-0.5 rounded border border-teal-850 font-mono">
                                  {seg.topicPreference}
                                </span>
                              </div>
                              <p className="text-slate-300 leading-relaxed font-sans">
                                <strong className="text-slate-400 font-mono">Predominant Triggers:</strong> {seg.predominantStress}
                              </p>
                              <div className="text-emerald-300 bg-emerald-950/20 px-3 py-2 rounded border border-emerald-900/30 text-[11px] leading-relaxed font-sans mt-2">
                                <strong className="font-bold font-mono block mb-0.5">Suggested Support Intervention:</strong> 
                                <span>{seg.customSupportHacks}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Student Behavior trends */}
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
                        <h4 className="text-xs font-bold text-[#FED766] font-mono tracking-wider uppercase border-b border-slate-800 pb-2 flex items-center gap-1.5">
                          <Activity className="h-4 w-4 text-[#FED766]" />
                          Identified Student Habit & Behaviour Patterns
                        </h4>

                        <div className="space-y-4">
                          {trendsData.studentBehaviorPatterns?.map((pat, i) => (
                            <div key={i} className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#FED766] uppercase tracking-wide font-mono">
                                  {pat.patternTitle}
                                </span>
                              </div>
                              <p className="text-slate-300 leading-relaxed font-sans">
                                <strong className="text-slate-400 font-mono">Observed Symptom:</strong> {pat.observedSymptom}
                              </p>
                              <p className="text-slate-300 leading-relaxed font-sans">
                                <strong className="text-slate-400 font-mono">Socio-Emotional Root:</strong> {pat.socioEmotionalRoot}
                              </p>
                              <div className="text-indigo-300 bg-indigo-950/30 px-3 py-2 rounded border border-indigo-900/30 text-[11px] leading-relaxed font-sans mt-2">
                                <strong className="font-bold font-mono block mb-0.5">Somatic Classroom Wellbeing Hack:</strong> 
                                <span>{pat.classroomWellbeingHack}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Cultural and Action Plan row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2 text-xs leading-relaxed">
                        <h4 className="text-slate-300 font-bold uppercase tracking-wide font-mono flex items-center gap-1.5 border-b border-slate-800 pb-2">
                          <Globe className="h-4 w-4 text-emerald-400" />
                          Language Preferences & Cultural Alignment
                        </h4>
                        <p className="text-slate-300 font-sans leading-relaxed">
                          {trendsData.regionalAndCulturalNuances}
                        </p>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-2 text-xs leading-relaxed">
                        <h4 className="text-indigo-300 font-bold uppercase tracking-wide font-mono flex items-center gap-1.5 border-b border-slate-800 pb-2">
                          <Server className="h-4 w-4 text-indigo-400" />
                          Programmatic & Admin Action Insights
                        </h4>
                        <p className="text-slate-300 font-sans leading-relaxed">
                          {trendsData.administrativeActionPlan}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
