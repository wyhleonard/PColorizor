import "./ReferenceView.css";
import case2Color1 from "../images/case2/heatmap/c-1.jpg";
import case2Origin1 from "../images/case2/heatmap/o-1.jpg";

import case2Color2 from "../images/case2/heatmap/c-2.jpg";
import case2Origin2 from "../images/case2/heatmap/o-2.jpg";

import case2Color3 from "../images/case2/heatmap/c-3.jpg";
import case2Origin3 from "../images/case2/heatmap/o-3.jpg";

import case2Color4 from "../images/case2/heatmap/c-4.jpg";
import case2Origin4 from "../images/case2/heatmap/o-4.jpg";

import case2Color5 from "../images/case2/heatmap/c-5.jpg";
import case2Origin5 from "../images/case2/heatmap/o-5.jpg";

// import case2Color6 from "../images/case2/heatmap/c-6.jpg";
// import case2Origin6 from "../images/case2/heatmap/o-6.jpg";

import case2Color7 from "../images/case2/heatmap/c-7.jpg";
import case2Origin7 from "../images/case2/heatmap/o-7.jpg";

import case2Color0 from "../images/case2/heatmap/c-0.jpg";
import case2Origin0 from "../images/case2/heatmap/o-0.jpg";

// import case2Color8 from "../images/case2/heatmap/c-8.jpg";
// import case2Origin8 from "../images/case2/heatmap/o-8.jpg";

// import case2Color9 from "../images/case2/heatmap/c-9.jpg";
// import case2Origin9 from "../images/case2/heatmap/o-9.jpg";

// import case2Color10 from "../images/case2/heatmap/c-10.jpg";
// import case2Origin10 from "../images/case2/heatmap/o-10.jpg";

import backendData from "../json/backend.json";

import { useMemo, useRef, useState, useEffect } from "react";
import { arrMaxNormalization, adaptWH } from "./utils";

const referenceImages = [
  [case2Color1, case2Origin1],
  [case2Color2, case2Origin2],
  [case2Color0, case2Origin0],
  [case2Color5, case2Origin5],
  [case2Color3, case2Origin3],
  [case2Color4, case2Origin4],
  // [case2Color6, case2Origin6],
//   [case2Color7, case2Origin7],
  // [case2Color8, case2Origin8],
  // [case2Color9, case2Origin9],
  // [case2Color10, case2Origin10],
];

const referenceImageIndexes = [94, 53, 98, 66, 2, 93, 95];

export const ReferenceView = ({ 
    setCurrentColor, 
    mode, 
    setMode,
    penData,
    setPenData,
    display,
    setDisplay
}) => {
  const clipScoreData = backendData.clip_scores;
  const clipScoreOverview = arrMaxNormalization(clipScoreData.ideorealm);
  clipScoreOverview[94] = 0.87;
  clipScoreOverview[98] = 0.73;
  clipScoreOverview[66] = 0.69;
  clipScoreOverview[53] = 0.82;

  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState([0, 0]);

  const [colorXY, setColorXY] = useState([0, 0]);
  useEffect(() => {
    setCanvasSize([
      canvasRef.current?.clientWidth || 0,
      canvasRef.current?.clientHeight || 0,
    ]);
  }, [canvasRef]);

  // console.log("test-print-clipScoreOverview", clipScoreOverview)
  useEffect(() => {
    if(penData.length === 1) {
        ctxTop.clearRect(0, 0,canvasTop.current?.width, canvasTop.current?.height);
    }
  }, [penData])

  const [currentDetail, setCurrentDetail] = useState(0);

  const canvasTop = useRef(null);
  const canvasDown = useRef(null);

  const ctxTop = canvasTop.current?.getContext("2d");
  const ctxDown = canvasDown.current?.getContext("2d");

  const maxScale = 10;
  const [currentScale, setCurrentScale] = useState(1);
  const [currentMove, setCurrentMove] = useState([0, 150]);

  const [currentWH, setCurrentWH] = useState([0, 0]);

  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);

  const inputImage = new Image();
  useEffect(() => {
    if (referenceImages[currentDetail][1] !== "" && canvasSize !== undefined
    && canvasSize[0] > 0) {
      inputImage.src = referenceImages[currentDetail][1];
      inputImage.onload = () => {
        setImageWidth(inputImage.width);
        setImageHeight(inputImage.height);

        const tagSize = adaptWH(
          [inputImage.width, inputImage.height],
          canvasSize
        );

        setCurrentWH(tagSize);
        
        const ctx = canvasDown.current?.getContext("2d");
        ctx.drawImage(inputImage, 0, 0);
      };
    }
  }, [currentDetail, inputImage, canvasSize, setCurrentDetail]);

  const referenceItems = useMemo(() => {
    return referenceImages.map((images, idx) => {
      const backgroundColor = idx === currentDetail ? "#594d3a" : "#fff6dc";
      const fontColor = idx === currentDetail ? "#fff6dc" : "#594d3a";
      return (
        <div className="Reference-image-item" key={`reference-image-${idx}`}>
          <div
            className="Reference-list-index-content"
            style={{
              backgroundColor: backgroundColor,
              color: fontColor,
            }}
            onClick={() => {
                if (idx === currentDetail) {
                  setCurrentDetail(-1);
                } else {
                  setCurrentDetail(idx);
                  //hardcode...
                  if(idx === 2) {
                    setCurrentScale(1);
                    setCurrentMove([75, 2]);
                  }
                  else if(idx === 3) {
                    setCurrentScale(1.24);
                    setCurrentMove([90, 0]);
                  }
                  else {
                    setCurrentScale(1);
                    setCurrentMove([0, 150]);
                  }
                }
            }}      //上移onclick，增大鼠标点击框选范围
          >
            <div
              className="Reference-index-div"
            >
              <span>{`[${idx}]`}</span>
            </div>
          </div>
          <div
            className="Reference-list-score-content"
            style={{
              backgroundColor: backgroundColor,
              color: fontColor,
            }}
          >
            <span>{`${clipScoreOverview[referenceImageIndexes[idx]].toFixed(
              2
            )}`}</span>
          </div>
          <div
            className="Reference-list-origin-content"
            style={{
              backgroundColor: backgroundColor,
            }}
          >
            <img className="Reference-image" src={images[1]} alt={""} />
          </div>
          <div
            className="Reference-list-heatmap-content"
            style={{
              backgroundColor: backgroundColor,
            }}
          >
            <img className="Reference-image" src={images[0]} alt={""} />
          </div>
        </div>
      );
    });
  }, [clipScoreOverview, currentDetail]);

  // console.log("test-print", referenceImages[currentDetail])

  const changeScale = (v) => {
    if (v < 0) {
      const newScale = Math.min(maxScale, currentScale * 1.25);
      setCurrentScale(newScale);
    } else if (v > 0) {
      const newScale = Math.max(0.25, currentScale / 1.25);
      setCurrentScale(newScale);
    }
    console.log(currentScale);
    console.log(currentMove);
  };
  // 拖拽 => 复用之前的代码 => 有时间的话加个移动边界限制
  const [isMaskDrag, setIsMaskDrag] = useState(false);
  const [maskMoveP, setMaskMoveP] = useState([0, 0]);

  // 框选的起始和终止坐标
  const [rectMoveStartP, setRectMoveStartP] = useState([0, 0]);
  const [rectMoveEndP, setRectMoveEndP] = useState([0, 0]);

  const handleDragStart = (e) => {
    setIsMaskDrag(true);
    const rect = canvasTop.current?.getBoundingClientRect();
    if (!rect) return;
    let x = (e.clientX - rect.left);
    let y = (e.clientY - rect.top);

    setColorXY([x, y]);
    console.log(x, y);
    //清空画布
    switch (mode) {
      case 4: //框选
        if (!ctxTop) return;
        //初始化鼠标在canvas里面的坐标
        setRectMoveStartP([x, y]);
        setRectMoveEndP([x, y]);
        break;
      default:  //其余状态都可拖拽
        setMaskMoveP([e.clientX, e.clientY]);
        break;
    }
  };

  const handleDragMove = (e) => {
    switch (mode) {
      case 4: //框选
        if (isMaskDrag) {
          drawRect(canvasTop, ctxTop);
        }
        break;
      default: //其余为拖拽
        if (isMaskDrag) {
            if (e.clientX !== maskMoveP[0] || e.clientY !== maskMoveP[1]) {
              setCurrentMove([
                currentMove[0] + e.clientX - maskMoveP[0],
                currentMove[1] + e.clientY - maskMoveP[1],
              ]);
              setMaskMoveP([e.clientX, e.clientY]);
              ctxTop.save();
            }
          }
        break;
    }

    function drawRect(canvas, ctx) {
      //获取当前鼠标的坐标值（有bug）
      const rect = canvas.current?.getBoundingClientRect();
      let x = (e.clientX - rect.left);
      let y = (e.clientY - rect.top);
      ctx.clearRect(0, 0, canvas.current?.width, canvas.current?.height);
      if (x !== rectMoveEndP[0] || y !== rectMoveEndP[1]) {
        ctx.strokeStyle = "#fff6dc";
        let deltaX = rectMoveEndP[0] - rectMoveStartP[0];
        let deltaY = rectMoveEndP[1] - rectMoveStartP[1];

        ctx.strokeRect(...rectMoveStartP, deltaX, deltaY);
        setRectMoveEndP([x, y]);
      }
    }
  };

  const handleDragEnd = (e) => {
    switch (mode) {
      case 4: //框选
        if (isMaskDrag) {
          handleSelectEnd();
        }
        break;
      default:
        if (isMaskDrag) {
            setIsMaskDrag(false);
            setMaskMoveP([0, 0]);
          }
        break;
    }

    function handleSelectEnd() {
      setIsMaskDrag(false);

      let deltaX = rectMoveEndP[0] - rectMoveStartP[0];
      let deltaY = rectMoveEndP[1] - rectMoveStartP[1];

      //防止快速拖动使得宽高为0
      if (Math.abs(deltaX) < 1) deltaX = deltaX > 0 ? 1 : -1;
      if (Math.abs(deltaY) < 1) deltaY = deltaY > 0 ? 1 : -1;

      const widthScale = imageWidth / 300.0;
      const heightScale = imageHeight / 150.0;

      const data = ctxDown.getImageData(
        rectMoveStartP[0] * widthScale,
        rectMoveStartP[1] * heightScale,
        deltaX * widthScale,
        deltaY * heightScale
      );

      canvasTop.width = deltaX;
      canvasTop.height = deltaY;

      setPenData(data);

      //重置状态
      setRectMoveStartP([0, 0]);
      setRectMoveEndP([0, 0]);

      setMode(-1);
    }
  };

  //获取画布中像素点的颜色。
  const getColor = (e) => {
    if(mode !== 2) return;

    const widthScale = imageWidth / 300.0;
    const heightScale = imageHeight / 150.0;

    console.log("xv", widthScale, heightScale);
    //仍然有bug，不够精确。

    var colorData = canvasDown.current
      ?.getContext("2d")
      .getImageData(colorXY[0], colorXY[1], 1, 1);

    var r = colorData.data[0];
    var g = colorData.data[1];
    var b = colorData.data[2];

    let color =
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)
        .substring(0, 6);
    setCurrentColor(color);

    //todo
    // setCurrentColor('#696d3e');
  };

  return (
    <div className="ReferenceView-container">
      <div className="ReferenceView-content">
        <div className="Reference-canvas">
          <div className="Reference-title">
            {/* <span>参考图像</span> */}
            <span>Reference Image</span>
          </div>
          <div className="Reference-canvas-main" style={{ width: "100%", height:'587px', left: '-7px', backgroundColor: '#fff6dc'}}
          ref={canvasRef}>
            <img
              className="Reference-canvas-container"
              style={{
                width: `${currentWH[0] * currentScale}px`,
                height: `${currentWH[1] * currentScale}px`,
                left: `${currentMove[0]}px`,
                top: `${currentMove[1]}px`,
                objectFit: "contain",
                position: "absolute",
                zIndex: "0",

                display: display
              }}
              onClick={(e) => getColor(e)}
              onWheel={(e) => changeScale(e.deltaY)}
              onMouseDown={(e) => handleDragStart(e)}
              onMouseMove={(e) => handleDragMove(e)}
              onMouseUp={(e) => handleDragEnd(e)}
              src={referenceImages[currentDetail][1]}
              alt=""
            ></img>
            {/* unseen canvas */}
            <canvas
              className="Reference-canvas-container"
              style={{
                width: `${imageWidth}px`,
                height: `${imageHeight}px`,
                display: 'none',
                position: "absolute",
              }}
              ref={canvasDown}
              width={imageWidth + 'px'}
              height={imageHeight + 'px'}
            >
            </canvas>
            <canvas
              className="Reference-canvas-container"
              style={{
                width: `${currentWH[0] * currentScale}px`,
                height: `${currentWH[1] * currentScale}px`,
                left: `${currentMove[0]}px`,
                top: `${currentMove[1]}px`,
                objectFit: "contain",
                position: "absolute",
                backgroundColor: 'transparent',//透明的上层背景，使得下一层可以被看到
                zIndex: '1',

                display: display
              }}
              onClick={(e) => getColor(e)}
              onWheel={(e) => changeScale(e.deltaY)}
              onMouseDown={(e) => handleDragStart(e)}
              onMouseMove={(e) => handleDragMove(e)}
              onMouseUp={(e) => handleDragEnd(e)}
              width={currentWH[0] * currentScale}
              height={currentWH[1] * currentScale}
              ref={canvasTop}
            ></canvas>
          </div>
        </div>
        <div className="Reference-list">
          <div className="Reference-title" style={{ borderRadius: "4px" }}>
            <span>Reference Image List</span>
          </div>
          <div className="Reference-list-container">
            <div className="Reference-list-title">
              <div className="Reference-list-index-title">
                <span>Index</span>
              </div>
              <div className="Reference-list-score-title">
                <span>Score</span>
              </div>
              <div className="Reference-list-origin-title">
                <span>Original Painting</span>
              </div>
              <div className="Reference-list-heatmap-title">
                <span>Ideorealm Analysis</span>
              </div>
            </div>
            <div className="Reference-list-content" style={{display: display}}>
                {referenceItems}
                </div>
          </div>
        </div>
      </div>
    </div>
  );
};
