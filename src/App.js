import './App.css';
import { PaintBoard } from './components/PaintBoard';
import { ReferenceView } from './components/ReferenceView';
import { TimelineView } from './components/TimelineView';
import { useState } from "react";

function App() {
    const [currentColor, setCurrentColor] = useState("#1a7f7f");    //全局颜色，不知道放在哪里好。
    const [visibility, setVisibility] = useState('hidden');
    const [mode, setMode] = useState(-1);
    const [penData, setPenData] = useState([]);
    const [display, setDisplay] = useState('none');
    return (
        <div className="App">
            <div className='App-header'>
                <span className='App-header-title'>PColorizor</span>
            </div>
            <div className='App-content'>
                <div className='App-part1'>
                    <div className='App-board'>
                        <PaintBoard 
                         currentColor={currentColor}
                         visibility={visibility}
                         setVisibility={setVisibility}
                         mode={mode}
                         setMode={setMode}
                         penData={penData}
                         setPenData={setPenData}
                         />
                    </div>
                    <div className='App-timeline'>
                        <TimelineView 
                        visibility={visibility}
                        drawingDisplay={display}
                        setDrawingDisplay={setDisplay}
                        />
                    </div>
                </div>
                <div className='App-part2'>
                    <div className='App-reference'>
                        <ReferenceView 
                        setCurrentColor={setCurrentColor}
                        mode={mode}
                        setMode={setMode}
                        penData={penData}
                        setPenData={setPenData}
                        display={display}
                        setDisplay={setDisplay}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
