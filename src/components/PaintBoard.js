import "./PaintBoard.css";
import RecallActiveSVG from "../icons/recall_active.svg";
import RecallUnactiveSVG from "../icons/recall_unactive.svg";
import BrushSVG from "../icons/brush.svg";
import ColorPickerSVG from "../icons/color_picker.svg";
import SelectSVG from "../icons/select.svg";
import DoubleSelectSVG from "../icons/doubleSelect.svg";
import { useCallback, useMemo, useState, useRef } from "react";
import { IndentPanel } from "./IndentPanel";
import case2Query from "../images/case2/query.jpg";
import case2Restored1 from "../images/case2/restored1.jpg";
import { CanvasPainter } from "./CanvasPainter";
import { MetaPanel } from "./MetaPanel";
import case2Imagery1 from "../images/case2/imagery1.jpg";
import case2Imagery2 from "../images/case2/imagery2.jpg";

export const PaintBoard = ({
    currentColor,
    visibility,
    setVisibility,
    mode,
    setMode,
    penData,
    setPenData
}) => {
    const iconSizeLevel1 = 24;
    const iconSizeLevel2 = 36;
    const activeColor = "#fff6dc";
    const unactiveColor = "#b09872";

    // console.log("print-test-case2Query", case2Query) // 静态地址

    const handleToolChange = useCallback((newTool) => {
        if(newTool === mode) {
            setMode(-1);
        } else {
            setMode(newTool);
        }
    }, [mode])

    useMemo(() => {
        if(mode !== 2) {
            currentColor = "#1a7f7f";
        }
    }, [currentColor]);

    const [currentDisplayOne, setCurrentDisplayOne] = useState(0);
    const [currentDisplayTwo, setCurrentDisplayTwo] = useState(-1);
    const [restoredImages, setRestoredImages] = useState([case2Query, case2Restored1]);

    const canvasTop = useRef(null);

    // onTouch没法区分左右键的点击 => 先绕一点吧 => 取消再点击
    const handleImageClick = useCallback((newIndex) => {
        if(newIndex === 0) {    //1st window
            setCurrentDisplayOne(newIndex === currentDisplayOne ? -1 : newIndex);
        } else {                //2nd window
            setCurrentDisplayTwo(newIndex === currentDisplayTwo ? -1 : newIndex);
        }
    }, [currentDisplayOne, currentDisplayTwo])

    // 拖拽 - 两个canvas共享
    const [currentLT, setCurrentLT] = useState([0, 0]);
    // 缩放 - 两个canvas共享
    const [currentScale, setCurrentScale] = useState(1);
    const maxScale = 10;

    const [index, setIndex] = useState(-1);         //query处对应高亮的index

    const [queryList, setQueryList] = useState([
        // {
        //     image: case2Imagery1,
        //     text: ["山势舒坦静若盼，", "矾头云卷烟霞间。"],
        //     location: [135, 62, 100, 30]    //x, y, w, h
        // },
        // {
        //     image: case2Imagery2,
        //     text: ["树木葱茏争荫浓，",  "江畔风吹枝叶飘。"],
        //     location: [135, 100, 120, 40]
        // }
    ])

    const {imageTitles, imagePainters}= useMemo(() => {
        const imageTitles = [];
        const imagePainters = [];
        let num = 0;
        if(currentDisplayOne !== -1 && currentDisplayTwo === -1) {
            num = 1;
        } else if (currentDisplayOne !== -1 && currentDisplayTwo !== -1) {
            num = 2;
        }
        const width = num === 1 ? "100%" : (num === 2 ? "calc(50% - 1.5px)" : "0")
        for(let i = 0; i < num; i++) {
            const name = i === 0 ? "1st" : "2nd";
            imageTitles.push(
                <div className="Window-container" key={`window-container-${name}`} style={{width: width}}>
                    <div className="Image-title">
                        <div className="Tixing-div"/>
                        <div className="Image-title-text">
                            <span>{`${name} Window`}</span>
                            {/* <span>AI修复</span> */}
                        </div>
                    </div>
                </div>
            )

            const canvasImage = i === 0 ? restoredImages[currentDisplayOne] : (i === 1 ? restoredImages[currentDisplayTwo] : "")
            imagePainters.push(
                <div className="Canvas-container" key={`canvas-container-${name}`} style={{width: width, height: "100%"}}>
                    <CanvasPainter 
                        imgSrc={canvasImage} 
                        state={num} 
                        index={i}
                        sharedMove={currentLT}
                        changeSharedMove={(newLT) => {
                            if(newLT[0] !== currentLT[0] || newLT[1] !== currentLT[1]) setCurrentLT(newLT)
                        }}
                        sharedScale={currentScale}
                        changeSharedScale={(v => {
                            if(v < 0) {
                                const newScale = Math.min(maxScale, currentScale * 1.25);
                                setCurrentScale(newScale);
                            } else if (v > 0) {
                                const newScale = Math.max(0.25, currentScale / 1.25);
                                setCurrentScale(newScale);
                            }
                        })}
                        penColor={currentColor}
                        mode={mode}
                        setMode={setMode}
                        queryList={queryList}
                        changeList={setQueryList}
                        queryIndex={index}
                        setQueryIndex={setIndex}
                        penData={penData}
                        setPenData={setPenData}
                        visibility={visibility}
                        canvasTop={canvasTop}
                    />
                </div>
            )
            if(num === 2 && i === 0) imagePainters.push(<div key={'canvas-split'} style={{width: "3px", height: "calc(100% + 1px)", backgroundColor: "#5a4e3b"}}/>)
        }
        return {
            imageTitles: imageTitles,
            imagePainters: imagePainters
        }
    }, [currentDisplayOne, currentDisplayTwo, restoredImages, currentLT, currentScale, currentColor, mode]) 

    const restoreCanvas = () => {
        // restore[0]++;
    };

    return <div className="PaintBoard-container">
        <div className="Board-navigator">
                <div className="Board-tool-recall">
                    <div className="Board-tool-icon"
                        style={{
                            background: `url(${RecallActiveSVG}) no-repeat`,
                            backgroundSize: 'contain',
                            width: `${iconSizeLevel1}px`,
                            height: `${iconSizeLevel1}px`,
                        }}
                        onClick={restoreCanvas}
                    />
                    <div className="Board-tool-icon"
                        style={{
                            marginLeft: "6px",
                            background: `url(${RecallUnactiveSVG}) no-repeat`,
                            backgroundSize: 'contain',
                            border: "2px solid #74644c",
                            width: `${iconSizeLevel1}px`,
                            height: `${iconSizeLevel1}px`,
                            transform: "rotateY(180deg)",
                        }}
                    />
                </div>
                <div className="Board-tool-painting">
                        <div style={{width: "100%"}}>
                            <div className="Board-tool-container">
                                <div className="Board-tool-icon"
                                    style={{
                                        marginLeft: "-4px",
                                        marginTop: "-30px",
                                        background: `url(${DoubleSelectSVG}) no-repeat`,
                                        backgroundSize: '28px 28px',
                                        backgroundPosition: '4px 4px',
                                        backgroundColor: `${mode === 3 ? activeColor : unactiveColor}`,
                                        width: `${iconSizeLevel2}px`,
                                        height: `${iconSizeLevel2}px`,
                                        justifyContent: 'center'
                                    }}
                                    onClick={() => handleToolChange(3)}
                                />
                            </div>

                            <div className="Board-tool-container">
                                <div className="Board-tool-icon"
                                    style={{
                                        marginLeft: "-4px",
                                        background: `url(${BrushSVG}) no-repeat`,
                                        backgroundSize: 'contain',
                                        backgroundColor: `${mode === 0 ? activeColor : unactiveColor}`,
                                        width: `${iconSizeLevel2}px`,
                                        height: `${iconSizeLevel2}px`,
                                    }}
                                    onClick={() => handleToolChange(0)}
                                />
                            </div>
                            <div className="Board-tool-container">
                                <div className="Board-tool-icon"
                                    style={{
                                        marginLeft: "-4px",
                                        marginTop: "36px",
                                        background: `url(${SelectSVG}) no-repeat`,
                                        backgroundSize: 'contain',
                                        backgroundColor: `${mode === 1 ? activeColor : unactiveColor}`,
                                        width: `${iconSizeLevel2}px`,
                                        height: `${iconSizeLevel2}px`,
                                    }}
                                    onClick={() => handleToolChange(1)}
                                />
                            </div>
                            <div className="Board-tool-container">
                                <div className="Board-tool-icon"
                                    style={{
                                        marginLeft: "-4px",
                                        marginTop: "72px", // 好奇怪的BUG
                                        background: `url(${ColorPickerSVG}) no-repeat`,
                                        backgroundSize: 'contain',
                                        backgroundColor: `${mode === 2 ? activeColor : unactiveColor}`,
                                        width: `${iconSizeLevel2}px`,
                                        height: `${iconSizeLevel2}px`,
                                    }}
                                    onClick={() => handleToolChange(2)}
                                />
                            </div>

                            <div className="Board-tool-container">
                                <div className="Board-tool-icon"
                                    style={{
                                        marginLeft: "-4px",
                                        marginTop: "108px",
                                        backgroundColor: `${currentColor}`,
                                        width: `${iconSizeLevel2}px`,
                                        height: `${iconSizeLevel2}px`,
                                    }}
                                />
                            </div>


                        </div>
                </div>
        </div>
        <div className="Board-content">
            <div className="Board-painter">
                <div className="Painting-navigator">
                    {imageTitles}
                </div>
                <div className="Painting-canvas-container">
                    <div className="Painting-canvas" id="canvas">
                        {imagePainters}
                    </div>
                    <div className="Poem-panel">
                        <MetaPanel iconSize={iconSizeLevel1}
                        queryList={queryList}
                        setQueryList={setQueryList}
                        setVisibility={setVisibility}
                        index={index}
                        setIndex={setIndex}
                        canvasTop={canvasTop}
                        />
                    </div>
                </div>
            </div>
            <div className="Board-loader">
                <IndentPanel 
                    iconSize={iconSizeLevel1}
                    restoredImages={restoredImages}
                    displayOne={currentDisplayOne}
                    displayTwo={currentDisplayTwo}
                    handleImageClick={handleImageClick}
                />
            </div>
        </div>
    </div>
}


