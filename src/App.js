import logo from './logo.svg';
import './App.css';
import PersonFormComponent from './PersonFormComponent';

function App() {
  return (
    <div className="App">
      <h1>OFAC Screening</h1>
      <p>Enter the details of a person to screen</p>
        <PersonFormComponent />
    </div>
);
}

export default App;
