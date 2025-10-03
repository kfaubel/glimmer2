import ReactDOM from 'react-dom';
import App from './App';
import { Sequence } from './Sequence';
//import dotenv from 'dotenv';

import 'bootstrap/dist/css/bootstrap.min.css';

// There is some inbuilt support by reactjs to use environment variables stored in a .env file and begins with REACT_APP_
// dotenv.config(); // Load the .env file into process.env
//                 // We need this to get SCREEN_LIST_URL_BASE

const sequence = new Sequence("ken");
sequence.start(); // Loads the screen list, sets an interval timer to update each screen image.

ReactDOM.render(
    <App sequencer = {sequence}/>, document.getElementById('root')
);