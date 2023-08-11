// import logo from './logo.svg';
import './App.css';
import EmployeeFinder from './employeeFinder';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className='pageTitle'>Employee Management System</h1>
        <EmployeeFinder></EmployeeFinder>
      </header>
      <footer>
        <p>&copy; This website was created by Pedro Valente</p>
      </footer>
    </div>
  );
}

export default App;
