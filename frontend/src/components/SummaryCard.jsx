import ReactMarkdown from "react-markdown";

function SummaryCard({ summary }) {
  return (
    <div className="card summary-card">
      <h2>Summary</h2>

      <ReactMarkdown>
        {summary}
      </ReactMarkdown>
    </div>
  );
}

export default SummaryCard;