import ReactMarkdown from "react-markdown";

function GapCard({ gaps }) {
  return (
    <div className="card gap-card">
      <h2>Research Gaps</h2>

      <ReactMarkdown>
        {gaps}
      </ReactMarkdown>
    </div>
  );
}

export default GapCard;