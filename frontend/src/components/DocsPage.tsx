import { useState } from "react";
import type { FeedbackResponse } from "@echo-feedback/types";
import {
  Mic,
  Rocket,
  Radio,
  Atom,
  Package,
  Bot,
  Target,
  Smile,
  Webhook,
  Zap,
  MessageSquare,
  ClipboardList,
  Github,
  FileText,
  Check,
} from "lucide-react";
import EchoFeedback from "./EchoFeedback";
import CodeBlock from "./CodeBlock";

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<
    | "getting-started"
    | "api"
    | "react"
    | "web-component"
    | "web-component-examples"
  >("getting-started");
  const [lastResponse, setLastResponse] = useState<FeedbackResponse | null>(
    null
  );

  return (
    <div
      style={{
        maxWidth: "1200px",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        margin: "0 auto",
        padding: "0 1rem",
      }}
    >
      {/* Header */}
      <header
        style={{
          textAlign: "center",
          marginBottom: "3rem",
          flexShrink: 0,
          width: "100%",
          minHeight: "120px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: "700",
            color: "#0a0a0a",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          <Mic size={48} strokeWidth={2} />
          Echo Feedback
        </h1>
        <p
          style={{
            color: "#737373",
            fontSize: "clamp(1rem, 3vw, 1.25rem)",
            margin: 0,
            width: "100%",
          }}
        >
          Voice-first feedback SDK for modern web apps
        </p>
      </header>

      {/* Main Content Area with Sidebar */}
      <div
        style={{
          display: "flex",
          gap: "3rem",
          flex: "1 1 auto",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {/* Sidebar Navigation */}
        <aside
          style={{
            flexShrink: 0,
            width: "240px",
            position: "sticky",
            top: "2rem",
            alignSelf: "flex-start",
          }}
        >
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {[
              { id: "getting-started", label: "Getting Started", icon: Rocket },
              { id: "api", label: "API Reference", icon: Radio },
              { id: "react", label: "React SDK", icon: Atom },
              { id: "web-component", label: "Web Component", icon: Package },
              {
                id: "web-component-examples",
                label: "Web Component Examples",
                icon: Package,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    background:
                      activeTab === tab.id ? "#f5f5f5" : "transparent",
                    border: "none",
                    padding: "0.75rem 1rem",
                    fontSize: "0.9375rem",
                    fontWeight: activeTab === tab.id ? "600" : "400",
                    color: activeTab === tab.id ? "#0a0a0a" : "#737373",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    textAlign: "left",
                    width: "100%",
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = "#fafafa";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Tab Content Container - maintains consistent sizing */}
        <main
          style={{
            position: "relative",
            minHeight: "1400px",
            flex: "1 1 auto",
            width: "100%",
          }}
        >
          {/* Getting Started */}
          {activeTab === "getting-started" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
                width: "100%",
              }}
            >
              <section>
                <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                  Quick Start
                </h2>
                <p style={{ color: "#737373", marginBottom: "1.5rem" }}>
                  Get up and running with Echo Feedback in under 5 minutes.
                </p>

                <CodeBlock
                  language="bash"
                  code={`# Install via npm
npm install @echo-feedback/react

# Or use CDN for web component
<script src="https://cdn.echo-feedback.dev/web.js"></script>`}
                />

                <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                  Try it now
                </h3>
                <p style={{ color: "#737373", marginBottom: "1.5rem" }}>
                  Click the microphone to record your feedback. It will be
                  transcribed, summarized, and categorized automatically.
                </p>

                <div
                  style={{
                    background: "linear-gradient(to bottom, #fafafa, #ffffff)",
                    border: "1px solid #e5e5e5",
                    borderRadius: "12px",
                    padding: "2rem",
                  }}
                >
                  <EchoFeedback
                    appId="demo_app"
                    endpoint="http://localhost:3001"
                    maxDurationSec={30}
                    onComplete={(data) => {
                      console.log("Feedback:", data);
                      setLastResponse(data);
                    }}
                  />
                </div>

                {lastResponse && (
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "8px",
                      padding: "clamp(1rem, 3vw, 1.5rem)",
                      marginTop: "1.5rem",
                    }}
                  >
                    <h4
                      style={{
                        color: "#166534",
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Check size={20} /> Feedback Processed
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      <div>
                        <strong style={{ color: "#166534" }}>
                          Transcript:
                        </strong>
                        <p
                          style={{ color: "#166534", margin: "0.25rem 0 0 0" }}
                        >
                          {lastResponse.transcript}
                        </p>
                      </div>
                      <div>
                        <strong style={{ color: "#166534" }}>Summary:</strong>
                        <p
                          style={{ color: "#166534", margin: "0.25rem 0 0 0" }}
                        >
                          {lastResponse.summary}
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#166534",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "6px",
                            fontSize: "0.875rem",
                          }}
                        >
                          Category: {lastResponse.category}
                        </span>
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#166534",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "6px",
                            fontSize: "0.875rem",
                          }}
                        >
                          Sentiment: {lastResponse.sentiment}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section>
                <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                  Features
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  {[
                    {
                      icon: Mic,
                      title: "Voice Recording",
                      desc: "Capture user feedback through voice",
                    },
                    {
                      icon: Bot,
                      title: "AI Processing",
                      desc: "Automatic transcription & summarization",
                    },
                    {
                      icon: Target,
                      title: "Auto-categorization",
                      desc: "Bug, feature, praise, or other",
                    },
                    {
                      icon: Smile,
                      title: "Sentiment Analysis",
                      desc: "Positive, neutral, or negative",
                    },
                    {
                      icon: Webhook,
                      title: "Webhook Integration",
                      desc: "Slack, Jira, GitHub, Notion",
                    },
                    {
                      icon: Zap,
                      title: "Fire & Forget",
                      desc: "Users never wait for processing",
                    },
                  ].map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={feature.title}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e5e5e5",
                          borderRadius: "8px",
                          padding: "1.5rem",
                        }}
                      >
                        <Icon
                          size={32}
                          strokeWidth={1.5}
                          style={{ marginBottom: "0.5rem" }}
                        />
                        <h3
                          style={{
                            fontSize: "1.125rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          {feature.title}
                        </h3>
                        <p
                          style={{
                            color: "#737373",
                            fontSize: "0.875rem",
                            margin: 0,
                          }}
                        >
                          {feature.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {/* API Reference */}
          {activeTab === "api" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
                width: "100%",
              }}
            >
              <section>
                <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                  POST /api/feedback
                </h2>
                <p style={{ color: "#737373", marginBottom: "1.5rem" }}>
                  Submit voice feedback for processing.
                </p>

                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
                  Request
                </h3>
                <CodeBlock
                  language="bash"
                  code={`curl -X POST https://api.echo-feedback.com/api/feedback \\
  -F "appId=your_app_id" \\
  -F "audio=@recording.webm" \\
  -F 'metadata={"pageUrl":"https://example.com"}'`}
                />

                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
                  Response
                </h3>
                <CodeBlock
                  language="json"
                  code={`{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "transcript": "The dark mode toggle isn't working.",
  "summary": "Dark mode toggle malfunction",
  "category": "bug",
  "sentiment": "negative",
  "priority": "medium",
  "language": "en-US",
  "audio_url": "/uploads/550e8400.webm"
}`}
                />

                <h3 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>
                  Parameters
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      minWidth: "600px",
                      borderCollapse: "collapse",
                      background: "#ffffff",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#fafafa",
                          borderBottom: "1px solid #e5e5e5",
                        }}
                      >
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "left",
                            fontWeight: "600",
                          }}
                        >
                          Field
                        </th>
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "left",
                            fontWeight: "600",
                          }}
                        >
                          Type
                        </th>
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "left",
                            fontWeight: "600",
                          }}
                        >
                          Required
                        </th>
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "left",
                            fontWeight: "600",
                          }}
                        >
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                        <td
                          style={{
                            padding: "0.75rem",
                            fontFamily: "monospace",
                          }}
                        >
                          appId
                        </td>
                        <td style={{ padding: "0.75rem" }}>string</td>
                        <td style={{ padding: "0.75rem" }}>Yes</td>
                        <td style={{ padding: "0.75rem", color: "#737373" }}>
                          Your application identifier
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
                        <td
                          style={{
                            padding: "0.75rem",
                            fontFamily: "monospace",
                          }}
                        >
                          audio
                        </td>
                        <td style={{ padding: "0.75rem" }}>file</td>
                        <td style={{ padding: "0.75rem" }}>Yes</td>
                        <td style={{ padding: "0.75rem", color: "#737373" }}>
                          Audio file (webm/mp3/wav, max 5MB)
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: "0.75rem",
                            fontFamily: "monospace",
                          }}
                        >
                          metadata
                        </td>
                        <td style={{ padding: "0.75rem" }}>JSON</td>
                        <td style={{ padding: "0.75rem" }}>No</td>
                        <td style={{ padding: "0.75rem", color: "#737373" }}>
                          Additional context (pageUrl, device, etc.)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                  Webhooks
                </h2>
                <p style={{ color: "#737373", marginBottom: "1.5rem" }}>
                  Automatically send feedback to your favorite tools. Webhooks
                  are formatted based on the destination URL.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 150px), 1fr))",
                    gap: "1rem",
                  }}
                >
                  {[
                    { name: "Slack", icon: MessageSquare },
                    { name: "Jira", icon: ClipboardList },
                    { name: "GitHub", icon: Github },
                    { name: "Notion", icon: FileText },
                  ].map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <div
                        key={tool.name}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #e5e5e5",
                          borderRadius: "8px",
                          padding: "1rem",
                          textAlign: "center",
                        }}
                      >
                        <Icon
                          size={32}
                          strokeWidth={1.5}
                          style={{ margin: "0 auto 0.5rem" }}
                        />
                        <div style={{ fontWeight: "600" }}>{tool.name}</div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {/* React SDK */}
          {activeTab === "react" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
                width: "100%",
              }}
            >
              <section>
                <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                  React SDK
                </h2>
                <p style={{ color: "#737373", marginBottom: "1.5rem" }}>
                  Drop-in React component with TypeScript support.
                </p>

                <h3 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
                  Installation
                </h3>
                <CodeBlock
                  language="bash"
                  code="npm install @echo-feedback/react"
                />

                <h3 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
                  Basic Usage
                </h3>
                <CodeBlock
                  language="tsx"
                  code={`import { EchoFeedback } from '@echo-feedback/react';

function App() {
  return (
    <EchoFeedback
      appId="your_app_id"
      endpoint="https://api.echo-feedback.com"
      maxDurationSec={60}
      onComplete={(data) => {
        console.log('Feedback:', data);
      }}
    />
  );
}`}
                />

                <h3 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
                  Props
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      minWidth: "700px",
                      borderCollapse: "collapse",
                      background: "#ffffff",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#fafafa",
                          borderBottom: "1px solid #e5e5e5",
                        }}
                      >
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "left",
                            fontWeight: "600",
                          }}
                        >
                          Prop
                        </th>
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "left",
                            fontWeight: "600",
                          }}
                        >
                          Type
                        </th>
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "left",
                            fontWeight: "600",
                          }}
                        >
                          Default
                        </th>
                        <th
                          style={{
                            padding: "0.75rem",
                            textAlign: "left",
                            fontWeight: "600",
                          }}
                        >
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          prop: "appId",
                          type: "string",
                          default: "-",
                          desc: "Your app ID (required)",
                        },
                        {
                          prop: "endpoint",
                          type: "string",
                          default: "-",
                          desc: "API endpoint (required)",
                        },
                        {
                          prop: "maxDurationSec",
                          type: "number",
                          default: "90",
                          desc: "Max recording duration",
                        },
                        {
                          prop: "variant",
                          type: "string",
                          default: "card",
                          desc: "Visual variant",
                        },
                        {
                          prop: "onComplete",
                          type: "function",
                          default: "-",
                          desc: "Callback on completion",
                        },
                        {
                          prop: "onError",
                          type: "function",
                          default: "-",
                          desc: "Callback on error",
                        },
                      ].map((row, i) => (
                        <tr
                          key={row.prop}
                          style={{
                            borderBottom: i < 5 ? "1px solid #e5e5e5" : "none",
                          }}
                        >
                          <td
                            style={{
                              padding: "0.75rem",
                              fontFamily: "monospace",
                            }}
                          >
                            {row.prop}
                          </td>
                          <td style={{ padding: "0.75rem", color: "#737373" }}>
                            {row.type}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem",
                              fontFamily: "monospace",
                              fontSize: "0.875rem",
                            }}
                          >
                            {row.default}
                          </td>
                          <td style={{ padding: "0.75rem", color: "#737373" }}>
                            {row.desc}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                  Live Demo
                </h2>
                <div
                  style={{
                    background: "linear-gradient(to bottom, #fafafa, #ffffff)",
                    border: "1px solid #e5e5e5",
                    borderRadius: "12px",
                    padding: "clamp(1rem, 3vw, 2rem)",
                  }}
                >
                  <EchoFeedback
                    appId="demo_app"
                    endpoint="http://localhost:3001"
                    maxDurationSec={30}
                    variant="card"
                    onComplete={(data) => {
                      console.log("Feedback:", data);
                      alert(`Received feedback: ${data.summary}`);
                    }}
                  />
                </div>
              </section>
            </div>
          )}

          {/* Web Component */}
          {activeTab === "web-component" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
                width: "100%",
              }}
            >
              <section>
                <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                  Web Component
                </h2>
                <p style={{ color: "#737373", marginBottom: "1.5rem" }}>
                  Framework-agnostic custom element. Works with React, Vue,
                  vanilla JS, or any framework.
                </p>

                <h3 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
                  Installation
                </h3>
                <CodeBlock
                  language="html"
                  code='<script src="https://cdn.echo-feedback.dev/web.js"></script>'
                />

                <h3 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
                  Basic Usage
                </h3>
                <CodeBlock
                  language="html"
                  code={`<echo-feedback
  app-id="your_app_id"
  endpoint="https://api.echo-feedback.com"
  auto-upload
></echo-feedback>

<script>
  const feedback = document.querySelector('echo-feedback');
  
  feedback.addEventListener('echo-complete', (e) => {
    console.log('Transcript:', e.detail.transcript);
    console.log('Summary:', e.detail.summary);
  });
</script>`}
                />

                <h3 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
                  Theming
                </h3>
                <p style={{ color: "#737373", marginBottom: "1rem" }}>
                  Customize with CSS variables (shadcn-style):
                </p>
                <CodeBlock
                  language="css"
                  code={`echo-feedback {
  --ef-accent: #667eea;
  --ef-radius: 12px;
  --ef-bg: #ffffff;
  --ef-fg: #0a0a0a;
}`}
                />

                <h3 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
                  Events
                </h3>
                <ul
                  style={{
                    color: "#737373",
                    marginLeft: "1.5rem",
                    lineHeight: "1.8",
                    marginBottom: "2rem",
                  }}
                >
                  <li>
                    <code
                      style={{
                        background: "#f5f5f5",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "4px",
                      }}
                    >
                      echo-start
                    </code>{" "}
                    - Recording started
                  </li>
                  <li>
                    <code
                      style={{
                        background: "#f5f5f5",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "4px",
                      }}
                    >
                      echo-stop
                    </code>{" "}
                    - Recording stopped
                  </li>
                  <li>
                    <code
                      style={{
                        background: "#f5f5f5",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "4px",
                      }}
                    >
                      echo-complete
                    </code>{" "}
                    - Feedback processed
                  </li>
                  <li>
                    <code
                      style={{
                        background: "#f5f5f5",
                        padding: "0.125rem 0.5rem",
                        borderRadius: "4px",
                      }}
                    >
                      echo-error
                    </code>{" "}
                    - Error occurred
                  </li>
                </ul>

                <div
                  style={{
                    background: "linear-gradient(to bottom, #fafafa, #ffffff)",
                    border: "1px solid #e5e5e5",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    marginTop: "2rem",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      marginBottom: "0.75rem",
                      color: "#0a0a0a",
                    }}
                  >
                    See It In Action
                  </h3>
                  <p style={{ color: "#737373", marginBottom: "1rem" }}>
                    Check out live examples with different variants and
                    configurations.
                  </p>
                  <button
                    onClick={() => setActiveTab("web-component-examples")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#0a0a0a",
                      textDecoration: "none",
                      fontWeight: "600",
                      padding: "0.75rem 1.5rem",
                      background: "#ffffff",
                      border: "1px solid #e5e5e5",
                      borderRadius: "8px",
                      transition: "all 0.2s",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f5f5f5";
                      e.currentTarget.style.borderColor = "#d4d4d4";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.borderColor = "#e5e5e5";
                    }}
                  >
                    <Package size={18} />
                    View Web Component Examples
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* Web Component Examples */}
          {activeTab === "web-component-examples" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
                width: "100%",
              }}
            >
              <section>
                <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                  Web Component Examples
                </h2>
                <p style={{ color: "#737373", marginBottom: "1.5rem" }}>
                  See the web component in action with different variants and
                  configurations.
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  {/* Example 1: Default Card */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e5e5",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      boxShadow:
                        "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                    }}
                  >
                    <h3
                      style={{
                        marginTop: 0,
                        color: "#0a0a0a",
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        marginBottom: "1rem",
                      }}
                    >
                      Default Card Variant
                    </h3>
                    <CodeBlock
                      language="html"
                      code={`<echo-feedback
  app-id="demo_app"
  endpoint="http://localhost:3001"
  max-duration-sec="30"
  auto-upload>
</echo-feedback>`}
                    />
                    <div style={{ marginTop: "1rem" }}>
                      <EchoFeedback
                        appId="demo_app"
                        endpoint="http://localhost:3001"
                        maxDurationSec={30}
                        variant="card"
                      />
                    </div>
                  </div>

                  {/* Example 2: Compact */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e5e5",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      boxShadow:
                        "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                    }}
                  >
                    <h3
                      style={{
                        marginTop: 0,
                        color: "#0a0a0a",
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        marginBottom: "1rem",
                      }}
                    >
                      Compact Variant
                    </h3>
                    <CodeBlock
                      language="html"
                      code={`<echo-feedback
  variant="compact"
  app-id="demo_app"
  endpoint="http://localhost:3001"
  max-duration-sec="30">
</echo-feedback>`}
                    />
                    <div style={{ marginTop: "1rem" }}>
                      <EchoFeedback
                        appId="demo_app"
                        endpoint="http://localhost:3001"
                        maxDurationSec={30}
                        variant="compact"
                      />
                    </div>
                  </div>

                  {/* Example 3: Small */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #e5e5e5",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      boxShadow:
                        "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                    }}
                  >
                    <h3
                      style={{
                        marginTop: 0,
                        color: "#0a0a0a",
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        marginBottom: "1rem",
                      }}
                    >
                      Small Variant
                    </h3>
                    <CodeBlock
                      language="html"
                      code={`<echo-feedback
  variant="small"
  app-id="demo_app"
  endpoint="http://localhost:3001"
  max-duration-sec="30">
</echo-feedback>`}
                    />
                    <div style={{ marginTop: "1rem" }}>
                      <EchoFeedback
                        appId="demo_app"
                        endpoint="http://localhost:3001"
                        maxDurationSec={30}
                        variant="small"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
