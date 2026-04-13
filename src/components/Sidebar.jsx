import { Link } from 'react-router-dom'
export default function Sidebar(){
  return (
    <div className="w-64 h-screen bg-blue-900 text-white p-4">
      <h2 className="text-xl font-bold mb-6">CBOI</h2>
      <ul className="space-y-4">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/transactions">Transactions</Link></li>
        <li><Link to="/qr">QR</Link></li>
        <li><Link to="/language">Language</Link></li>
        <li><Link to="/onboarding">Onboarding</Link></li>
      </ul>
    </div>
  )
}
