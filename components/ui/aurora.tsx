// Soft colour wash that sits behind every marketing page.
const style: React.CSSProperties = {
  width: "100%",
  height: "100%",
  background:
    "radial-gradient(1200px 800px at 20% 30%, rgba(16,185,129,0.30), transparent 60%)," +
    "radial-gradient(900px 700px at 70% 40%, rgba(59,130,246,0.22), transparent 60%)," +
    "radial-gradient(900px 700px at 55% 70%, rgba(168,85,247,0.18), transparent 65%)",
}

export default function AuroraShaders() {
  return <div style={style} />
}
