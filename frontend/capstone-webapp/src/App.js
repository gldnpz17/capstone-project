import Authentication from './pages/Authentication.js';
import LoginForm from './pages/LoginForm.js'
import AccManagement from './pages/AccManagement'
import Authority from './pages/Authority'
import AddUser from './components/AddUser'
import AddClaim from './components/AddClaim'
import ClaimManagement from './pages/ClaimManagement'
import SmartLockList from './pages/SmartLockList'
import './App.css';
import AccessLog from './pages/AccessLog.js';

function App() {
  return (
    <div className="page">
      <SmartLockList/>
    </div>
  );
}

export default App;
