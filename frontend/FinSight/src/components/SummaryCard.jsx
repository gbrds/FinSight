// components/SummaryCard.jsx
const SummaryCard = ({ icon, title, value, color }) => (
  <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-3">
    <div className={`p-2 rounded-lg ${color} text-white`}>{icon}</div>
    <div>
      <span className="text-gray-400 text-sm">{title}</span>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  </div>
);

export default SummaryCard;