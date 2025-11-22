import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Copy, Check, Database, Zap, Terminal, Activity } from "lucide-react";
import { toast } from "sonner";

interface QueryResult {
  success: boolean;
  question: string;
  sql: string;
  answer: string;
  summary?: string;
  data?: any[];
  rowCount?: number;
  meta?: any;
}

const Index = () => {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  const inputRef = useRef<HTMLInputElement>(null);

  const exampleQuestions = [
    "What's the stock of iPhone 13 in Mumbai?",
    "Total inventory valuation",
    "Products below reorder level",
    "Top 5 products by quantity",
    "List all warehouses",
  ];

  useEffect(() => {
    // Check backend connection
    const checkConnection = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/health");
        setConnectionStatus(response.ok ? "connected" : "disconnected");
      } catch {
        setConnectionStatus("disconnected");
      }
    };
    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:3000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        toast.success("Query executed successfully!");
      } else {
        toast.error("Query failed");
      }
    } catch (error) {
      toast.error("Failed to connect to backend");
      setResult({
        success: false,
        question,
        sql: "",
        answer: "Failed to connect to backend. Make sure the server is running on http://localhost:3000",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setQuestion(example);
    inputRef.current?.focus();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-secondary to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_hsl(270_70%_70%_/_0.1),_transparent_50%)]" />
        <ParticleField />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-md border border-border">
            <motion.div
              animate={{
                scale: connectionStatus === "connected" ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "checking"
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
            />
            <span className="text-sm text-foreground">
              {connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "checking"
                ? "Checking..."
                : "Disconnected"}
            </span>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 pt-20"
        >
          <motion.div
            animate={{
              textShadow: [
                "0 0 20px hsl(270 70% 70% / 0.5)",
                "0 0 40px hsl(270 70% 70% / 0.8)",
                "0 0 20px hsl(270 70% 70% / 0.5)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative inline-block"
          >
            <h1 className="text-7xl font-bold bg-gradient-to-r from-lavender via-accent to-lavender-light bg-clip-text text-transparent mb-4">
              Inventory Bot
            </h1>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -top-8 -right-8"
            >
              <Sparkles className="w-12 h-12 text-lavender" />
            </motion.div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-muted-foreground mt-4"
          >
            Ask questions in natural language, get instant SQL-powered answers
          </motion.p>
        </motion.div>

        {/* Query Input Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <div className="relative group">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-lavender via-accent to-lavender-light rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"
            />
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-4 mb-6">
                  <Terminal className="w-6 h-6 text-lavender" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask anything about your inventory..."
                    className="flex-1 bg-secondary/50 border border-border rounded-lg px-6 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-lavender transition-all"
                    disabled={loading}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="relative px-8 py-4 bg-gradient-to-r from-lavender to-accent text-primary-foreground rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                  >
                    <motion.div
                      animate={{ x: loading ? [0, 100, 0] : 0 }}
                      transition={{ duration: 1, repeat: loading ? Infinity : 0 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    />
                    <span className="relative flex items-center gap-2">
                      {loading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Zap className="w-5 h-5" />
                        </motion.div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      {loading ? "Processing..." : "Execute"}
                    </span>
                  </motion.button>
                </div>
              </form>

              {/* Example Questions */}
              <div className="flex flex-wrap gap-3">
                {exampleQuestions.map((example, index) => (
                  <motion.button
                    key={example}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleExampleClick(example)}
                    className="px-4 py-2 bg-secondary/50 hover:bg-secondary border border-border rounded-full text-sm text-foreground transition-all"
                  >
                    {example}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ type: "spring", damping: 20 }}
              className="max-w-6xl mx-auto space-y-6"
            >
              {/* Stats Cards */}
              {result.success && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard
                    icon={<Database className="w-6 h-6" />}
                    label="Rows Returned"
                    value={result.rowCount || 0}
                    delay={0}
                  />
                  <StatCard
                    icon={<Activity className="w-6 h-6" />}
                    label="Query Status"
                    value="Success"
                    delay={0.1}
                  />
                  <StatCard
                    icon={<Zap className="w-6 h-6" />}
                    label="Response Time"
                    value="<100ms"
                    delay={0.2}
                  />
                </div>
              )}

              {/* Answer Card */}
              <ResultCard title="Natural Language Answer">
                <TypewriterText text={result.answer} />
              </ResultCard>

              {/* SQL Query Card */}
              {result.sql && (
                <ResultCard title="Generated SQL Query">
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyToClipboard(result.sql)}
                      className="absolute top-2 right-2 p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-foreground" />
                      )}
                    </motion.button>
                    <pre className="bg-secondary/50 rounded-lg p-4 overflow-x-auto">
                      <code className="text-lavender-light text-sm font-mono">
                        {result.sql}
                      </code>
                    </pre>
                  </div>
                </ResultCard>
              )}

              {/* Data Table */}
              {result.data && result.data.length > 0 && (
                <ResultCard title="Query Results">
                  <DataTable data={result.data} />
                </ResultCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Particle Field Component
const ParticleField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-lavender rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-lavender to-accent rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
    <div className="relative bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-lavender/20 rounded-lg text-lavender">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold text-foreground"
          >
            {value}
          </motion.p>
        </div>
      </div>
    </div>
  </motion.div>
);

// Result Card Component
const ResultCard = ({ title, children }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-lavender/20 to-accent/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6">
      <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-lavender rounded-full animate-pulse-glow" />
        {title}
      </h3>
      {children}
    </div>
  </motion.div>
);

// Typewriter Text Component
const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= text.length) {
        setDisplayText(text.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [text]);

  return <p className="text-foreground text-lg leading-relaxed">{displayText}</p>;
};

// Data Table Component
const DataTable = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 text-left text-sm font-semibold text-foreground uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <motion.tr
              key={rowIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * 0.05 }}
              whileHover={{ scale: 1.01, backgroundColor: "hsl(var(--secondary))" }}
              className="border-b border-border/50 transition-colors"
            >
              {columns.map((col) => (
                <td key={col} className="px-4 py-3 text-sm text-muted-foreground">
                  {String(row[col])}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Index;
