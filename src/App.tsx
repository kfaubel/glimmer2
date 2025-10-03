import "./App.css";
import TimeBug from "./TimeBug";
import Message from "./Message";
import { Sequence, ScreenItem } from "./Sequence";
import React from "react";

export interface AppProps {
    sequencer: Sequence;
}

let timeout: NodeJS.Timeout;

const App = (props: AppProps) => {

    // I am sure this will be completely obvious to my future self :-)
    //
    // React.useState takes an initial state {screen: aScreen, fade: a fade}
    //   screen is a screen object
    //   fade is a string we assign to the image below
    // useState returns an array of two items
    // The first, screenState, is the current state value.  It is an object with 'screen' and 'fade'
    // The second, updateScreenState, is a function that will update the screenState and cause this function to be called again.
    const [screenState, updateScreenState] = React.useState({screen: props.sequencer.getFirst(), fade: ""});
   
    //console.log(`${new Date().toLocaleString()}:${new Date().getMilliseconds()}: App starting  screen: ${screenState.screen.friendlyName}, fade: ${screenState.fade}`);

    const fadeOut = (screen: any) => {
        //console.log(`${new Date().toLocaleString()}:${new Date().getMilliseconds()}: fadeOut(): screen: ${screen.friendlyName}, Updating fade prop to: fadeOut`);
        updateScreenState({screen: screen, fade: "fadeOut"}); 
        setTimeout(fadeInNew, 100, screen);  
    };

    const fadeInNew = (screen: any) => {
        const newScreen = props.sequencer.getNext();
        
        updateScreenState({screen: newScreen, fade: "fadeIn"});

        let displayTimeMs = (newScreen.displaySecs * 1000);
        if (newScreen.image === null) {
            displayTimeMs = 1000;
        }

        clearTimeout(timeout); // Make sure we don't somehow get 2 of these queued
        timeout = setTimeout(fadeOut, displayTimeMs, newScreen);  
    }

    // If this is the first time, setup the screen change timeout
    if (screenState.fade === "") {
        console.log(`${new Date().toLocaleString()}:${new Date().getMilliseconds()}: First time, setting fadeOut timeout`);
        timeout = setTimeout(fadeOut, 10000, screenState.screen);
    } 

    if (screenState.fade === "fadeIn") {
        console.log(`${new Date().toLocaleString()}: App: showing screen: ${(screenState.screen as ScreenItem).friendlyName}`);
    }

    return (
        <div className="App" id="myApp">
            <img className={screenState.fade} 
                 id="screen-image" 
                 src={(screenState.screen as ScreenItem).imageUri} 
                 alt={(screenState.screen as ScreenItem).friendlyName}
            />
            <TimeBug location={(screenState.screen as ScreenItem).timeBug} />
            <Message message={(screenState.screen as ScreenItem).message} />
        </div>
    );
}

export default App;
