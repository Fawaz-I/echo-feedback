import DocsPage from "./components/DocsPage";

function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        padding: "2rem 1rem",
        background: "linear-gradient(to bottom, #fafafa, #ffffff)",
        width: "100%",
      }}
    >
      <DocsPage />
    </div>
  );
}

export default App;
