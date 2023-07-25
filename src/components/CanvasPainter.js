import { useEffect, useRef, useState } from "react";
import "./CanvasPainter.css";
import { adaptWH } from "./utils";
import { SelectButton } from "./SelectButton";

export const CanvasPainter = ({
  imgSrc,
  state,
  index,
  sharedMove,
  changeSharedMove,
  sharedScale,
  changeSharedScale,
  penColor,
  mode,
  setMode,
  queryList,
  changeList,
  queryIndex,
  setQueryIndex,
  penData,
  setPenData,
  visibility,
  canvasTop
}) => {

  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState([0, 0]);
  const [canvasOffset, setCanvasOffset] = useState([0, 0]);

  useEffect(() => {
    setCanvasSize([
      canvasRef.current?.clientWidth || 0,
      canvasRef.current?.clientHeight || 0,
    ]);
    setCanvasOffset([
      canvasRef.current?.offsetLeft || 0,
      canvasRef.current?.offsetTop || 0,
    ]);
  }, [canvasRef, state]);

  const canvasMid = useRef(null);
  const canvasDown = useRef(null);

  const canvasTemp = useRef(null);

  const ctxTop = canvasTop.current?.getContext('2d');
  const ctxMid = canvasMid.current?.getContext('2d');
  const ctxDown = canvasDown.current?.getContext('2d');

  const [currentWH, setCurrentWH] = useState([0, 0]);

  const [source, setSource] = useState([]);

  const imageWidth = 3167;
  const imageHeight = 3083;

  const [imageWH0, setImageWH0] = useState([currentWH[0], currentWH[1]]);
  const [imageLT0, setImageLT0] = useState([0, 0]);
  const [imageWH1, setImageWH1] = useState([currentWH[0], currentWH[1]]);
  const [imageLT1, setImageLT1] = useState([0, 0]);
  const [imageWH2, setImageWH2] = useState([currentWH[0], currentWH[1]]);
  const [imageLT2, setImageLT2] = useState([0, 0]);
  const [imageWH3, setImageWH3] = useState([currentWH[0], currentWH[1]]);
  const [imageLT3, setImageLT3] = useState([0, 0]);
  const [imageWH4, setImageWH4] = useState([currentWH[0], currentWH[1]]);
  const [imageLT4, setImageLT4] = useState([0, 0]);

  //todo
  const [d, setD] = useState('none');

  const inputImage = new Image();


  useEffect(() => {
    if (imgSrc !== "" && canvasSize[0] > 0) {
      //   inputImage = new Image();
      inputImage.src = imgSrc;
      inputImage.onload = () => {
        const tagSize = adaptWH(
          [inputImage.width, inputImage.height],
          canvasSize
        );
        const left = (canvasSize[0] - tagSize[0]) / 2;
        const top = (canvasSize[1] - tagSize[1]) / 2;
        setCurrentWH(tagSize);
        changeSharedMove([left, top]);

        const width = canvasMid.current?.width;
        const height = canvasMid.current?.height;
        // ctxDown.drawImage(inputImage, 0, 0, width, height);
        setCanvasSize(width, height);

        const ctx = canvasDown.current?.getContext('2d');
        ctx.drawImage(inputImage, 0, 0);
      };
    }
  }, [imgSrc, canvasSize, changeSharedMove, imageWidth, imageHeight]);

  // 拖拽 => 复用之前的代码 => 有时间的话加个移动边界限制
  const [isMaskDrag, setIsMaskDrag] = useState(false);
  const [maskMoveP, setMaskMoveP] = useState([0, 0]);

  // 画笔
  const [penMoveP, setPenMoveP] = useState([0, 0]);
  const [strokeRect, setStrokeRect] = useState([1000, 1000, 0, 0]);   //minx, miny, maxx, maxy
  const changeStrokeRect = (x, y) => {
    //自动调节stroke rect
    const minX = (x < strokeRect[0]) ? x : strokeRect[0];
    const minY = (y < strokeRect[1]) ? y : strokeRect[1];
    const maxX = (x > strokeRect[2]) ? x : strokeRect[2];
    const maxY = (y > strokeRect[3]) ? y : strokeRect[3];
    setStrokeRect([minX, minY, maxX, maxY]);
  };
  const [selectButtonTop, setSelectButtonTop] = useState(0);
  const [selectButtonLeft, setSelectButtonLeft] = useState(0);
  const [selectButtonDisplay, setSelectButtonDisplay] = useState('none');


  // 框选的起始和终止坐标
  const [rectMoveStartP, setRectMoveStartP] = useState([0, 0]);
  const [rectMoveEndP, setRectMoveEndP] = useState([0, 0]);

  //对应的框选
  useEffect(() => {
    if (queryIndex !== -1) {
      const ctx = canvasTop.current?.getContext('2d');
      ctx.clearRect(0, 0, canvasTop.current?.width, canvasTop.current?.height);
      ctx.strokeStyle = '#fff6dc';
      
      const location = queryList[queryIndex].location;
      ctx.strokeRect(...location);
      ctx.save();
      console.log(queryIndex);
    }
  }, [queryIndex, queryList]);


  const handleDragStart = (e) => {
    setIsMaskDrag(true);
    const rect = canvasMid.current?.getBoundingClientRect();
    if (!rect) return;
    let x = (e.clientX - rect.left) / (sharedScale * (currentWH[0] / 300));
    let y = (e.clientY - rect.top) / (sharedScale * (currentWH[1] / 150));
    ctxTop.clearRect(0, 0, canvasTop.current?.width, canvasTop.current?.height);
    switch (mode) {
      case -1: //拖拽
        setMaskMoveP([e.clientX, e.clientY]);
        break;
      case 0: //画笔
        setPenMoveP([x, y]);
        changeStrokeRect(x, y);
        ctxTop.clearRect(0, 0, canvasTop.current?.width, canvasTop.current?.height);
        break;
      case 1: //框选
        //初始化鼠标在canvas里面的坐标
        ctxMid.clearRect(0, 0, canvasMid.current?.width, canvasMid.current?.height);
        beforeSelect();
        break;
      case 3: //双框选。
        beforeSelect();
        break;
      default:
        break;
    }

    function beforeSelect() {
      setRectMoveStartP([x, y]);
      setRectMoveEndP([x, y]);
      setStrokeRect([1000, 1000, 0, 0]);
    }
  };

  const handleDragMove = (e) => {
    switch (mode) {
      case -1: //拖拽
        if (isMaskDrag) {
          if (e.clientX !== maskMoveP[0] || e.clientY !== maskMoveP[1]) {
            changeSharedMove([
              sharedMove[0] + e.clientX - maskMoveP[0],
              sharedMove[1] + e.clientY - maskMoveP[1],
            ]);
            setMaskMoveP([e.clientX, e.clientY]);
            ctxMid.save();
          }
        }
        break;
      case 0: //画笔
        if (isMaskDrag) {
          drawLine(canvasMid, ctxMid);
        }
        break;

      case 1: //框选
        if (isMaskDrag) {
          drawRect(canvasTop, ctxTop);
        }
        break;
      case 3: //双框选。
        if (isMaskDrag) {
          drawRect(canvasTop, ctxTop);
        }
        break;
      default:
        break;
    }

    function drawLine(canvas, ctx) {
      //获取当前鼠标坐标值
      const rect = canvas.current?.getBoundingClientRect();
      let x = (e.clientX - rect.left) / (sharedScale * (currentWH[0] / 300));
      let y = (e.clientY - rect.top) / (sharedScale * (currentWH[1] / 150));
      if (x !== penMoveP[0] || y !== penMoveP[1]) {
        ctx.strokeStyle = penColor;
        ctx.beginPath();
        ctx.moveTo(...penMoveP);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.stroke();
        setPenMoveP([x, y]);
        ctx.save();
        changeStrokeRect(x, y);
        console.log(currentWH);
      }
    }

    function drawRect(canvas, ctx) {
      //获取当前鼠标的坐标值（有bug）
      const rect = canvas.current?.getBoundingClientRect();
      let x = (e.clientX - rect.left) / (sharedScale * (currentWH[0] / 300));
      let y = (e.clientY - rect.top) / (sharedScale * (currentWH[1] / 150));
      ctx.clearRect(0, 0, canvas.current?.width, canvas.current?.height);
      if (x !== rectMoveEndP[0] || y !== rectMoveEndP[1]) {
        ctx.strokeStyle = '#fff6dc';
        let deltaX = rectMoveEndP[0] - rectMoveStartP[0];
        let deltaY = rectMoveEndP[1] - rectMoveStartP[1];
        ctx.strokeRect(...rectMoveStartP, deltaX, deltaY);
        setRectMoveEndP([x, y]);
        changeStrokeRect(x, y);
      }
    }
  };

  const handleDragEnd = (e) => {
    switch (mode) {
      case -1: //拖拽
        if (isMaskDrag) {
          setIsMaskDrag(false);
          setMaskMoveP([0, 0]);
        }
        break;
      case 0: //画笔
        if (isMaskDrag) {
          setIsMaskDrag(false);
          setPenMoveP([0, 0]);
          drawImage();
        }
        break;

      case 1: //框选
        //鼠标抬起后，将框选的区域矩形的图片保存，
        if (isMaskDrag) {
          setIsMaskDrag(false);
          const url = handleSelectEnd();
          //并添加到新队列中。
          if (queryList.length === 0 || queryList[queryList.length - 1].image !== '') {
            //下一次的query添加必须要在上次query的image-text对全部填充之后在进行。
            queryList.push({
              image: url,
              text: [],
              location: [...rectMoveStartP, rectMoveEndP[0] - rectMoveStartP[0], rectMoveEndP[1] - rectMoveStartP[1]]
            })
            changeList(JSON.parse(JSON.stringify(queryList)));
            setQueryIndex(queryList.length - 1);
          }
          //重置状态
          setRectMoveStartP([0, 0]);
          setRectMoveEndP([0, 0]);
        }
        break;
      case 3: //双框选。
        if (isMaskDrag) {
          setIsMaskDrag(false);
          drawImage();
          //启用右侧canvas的可框选特性。
          setMode(4);
        }
        break;
      default:
        setIsMaskDrag(false);
        break;
    }

    function handleSelectEnd() {
      setIsMaskDrag(false);

      let deltaX = rectMoveEndP[0] - rectMoveStartP[0];
      let deltaY = rectMoveEndP[1] - rectMoveStartP[1];

      //防止快速拖动使得宽高为0
      if (Math.abs(deltaX) < 1) deltaX = deltaX > 0 ? 1 : -1;
      if (Math.abs(deltaY) < 1) deltaY = deltaY > 0 ? 1 : -1;

      //先清除矩阵再进行截屏，防止有虚线矩形框在截图内的情况。
      ctxTop.clearRect(0, 0, canvasMid.current?.width, canvasMid.current?.height);

      const widthScale = imageWidth / 300.0;
      const heightScale = imageHeight / 150.0;

      const data = ctxDown.getImageData(rectMoveStartP[0]*widthScale, rectMoveStartP[1]*heightScale, deltaX*widthScale, deltaY*heightScale);
      console.log(data);

      canvasMid.width = deltaX;
      canvasMid.height = deltaY;

      //新建一个canvas对象存放截取的部分
      const newCanvas = document.createElement('canvas');
      const newCtx = newCanvas.getContext('2d');
      newCanvas.width = deltaX * widthScale;
      newCanvas.height = deltaY * heightScale;
      newCtx.putImageData(data, 0, 0);
      const url = newCanvas.toDataURL();

      setMode(-1);
      return url;
    };

    function drawImage() {
      //清屏
      ctxTop.clearRect(0, 0, canvasTop.current?.width, canvasTop.current?.height);
      ctxTop.strokeStyle = '#fff6dc';
      ctxTop.strokeRect(strokeRect[0], strokeRect[1],
        strokeRect[2] - strokeRect[0], strokeRect[3] - strokeRect[1]);
      
        //后续位置还需要仔细调整
      const rect = canvasMid.current?.getBoundingClientRect();
      const strokeRectTop = 150;
      const strokeRectLeft = 850;

      console.log(strokeRectTop, strokeRectLeft);
      setSelectButtonTop(strokeRectTop);
      setSelectButtonLeft(strokeRectLeft);
      setSelectButtonDisplay('flex');
    };
  };

  const layeredCanvas = (layer, canvasRef) => {
    return <canvas
      style={{
        width: `${currentWH[0] * sharedScale}px`,
        height: `${currentWH[1] * sharedScale}px`,
        position: "absolute",
        zIndex: `${layer}`,
        left: `${sharedMove[0]}px`,
        top: `${sharedMove[1]}px`,
      }}
      ref={canvasRef}
      onWheel={(e) => changeSharedScale(e.deltaY)}
      onMouseDown={(e) => handleDragStart(e)}
      onMouseMove={(e) => handleDragMove(e)}
      onMouseUp={(e) => handleDragEnd(e)}
    >
    </canvas>;
  };

  const unSeenCanvas = (canvasRef) => {
    return <canvas
      style={{
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        position: "absolute",
        display: 'none'
      }}
      ref={canvasRef}
      width={imageWidth + 'px'}
      height={imageHeight + 'px'} 
    >
    </canvas>;
  }

  return (
    <div className="CanvasPainter-container" ref={canvasRef}>
      <div className="Canvas-image">
        {/* 三个图层， 上层图层用来框选 */}
        {layeredCanvas(100, canvasTop)}
        {/* 中层用来画画。 */}
        {layeredCanvas(99, canvasMid)}
        {layeredCanvas(2, canvasTemp)}
        <img
        className="Image"
        style={{
            width: `${imageWH0[0] * sharedScale}px`,
            height: `${imageWH0[1] * sharedScale}px`,
            position: "absolute",
            zIndex: `2`,
            left: `${imageLT0[0]*sharedScale + sharedMove[0]}px`,
            top: `${imageLT0[1]*sharedScale + sharedMove[1]}px`,
            display: d
        }}
        src={source[0]}
        onWheel={(e) => changeSharedScale(e.deltaY)}
        onMouseDown={(e) => handleDragStart(e)}
        onMouseMove={(e) => handleDragMove(e)}
        onMouseUp={(e) => handleDragEnd(e)}
        ref={canvasTemp}
        alt=""
        />
        <img
        className="Image"
        style={{
            width: `${imageWH1[0] * sharedScale}px`,
            height: `${imageWH1[1] * sharedScale}px`,
            position: "absolute",
            zIndex: `2`,
            left: `${imageLT1[0]*sharedScale + sharedMove[0]}px`,
            top: `${imageLT1[1]*sharedScale + sharedMove[1]}px`,
            display: d
        }}
        src={source[1]}
        onWheel={(e) => changeSharedScale(e.deltaY)}
        onMouseDown={(e) => handleDragStart(e)}
        onMouseMove={(e) => handleDragMove(e)}
        onMouseUp={(e) => handleDragEnd(e)}
        ref={canvasTemp}
        alt=""
        />
        <img
        className="Image"
        style={{
            width: `${imageWH2[0] * sharedScale}px`,
            height: `${imageWH2[1] * sharedScale}px`,
            position: "absolute",
            zIndex: `2`,
            left: `${imageLT2[0]*sharedScale + sharedMove[0]}px`,
            top: `${imageLT2[1]*sharedScale + sharedMove[1]}px`,
            display: d
        }}
        src={source[2]}
        onWheel={(e) => changeSharedScale(e.deltaY)}
        onMouseDown={(e) => handleDragStart(e)}
        onMouseMove={(e) => handleDragMove(e)}
        onMouseUp={(e) => handleDragEnd(e)}
        ref={canvasTemp}
        alt=""
        />
        <img
        className="Image"
        style={{
            width: `${imageWH3[0] * sharedScale}px`,
            height: `${imageWH3[1] * sharedScale}px`,
            position: "absolute",
            zIndex: `2`,
            left: `${imageLT3[0]*sharedScale + sharedMove[0]}px`,
            top: `${imageLT3[1]*sharedScale + sharedMove[1]}px`,
            display: d
        }}
        src={source[3]}
        onWheel={(e) => changeSharedScale(e.deltaY)}
        onMouseDown={(e) => handleDragStart(e)}
        onMouseMove={(e) => handleDragMove(e)}
        onMouseUp={(e) => handleDragEnd(e)}
        ref={canvasTemp}
        alt=""
        />
        <img
        className="Image"
        style={{
            width: `${imageWH4[0] * sharedScale}px`,
            height: `${imageWH4[1] * sharedScale}px`,
            position: "absolute",
            zIndex: `2`,
            left: `${imageLT4[0]*sharedScale + sharedMove[0]}px`,
            top: `${imageLT4[1]*sharedScale + sharedMove[1]}px`,
            display: d
        }}
        src={source[4]}
        onWheel={(e) => changeSharedScale(e.deltaY)}
        onMouseDown={(e) => handleDragStart(e)}
        onMouseMove={(e) => handleDragMove(e)}
        onMouseUp={(e) => handleDragEnd(e)}
        ref={canvasTemp}
        alt=""
        />
        {/* 下层图层画背景 */}
        {unSeenCanvas(canvasDown)}
        <img src={imgSrc} alt="" 
        style={{
            width: `${currentWH[0] * sharedScale}px`,
            height: `${currentWH[1] * sharedScale}px`,
            position: "absolute",
            zIndex: '0',
            left: `${sharedMove[0]}px`,
            top: `${sharedMove[1]}px`,
          }}
          ref={canvasRef}
          onWheel={(e) => changeSharedScale(e.deltaY)}
          onMouseDown={(e) => handleDragStart(e)}
          onMouseMove={(e) => handleDragMove(e)}
          onMouseUp={(e) => handleDragEnd(e)}
        />
      </div>
      <div className="Buttons">
        <SelectButton
            canvasTop={canvasTop}
            ctxTop={ctxTop}
            ctxMid={ctxMid}
            ctxDown={ctxDown}
            canvasTemp={canvasTemp}
            strokeRect={strokeRect}
            setStrokeRect={setStrokeRect}
            penColor={penColor}
            top={selectButtonTop}
            left={selectButtonLeft}
            display={selectButtonDisplay}
            setDisplay={setSelectButtonDisplay}
            mode={mode}
            penData={penData}
            setPenData={setPenData}
            currentScale={sharedScale}
            source={source}
            setSource={setSource}
            setD={setD}
            setImageWH0={setImageWH0}
            setImageWH1={setImageWH1}
            setImageWH2={setImageWH2}
            setImageWH3={setImageWH3}
            setImageWH4={setImageWH4}
            setImageLT0={setImageLT0}
            setImageLT1={setImageLT1}
            setImageLT2={setImageLT2}
            setImageLT3={setImageLT3}
            setImageLT4={setImageLT4}
            currentWH={currentWH}
        />
      </div>
    </div>
  );
};
